import { isFirefox } from "../../../utils/browser";
import { create16UUID } from "../../../utils/create-uuid";
import { setRtpReceiverOption, setRtpSenderOptions, setCodecOrder } from "../../../utils/for-webrtc";
import { isJson } from "../../../utils/is-json";
import { CustomStream } from "../../models/webrtc/publication";
import { SignalingType, DataChannelMsgType, rtcConfig } from "../../models/webrtc/rtc-socket-config";
import { getLocation } from "./gps";
import { publishLocalStream, stopPublication } from "./publication";
import { remoteInput } from "./remote-input";
import { socketCount, socketDisconnect, socketSend, wsServer } from "./socket.io";

export let numDom = 0;
export let isNegotiationNeeded = false;
export let addedTrackIds: string[] = [];
export const remoteIceCandidates: RTCIceCandidate[] = [];
export const dataChannels = new Map();
export const pcList: RTCPeerConnection[] = [];
export const pendingMessages: string[] = [];

let id = "";
let gpsInterval: NodeJS.Timer;
const cameraDeviceId: string[] = [];
const dcList: RTCDataChannel[] = [];
const pendingStreams: CustomStream[] = [];
const remoteStreams: CustomStream[] = [];
const publishingStreams: CustomStream[] = [];
const pendingUnpublishStreams: CustomStream[] = [];
const remoteStreamInfo = new Map();
const publishedStreams = new Map();
const remoteTrackSourceInfo = new Map();
const publishPromises = new Map();
const unpublishPromises = new Map();
const publishingStreamTracks = new Map();
const publishedStreamTracks = new Map();

const getCameraHwCapability = (): void => {
  navigator.mediaDevices?.enumerateDevices()
    .then((devices): void => {
    // Filter only camera devices.
      const cameras = devices.filter((device): boolean => device.kind === "videoinput");
      console.log("Number of camera(s) available in the device = " + cameras.length);

      const params = { numOfCameras: 0, camOrientation: ["NULL"], camFacing: ["NULL"], maxCameraRes: ["NULL"] };
      if (cameras.length > 0) {
        params.numOfCameras = cameras.length;
      }

      for (let i = 0; i < cameras.length; i++) {
      // Update the camera device ID that needs to be used while camera switching.
        cameraDeviceId[i] = cameras[i].deviceId;
        console.log("Camera " + i + ": " + cameras[i].label + " and its Id = " + cameras[i].deviceId);

        // Update NULL value since camOrientation and camFacing are not applicable for
        // Linux and Windows clients, but applicable for Android clients.
        params.camOrientation[i] = "NULL";
        params.camFacing[i] = "NULL";
        // TODO: Need to find out a way to get max supported resolution for each camera(s).
        params.maxCameraRes[i] = "NULL";
      }
      const msg = JSON.stringify({
        id,
        data: JSON.stringify({
          type: "control",
          data: {
            event: "camerainfo",
            parameters: params
          }
        })
      });
      dcList[numDom].send(msg);
    })
    .catch((err): void => {
      console.log(err.name + ": " + err.message);
    });
};

export const stopConnection = (): void => {
  if (pcList.length && pcList[0] && pcList[0].connectionState !== "closed") {
    pcList[0].close();
  }

  if (wsServer[socketCount]) {
    socketDisconnect(id);
    socketSend(id, { type: SignalingType.Closed });
    console.log("Chat closed");
    wsServer[socketCount].close();
  }

  if (dataChannels.has("message")) {
    dataChannels.clear();
  }
};


const unpublish = (stream: CustomStream): Promise<void> => {
  if (!publishedStreams.has(stream)) {
    return Promise.reject("Illegal argument.");
  }
  pendingUnpublishStreams.push(stream);
  return new Promise((resolve, reject): void => {
    if (stream.mediaStream) {
      unpublishPromises.set(stream.mediaStream.id, {
        resolve,
        reject
      });
    }
    drainPendingStreams();
  });
};

