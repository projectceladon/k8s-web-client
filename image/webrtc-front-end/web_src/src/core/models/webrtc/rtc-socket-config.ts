interface MsgPayloadProps {
  data: string;
  to: string;
}

export interface SocketConfig {
  url: string;
  clientType?: string;
  clientVersion?: string;
  isClient?: boolean;
}

export const socketConfig: SocketConfig = {
  url: `${document.location.protocol}//${process.env.REACT_APP_HOST_ENV}`,
  clientType: "Web",
  clientVersion: "4.2",
  isClient: true
};

export enum SocketEvent {
  Connect = "connect",
  Error = "connect_error",
  ConnectFail = "connect_fail",
  Disconnect = "disconnect",
  ServerDisconnect = "server-disconnect",
  ServerAuthenticated = "server-authenticated",
  OwtMsg = "owt-message",
  BuildP2PConnect = "build-p2p-connect",
  DisconnectInstance = "disconnect-instance"
}

export enum RTCSdpTypes {
  Offer = "offer",
  Candidates = "candidates",
  Answer = "answer"
}

export enum SignalingType {
  Started = "chat-started",
  Denied = "chat-denied",
  Closed = "chat-closed",
  NegotiationNeeded = "chat-negotiation-needed",
  TrackSources = "chat-track-sources",
  StreamInfo = "chat-stream-info",
  Sdp = "chat-signal",
  TracksAdded = "chat-tracks-added",
  TracksRemoved = "chat-tracks-removed",
  DataReceived = "chat-data-received",
  UA = "chat-ua"
}

export enum DataChannelMsgType {
  ASN = "ASN",
  StartAudioRec = "start-audio-rec",
  StartCamera = "start-camera-preview",
  StopAudioRec = "stop-audio-rec",
  StopCamera = "stop-camera-preview",
  StartGPS = "gps-start",
  StopGPS = "gps-stop"
}

export const rtcConfig: RTCConfiguration = {
  iceServers: [
    {
      urls: `stun:${process.env.REACT_APP_HOST_ENV}:3478`,
      credential: "password",
      username: "username"
    },
    {
      urls: [
        `turn:${process.env.REACT_APP_HOST_ENV}:3478?transport=tcp`,
        `turn:${process.env.REACT_APP_HOST_ENV}:3478?transport=udp`
      ],
      credential: "password",
      username: "username"
    }
  ]
};

export const msgPayload = (id: string, msg: object | string): MsgPayloadProps => {
  return {
    data: typeof msg === "string" ? msg : JSON.stringify(msg),
    to: id
  };
};

export const checkMessageSize = (data: object): boolean => {
  const MAX_MESSAGE_SIZE = 1073741824;
  return JSON.stringify(data).length > MAX_MESSAGE_SIZE;
};

export const touchInfo = {
  max_x: 32767,
  max_y: 32767
};
