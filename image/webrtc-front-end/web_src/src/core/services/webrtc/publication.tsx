import { isEdge } from "../../../utils/browser";
import { create16UUID } from "../../../utils/create-uuid";
import { CustomStream, StreamConstraints, AudioConstraints, VideoConstraints } from "../../models/webrtc/publication";
import { SignalingType } from "../../models/webrtc/rtc-socket-config";
import { pcList, numDom } from "./peer-connection";
import { socketSend } from "./socket.io";

let localAudioStream: CustomStream;
let localVideoStream: CustomStream;
let localStream: CustomStream;

const isVideoConstrainsForScreenCast = (constraints: StreamConstraints): boolean => {
  return typeof constraints.video === "object" && constraints.video.source === "screen-cast";
};

const createMediaStream = (constraints: StreamConstraints): Promise<MediaStream> => {
  if (typeof constraints !== "object" || (!constraints.audio && !constraints.video)) {
    return Promise.reject(new TypeError("Invalid constrains."));
  }
  if (
    !isVideoConstrainsForScreenCast(constraints)
    && typeof constraints.audio === "object"
    && constraints.audio.source === "screen-cast"
  ) {
    return Promise.reject(new TypeError("Cannot share screen without video."));
  }
  if (
    isVideoConstrainsForScreenCast(constraints)
    && typeof constraints.audio === "object"
    && constraints.audio.source !== "screen-cast"
  ) {
    return Promise.reject(new TypeError("Cannot capture video from screen cast while capture audio from other source."));
  }
  if (!constraints.audio && !constraints.video) {
    return Promise.reject(new TypeError("At least one of audio and video must be requested."));
  }

  const mediaConstraints = Object.create({});
  if (typeof constraints.audio === "object" && constraints.audio.source === "mic") {
    mediaConstraints.audio = Object.create({
      // Add something
    });
    if (isEdge()) {
      mediaConstraints.audio.deviceId = constraints.audio.deviceId;
    } else {
      mediaConstraints.audio.deviceId = {
        exact: constraints.audio.deviceId
      };
    }
  } else {
    if (typeof constraints.audio === "object" && constraints.audio.source === "screen-cast") {
      mediaConstraints.audio = true;
    } else {
      mediaConstraints.audio = constraints.audio;
    }
  }
  if (typeof constraints.video === "object") {
    mediaConstraints.video = Object.create({
      // Add something
    });
    if (typeof constraints.video.frameRate === "number") {
      mediaConstraints.video.frameRate = constraints.video.frameRate;
    }
    if (constraints.video.resolution && constraints.video.resolution.width && constraints.video.resolution.height) {
      if (constraints.video.source === "screen-cast") {
        mediaConstraints.video.width = constraints.video.resolution.width;
        mediaConstraints.video.height = constraints.video.resolution.height;
      } else {
        mediaConstraints.video.width = Object.create({
          // Add something
        });
        mediaConstraints.video.width.exact = constraints.video.resolution.width;
        mediaConstraints.video.height = Object.create({
          // Add something
        });
        mediaConstraints.video.height.exact = constraints.video.resolution.height;
      }
    }
    if (typeof constraints.video.deviceId === "string") {
      mediaConstraints.video.deviceId = { exact: constraints.video.deviceId };
    }
  } else {
    mediaConstraints.video = constraints.video;
  }

  if (isVideoConstrainsForScreenCast(constraints)) {
    // Here is a bug of typescript, Prop getDisplayMedia is missing.
    return navigator.mediaDevices.getDisplayMedia(mediaConstraints);
  } else {
    return navigator.mediaDevices.getUserMedia(mediaConstraints);
  }
};