const createAndSendOffer = (): void => {
  if (!pcList[numDom]) {
    return;
  }

  isNegotiationNeeded = false;
  let localDesc: RTCSessionDescriptionInit;

  pcList[numDom]
    .createOffer()
    .then((desc): Promise<void> | undefined => {
      desc.sdp = setRtpReceiverOption(desc.sdp);
      localDesc = desc;
      if (pcList[numDom].signalingState === "stable") {
        return pcList[numDom].setLocalDescription(desc).then(
          (): Promise<void> => {
            return socketSend(id, { type: SignalingType.Sdp, data: localDesc });
          }
        );
      }
    })
    .catch((): void => {
      stopConnection();
    });
};

const createAndSendAnswer = (): void => {
  drainPendingStreams();
  isNegotiationNeeded = false;

  let localDesc: RTCSessionDescriptionInit;
  pcList[numDom]
    .createAnswer()
    .then((desc): Promise<void> | undefined => {
      desc.sdp = setRtpReceiverOption(desc.sdp);
      localDesc = desc;

      console.log("Current description: " + JSON.stringify(pcList[numDom].currentLocalDescription));
      console.log("Pending description: " + JSON.stringify(pcList[numDom].pendingLocalDescription));
      return pcList[numDom].setLocalDescription(desc);
    })
    .then(
      (): Promise<void> => {
        return socketSend(id, { type: SignalingType.Sdp, data: localDesc });
      }
    )
    .catch((): void => {
      stopConnection();
    });
};

export const onNegotiationNeeded = (): void => {
  if (pcList[numDom].signalingState === "stable") {
    createAndSendOffer();
  } else {
    isNegotiationNeeded = true;
  }
};

export const bindEventsToDataChannel = (dc: RTCDataChannel): void => {
  dc.onmessage = (event): void => {
    // For debugger;
    console.log(JSON.parse(event.data).data);

    let jsonObj;
    if (isJson(JSON.parse(event.data).data)) {
      jsonObj = JSON.parse(JSON.parse(event.data).data);
    }

    let curPkg;
    let newPkg;

    if (jsonObj) {
      switch (jsonObj.key) {
      case DataChannelMsgType.ASN:
        curPkg = jsonObj.cur.pkg;
        newPkg = jsonObj.new.pkg;

        if (curPkg !== newPkg) {
          if (newPkg.includes("sensor")) {
            console.log("Sensor app is launched.");
            dc.send(JSON.stringify({ id, data: "start-sensor-feed" }));
          } else if (curPkg.includes("sensor")) {
            console.log("Sensor app exit.");
            dc.send(JSON.stringify({ id, data: "start-sensor-feed" }));
          }
        }
        break;
      case DataChannelMsgType.StartAudioRec:
        console.log("Start audio stream is requested.");
        publishLocalStream(id, "mic", undefined);
        break;
      case DataChannelMsgType.StartCamera:
        console.log("Start camera stream is requested.");
        publishLocalStream(id, undefined, "camera", cameraDeviceId[parseInt(jsonObj.cameraId)], jsonObj.cameraRes);
        break;
      case DataChannelMsgType.StopAudioRec:
        stopPublication();
        console.log("Stop audio stream is requested.");
        break;
      case DataChannelMsgType.StopCamera:
        stopPublication();
        console.log("Stop camera stream is requested.");
        break;
      case DataChannelMsgType.StartGPS:
        console.log("Start loop location.");
        gpsInterval = setInterval((): void => getLocation(id, dc), 1000);
        break;
      case DataChannelMsgType.StopGPS:
        console.log("Stop loop location.");
        clearInterval(gpsInterval);
      }
    }
  };

  dc.onopen = (): void => {
    dc.send(JSON.stringify({ id, data: "start" }));

    const video = document.getElementById(id) as HTMLVideoElement;
    if (dc && video) {
      remoteInput(id, video, dc);
    }
  };

  dc.onclose = (): void => {
    console.log("The Data Channel is Closed.");
    stopConnection();
  };

  dc.onerror = (error): void => {
    console.log(`Data Channel Error: ${JSON.stringify(error)}`);
  };
};

