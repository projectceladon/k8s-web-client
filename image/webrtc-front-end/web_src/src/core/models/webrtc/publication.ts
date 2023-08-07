export interface AudioConstraints {
  source: string;
  deviceId?: string;
}

export interface VideoConstraints extends AudioConstraints {
  resolution?: { width: number; height: number };
  frameRate?: number;
}

export interface StreamConstraints {
  audio: boolean | AudioConstraints;
  video: boolean | VideoConstraints;
}

export interface CustomStream {
  mediaStream?: MediaStream;
  source?: { audio?: string; video?: string; id: string; attributes: undefined };
}