const sendStreamInfo = (stream: any, id: string): Promise<[void, void]> => {
  if (!stream || !stream.mediaStream) {
    return Promise.reject("Illegal argument.");
  }
  const info: { id: string; source: { audio?: string; video?: string; id: string; attributes: undefined } }[] = [];
  stream.mediaStream.getTracks().map((track: MediaStreamTrack): number => {
    return info.push({
      id: track.id,
      source: stream.source[track.kind]
    });
  });
  return Promise.all([
    socketSend(id, { type: SignalingType.TrackSources, data: info }).catch((err): void => console.log(err)),
    socketSend(id, {
      type: SignalingType.StreamInfo,
      data: {
        id: stream.mediaStream.id,
        attributes: stream.source!.attributes,
        tracks: Array.from(info, (item): string => item.id),
        source: stream.source
      }
    }).catch((err): void => console.log(err))
  ]);
};

export const publishLocalStream = (
  id: string,
  audioSource?: string,
  videoSource?: string,
  deviceId?: string,
  cameraResolution?: string
): void => {
  let audioConstraintsForMic: AudioConstraints;
  let videoConstraintsForCamera: VideoConstraints;
  let mediaStream: MediaStream;

  if (audioSource === "mic") {
    audioConstraintsForMic = { source: audioSource, deviceId: undefined };
  }
  if (videoSource === "camera") {
    videoConstraintsForCamera = {
      source: videoSource,
      deviceId,
      resolution: { width: 640, height: 480 },
      frameRate: 30
    };

    if (cameraResolution ==="1") {
      console.log("user requested for 480p");
      videoConstraintsForCamera.resolution = {
        width: 640,
        height: 480
      };
    } else if (cameraResolution === "2") {
      console.log("user requested for 720p");
      videoConstraintsForCamera.resolution = {
        width: 1280,
        height: 720
      };
    } else if (cameraResolution === "4") {
      console.log("user Requested for 1080p");
      videoConstraintsForCamera.resolution = {
        width: 1920,
        height: 1080
      };
    }
  }

  console.log(`${publishLocalStream.name}: audioSource: ${audioSource}, videoSource: ${videoSource}`);

  const constraints = (): StreamConstraints => {
    return {
      audio: audioConstraintsForMic,
      video: videoConstraintsForCamera
    } as StreamConstraints;
  };

  createMediaStream(constraints()).then(
    (stream): void => {
      mediaStream = stream;
      if (audioSource === undefined) {
        localVideoStream = {
          mediaStream,
          source: { audio: audioSource, video: videoSource, id: create16UUID(), attributes: undefined }
        };
        localStream = localVideoStream;
      } else if (videoSource === undefined) {
        localAudioStream = {
          mediaStream,
          source: { audio: audioSource, video: videoSource, id: create16UUID(), attributes: undefined }
        };
        localStream = localAudioStream;
      }

      console.log(`${publishLocalStream.name}: Local media stream created. Id: ${localStream.mediaStream!.id}`);
      mediaStream.getVideoTracks().forEach((track): void => {
        track.contentHint = "detail";
      });

      sendStreamInfo(localStream, id).then(
        (): Promise<void> => {
          return new Promise(
            async (): Promise<void> => {
              // Replace |addStream| with PeerConnection.addTrack when all browsers are ready.
              for (const track of stream.getTracks()) {
                pcList[numDom].addTrack(track, stream);
              }
              await pcList[numDom].setLocalDescription(await pcList[numDom].createOffer());
              socketSend(id, {
                type: SignalingType.Sdp,
                data: pcList[numDom].localDescription
              }).catch((err): void => console.log(err));
            }
          );
        }
      );
    },
    (err: Error): void => console.log(`${publishLocalStream.name}: Failed to create media stream, error: ${err}`)
  );
  console.log(`${publishLocalStream.name}: out`);
};

export const stopPublication = (): void => {
  if (localStream && localStream.mediaStream) {
    for (const track of localStream.mediaStream!.getTracks()) {
      console.log(`Stop publication: Track id: ${track.id}`);
      console.log(`Stop publication: Track kind: ${track.kind}`);
      console.log(`Stop publication: Track label: ${track.label}`);
      track.stop();
    }
    localStream.mediaStream = undefined;
  }
};