// Make sure |_pc| is available before calling this method.
export const createDataChannel = (label: string): void => {
  if (dataChannels.get(numDom) && dataChannels.has(label)) {
    console.log(`Data channel labeled ${label} already exists.`);
    return;
  }
  if (!pcList[numDom]) {
    console.log("PeerConnection is not available before creating DataChannel.");
    return;
  }
  console.log("Create data channel.");
  dcList[numDom] = pcList[numDom].createDataChannel(label);
  bindEventsToDataChannel(dcList[numDom]);
  dataChannels.set("message", numDom);
  onNegotiationNeeded();
};

export const drainPendingMessages = (): void => {
  console.log("Draining pending messages.");
  dataChannels.get(dcList[numDom]);
  if (pcList[numDom] && !dcList[numDom]) {
    createDataChannel("message");
  }
};

export const drainPendingStreams = (): void => {
  let negotiationNeeded = false;
  console.log("Draining pending messages.");
  if (pcList[numDom] && pcList[numDom].signalingState === "stable") {
    console.log("Peer connection is ready for draining pending streams.");
    for (let i = 0; i < pendingStreams.length; i++) {
      const stream = pendingStreams[i];
      // OnNegotiationNeeded event will be triggered immediately after adding stream to PeerConnection in Firefox.
      // And OnNegotiationNeeded handler will execute drainPendingStreams. To avoid add the same stream multiple times,
      // shift it from pending stream list before adding it to PeerConnection.
      pendingStreams.shift();
      if (!stream.mediaStream) {
        continue;
      }
      for (const track of stream.mediaStream.getTracks()) {
        pcList[numDom].addTrack(track, stream.mediaStream);
        negotiationNeeded = true;
      }
      console.log("Added stream to peer connection.");
      publishingStreams.push(stream);
    }
    pendingStreams.length = 0;
    for (let j = 0; j < pendingUnpublishStreams.length; j++) {
      if (!pendingUnpublishStreams[j].mediaStream) {
        continue;
      }
      pcList[numDom].removeTrack(pendingUnpublishStreams[j].mediaStream as unknown as RTCRtpSender);
      negotiationNeeded = true;
      unpublishPromises.get(pendingUnpublishStreams[j]?.mediaStream?.id).resolve();
      publishedStreams.delete(pendingUnpublishStreams[j]);
      console.log("Remove stream.");
    }
    pendingUnpublishStreams.length = 0;
  }
  if (negotiationNeeded) {
    onNegotiationNeeded();
  }
};

const onOffer = (sdp: RTCSessionDescriptionInit): void => {
  console.log("About to set remote description. Signaling state: " + pcList[numDom].signalingState);
  sdp.sdp = setRtpSenderOptions(sdp.sdp, rtcConfig);
  // Firefox only has one codec in answer, which does not truly reflect its
  // decoding capability. So we set codec preference to remote offer, and let
  // Firefox choose its preferred codec.
  // Reference: https://bugzilla.mozilla.org/show_bug.cgi?id=814227.
  if (isFirefox()) {
    sdp.sdp = setCodecOrder(sdp.sdp);
  }
  const sessionDescription = new RTCSessionDescription(sdp);
  pcList[numDom].setRemoteDescription(sessionDescription).then(
    (): void => {
      createAndSendAnswer();
    },
    (error): void => {
      console.log("Set remote description failed. Message: " + error.message);
      stopConnection();
    }
  );
};

const onAnswer = (sdp: RTCSessionDescriptionInit): void => {
  console.log("About to set remote description. Signaling state: " + pcList[numDom].signalingState);
  sdp.sdp = setRtpSenderOptions(sdp.sdp, rtcConfig);
  const sessionDescription = new RTCSessionDescription(sdp);
  pcList[numDom].setRemoteDescription(new RTCSessionDescription(sessionDescription)).then(
    (): void => {
      console.log("Set remote description successfully.");
      drainPendingMessages();
    },
    (error): void => {
      console.log("Set remote description failed. Message: " + error.message);
      stopConnection();
    }
  );
};

const onRemoteIceCandidate = (candidateInfo: RTCIceCandidate): void => {
  const candidate = new RTCIceCandidate({
    candidate: candidateInfo.candidate,
    sdpMid: candidateInfo.sdpMid,
    sdpMLineIndex: candidateInfo.sdpMLineIndex
  });
  if (pcList[numDom].remoteDescription && pcList[numDom].remoteDescription!.sdp !== "") {
    console.log("Add remote ice candidates.");
    pcList[numDom].addIceCandidate(candidate).catch((error): void => {
      console.log("Error processing ICE candidate: " + error);
    });
  } else {
    console.log("Cache remote ice candidates.");
    remoteIceCandidates.push(candidate);
  }
};

const sdpHandler = (sdp: any): void => {
  switch (sdp.type) {
  case "offer":
    onOffer(sdp);
    break;
  case "answer":
    onAnswer(sdp);
    break;
  case "candidates":
    onRemoteIceCandidate(sdp);
  }
};

const doGetStats = async (mediaStreamTrack: MediaStreamTrack, reportsResult: RTCStatsReport[]): Promise<void> => {
  const statsReport = await pcList[numDom].getStats(mediaStreamTrack);
  reportsResult.push(statsReport);
};

const getStats = async (mediaStream: MediaStream): Promise<RTCStatsReport | RTCStatsReport[]> => {
  if (pcList[numDom]) {
    if (mediaStream === undefined) {
      return pcList[numDom].getStats();
    } else {
      const tracksStatsReports: RTCStatsReport[] = [];
      await Promise.all([
        mediaStream.getTracks().forEach((track: MediaStreamTrack): void => {
          doGetStats(track, tracksStatsReports);
        })
      ]);
      return new Promise((resolve, reject): void => {
        resolve(tracksStatsReports);
        reject();
      });
    }
  } else {
    return Promise.reject("Invalid peer state.");
  }
};

const trackSourcesHandler = (data: any): void => {
  for (const info of data) {
    remoteTrackSourceInfo.set(info.id, info.source);
  }
};

const streamInfoHandler = (data: any): void => {
  if (!data) {
    console.log("Unexpected stream info.");
    return;
  }
  remoteStreamInfo.set(data.id, {
    source: data.source,
    attributes: data.attributes,
    stream: null,
    mediaStream: null,
    trackIds: data.tracks
  });
};

const tracksAddedHandler = (ids: string): void => {
  for (const id of ids) {
    // It could be a problem if there is a track published with different MediaStreams.
    publishingStreamTracks.forEach((mediaTrackIds, mediaStreamId): Promise<void> | undefined => {
      for (let i = 0; i < mediaTrackIds.length; i++) {
        if (mediaTrackIds[i] === id) {
          // Move this track from publishing tracks to published tracks.
          if (!publishedStreamTracks.has(mediaStreamId)) {
            publishedStreamTracks.set(mediaStreamId, []);
          }
          publishedStreamTracks.get(mediaStreamId).push(mediaTrackIds[i]);
          mediaTrackIds.splice(i, 1);
        }
        // Resolving certain publish promise when remote endpoint received all tracks of a MediaStream.
        if (mediaTrackIds.length === 0) {
          if (!publishPromises.has(mediaStreamId)) {
            console.log("Cannot find the promise for publishing " + mediaStreamId);
            continue;
          }
          const targetStreamIndex = publishingStreams.findIndex(
            (element): boolean => element.mediaStream?.id === mediaStreamId
          );
          const targetStream = publishingStreams[targetStreamIndex];
          if (!targetStream || !targetStream.mediaStream) {
            return Promise.reject("Publication is not available.");
          }
          const state = getStats(targetStream.mediaStream);
          publishingStreams.splice(targetStreamIndex, 1);
          const publication = { id: id ? id : create16UUID(), getStats: state, stop: unpublish(targetStream) };
          publishedStreams.set(targetStream, publication);
          publishPromises.get(mediaStreamId).resolve(publication);
          publishPromises.delete(mediaStreamId);
        }
      }
    });
  }
};

const tracksRemovedHandler = (ids: string): void => {
  for (const id of ids) {
    // It could be a problem if there is a track published with different MediaStreams.
    publishedStreamTracks.forEach((mediaTrackIds): void => {
      for (let i = 0; i < mediaTrackIds.length; i++) {
        if (mediaTrackIds[i] === id) {
          mediaTrackIds.splice(i, 1);
        }
      }
    });
  }
};

export const messageHandler = (message: { data: string; type: string }): void => {
  const messageObj = JSON.parse(message.data);
  switch (messageObj.type) {
  case SignalingType.Sdp:
    sdpHandler(messageObj.data);
    // For Debugger.
    console.log(`Channel received message: ${JSON.stringify(messageObj)}`);
    break;
  case SignalingType.UA:
    // Should do anything else ?
    break;
  case SignalingType.TrackSources:
    trackSourcesHandler(messageObj.data);
    break;
  case SignalingType.StreamInfo:
    streamInfoHandler(messageObj.data);
    break;
  case SignalingType.TracksAdded:
    tracksAddedHandler(messageObj.data);
    break;
  case SignalingType.TracksRemoved:
    tracksRemovedHandler(messageObj.data);
    break;
  case SignalingType.Closed:
    // For Debugger.
    console.log(`Channel received message: ${JSON.stringify(messageObj)}`);
    // Should do anything else ?
    break;
  case SignalingType.DataReceived:
    // For Debugger.
    // console.log(sysMsg.socketMsg.ReceivedMsg + JSON.stringify(messageObj));
    break;
  default:
  }
};

const setStreamToRemoteStreamInfo = (mediaStream: MediaStream): void => {
  const info = remoteStreamInfo.get(mediaStream.id);
  const attributes = info.attributes;
  const sourceInfo = {
    audio: remoteStreamInfo.get(mediaStream.id).source.audio,
    video: remoteStreamInfo.get(mediaStream.id).source.video
  };
  info.stream = {
    origin: id,
    id: create16UUID(),
    mediaStream,
    source: sourceInfo,
    attributes
  };
  info.mediaStream = mediaStream;
  const stream = info.stream;
  if (stream) {
    remoteStreams.push(stream);
  } else {
    console.log("Failed to create RemoteStream.");
  }
};

const streamRemoved = (stream: CustomStream): void => {
  if (!remoteStreamInfo.has(stream.mediaStream?.id)) {
    console.log("Cannot find stream info.");
    return;
  }
  socketSend(id, {
    type: SignalingType.TracksRemoved,
    data: remoteStreamInfo.get(stream.mediaStream?.id).trackIds
  });
};

const areAllTracksEnded = (mediaStream: MediaStream): boolean => {
  for (const track of mediaStream.getTracks()) {
    if (track.readyState === "live") {
      return false;
    }
  }
  return true;
};

const onRemoteStreamRemoved = (event: { stream: MediaStream }): void => {
  console.log("Remove stream.");
  const i = remoteStreams.findIndex((s): boolean => {
    return s.mediaStream?.id === event.stream.id;
  });
  if (i !== -1) {
    const stream = remoteStreams[i];
    streamRemoved(stream);
    remoteStreams.splice(i, 1);
  }
};

const getStreamByTrack = (mediaStreamTrack: EventTarget | null): MediaStream[] => {
  const streams = [];
  for (const [, /* id */ info] of remoteStreamInfo) {
    if (!info.stream || !info.stream.mediaStream) {
      continue;
    }
    for (const track of info.stream.mediaStream.getTracks()) {
      if (mediaStreamTrack === track) {
        streams.push(info.stream.mediaStream);
      }
    }
  }
  return streams;
};

export const checkIceConnectionStateAndFireEvent = (): void => {
  if (pcList[numDom].iceConnectionState === "connected" || pcList[numDom].iceConnectionState === "completed") {
    for (const [, /* id */ info] of remoteStreamInfo) {
      if (info.mediaStream) {
        for (const track of info.mediaStream.getTracks()) {
          track.addEventListener("ended", (event: Event): void => {
            const mediaStreams = getStreamByTrack(event.target);
            for (const mediaStream of mediaStreams) {
              if (areAllTracksEnded(mediaStream)) {
                onRemoteStreamRemoved({ stream: mediaStream });
              }
            }
          });
        }
        socketSend(id, { type: SignalingType.TracksAdded, data: info.trackIds });
        remoteStreamInfo.get(info.mediaStream.id).mediaStream = null;
      }
    }
  }
};

// eslint-disable-next-line @typescript-eslint/ban-types
export const createPeerConnection = (
  remoteId: string,
  index: number,
  setError: React.Dispatch<React.SetStateAction<string>>
): void => {
  id = remoteId;
  numDom = index;

  pcList[numDom] = new RTCPeerConnection(rtcConfig);

  pcList[numDom].ontrack = (event): void => {
    console.log("Remote track added.");
    for (const stream of event.streams) {
      if (!remoteStreamInfo.has(stream.id)) {
        console.log("Missing stream info.");
        return;
      }
      if (!remoteStreamInfo.get(stream.id).stream) {
        setStreamToRemoteStreamInfo(stream);
      }
    }
    if (pcList[numDom].iceConnectionState === "connected" || pcList[numDom].iceConnectionState === "completed") {
      checkIceConnectionStateAndFireEvent();
    } else {
      addedTrackIds.concat(event.track.id);
    }

    const video = document.getElementById(remoteId) as HTMLVideoElement;

    if (video) {
      video.srcObject = event.streams[0];
      getCameraHwCapability();
    }
  };

  pcList[numDom].onicecandidate = (event): void => {
    if (event.candidate) {
      socketSend(remoteId, {
        type: SignalingType.Sdp,
        data: event.candidate
      }).catch((): void => {
        console.log("Failed to send candidate.");
        setError("Failed to send candidate.");
      });
    } else {
      console.log("Empty candidate.");
      setError("Empty candidate.");
    }
  };

  pcList[numDom].onsignalingstatechange = (): void => {
    console.log("Signaling state changed: " + pcList[numDom].signalingState);
    if (pcList[numDom].signalingState === "have-remote-offer" || pcList[numDom].signalingState === "stable") {
      for (let i = 0; i < remoteIceCandidates.length; i++) {
        console.log("Add remote ice candidates.");
        pcList[numDom].addIceCandidate(remoteIceCandidates[i]).catch((error): void => {
          console.log("Error processing ICE candidate: " + error);
        });
      }
      remoteIceCandidates.length = 0;
    }
    if (pcList[numDom].signalingState === "stable") {
      if (isNegotiationNeeded) {
        onNegotiationNeeded();
      } else {
        drainPendingStreams();
        drainPendingMessages();
      }
    }
  };

  pcList[numDom].ondatachannel = (event): void => {
    console.log("On data channel.");
    // Save remote created data channel.
    if (!dataChannels.has(event.channel.label)) {
      dataChannels.set(event.channel.label, event.channel);
      console.log("Save remote created data channel.");
    }
    bindEventsToDataChannel(event.channel);
  };

  pcList[numDom].oniceconnectionstatechange = (): void => {
    switch (pcList[numDom].iceConnectionState) {
    case "closed":
    case "failed":
      stopConnection();
      break;
    case "connected":
    case "completed":
      socketSend(remoteId, { type: SignalingType.TracksAdded, data: addedTrackIds });
      addedTrackIds = [];
      checkIceConnectionStateAndFireEvent();
    }
  };

  pcList[numDom].onconnectionstatechange = (): void => {
    const webrtcState = pcList[numDom].connectionState;
    switch (webrtcState) {
    case "closed":
    case "disconnected":
    case "failed":
      stopConnection();
      break;
    case "new":
    case "connected":
      setError("");
      break;
    case "connecting":
    }
    console.log("WebRTC State: " + webrtcState);
  };
};
