const audioCodecAllowList = ["CN", "telephone-event"];
const videoCodecAllowList = ["red", "ulpfec", "flexfec"];

// Split an fmtp line into an object including 'pt' and 'params'.
const parseFmtpLine = (fmtpLine: string): { pt: string; params: object } | null => {
  const fmtpObj: { pt: string; params: object } = { pt: "", params: {} };
  const spacePos = fmtpLine.indexOf(" ");
  const keyValues = fmtpLine.substring(spacePos + 1).split(";");

  const pattern = new RegExp("a=fmtp:(\\d+)");
  const result = fmtpLine.match(pattern);
  if (result && result.length === 2) {
    fmtpObj.pt = result[1];
  } else {
    return null;
  }

  const paramsObj: { [key: string]: string } = {};

  for (let i = 0; i < keyValues.length; ++i) {
    const pair = keyValues[i].split("=");

    if (pair.length === 2) {
      paramsObj[pair[0]] = pair[1];
    }
  }
  fmtpObj.params = paramsObj;

  return fmtpObj;
};

// Gets the codec payload type from an a=rtpmap:X line.
const getCodecPayloadTypeFromLine = (sdpLine: string): string | null => {
  const pattern = new RegExp("a=rtpmap:(\\d+) [a-zA-Z0-9-]+\\/\\d+");
  const result = sdpLine.match(pattern);
  return result && result.length === 2 ? result[1] : null;
};

// Find the line in sdpLines[startLine...endLine - 1] that starts with |prefix|
// and, if specified, contains |substr| (case-insensitive search).
const findLineInRange = (
  sdpLines: string[],
  startLine: number,
  endLine: number,
  prefix: string,
  substr?: string | boolean
): number | null => {
  const realEndLine = endLine !== -1 ? endLine : sdpLines.length;
  for (let i = startLine; i < realEndLine; ++i) {
    if (sdpLines[i].indexOf(prefix) === 0) {
      if (!substr || (substr && sdpLines[i].toLowerCase().indexOf(substr.toString().toLowerCase()) !== -1)) {
        return i;
      }
    }
  }
  return null;
};

// Find the line in sdpLines that starts with |prefix|, and, if specified,
// contains |substr| (case-insensitive search).
const findLine = (sdpLines: string[], prefix: string, substr?: string | boolean): number | null => {
  return findLineInRange(sdpLines, 0, -1, prefix, substr);
};

// Find m-line and next m-line with give mid, return { start, end }.
const findMLineRangeWithMID = (sdpLines: string[], mid: string): { start: number; end: number } | null => {
  const midLine = "a=mid:" + mid;
  let midIndex = findLine(sdpLines, midLine);
  // Compare the whole line since findLine only compares prefix
  while (midIndex && midIndex >= 0 && sdpLines[midIndex] !== midLine) {
    midIndex = findLineInRange(sdpLines, midIndex, -1, midLine);
  }
  if (midIndex && midIndex >= 0) {
    // Found matched a=mid line
    const nextMLineIndex = findLineInRange(sdpLines, midIndex, -1, "m=") || -1;
    let mLineIndex = -1;
    for (let i = midIndex; i >= 0; i--) {
      if (sdpLines[i].indexOf("m=") >= 0) {
        mLineIndex = i;
        break;
      }
    }
    if (mLineIndex >= 0) {
      return {
        start: mLineIndex,
        end: nextMLineIndex
      };
    }
  }
  return null;
};

// Append RTX payloads for existing payloads.
const appendRtxPayloads = (sdpLines: string[], payloads: string[]): string[] => {
  for (const payload of payloads) {
    const index = findLine(sdpLines, "a=fmtp", "apt=" + payload);
    if (index !== null) {
      const fmtpLine = parseFmtpLine(sdpLines[index]);
      if (fmtpLine) {
        payloads.push(fmtpLine.pt);
      }
    }
  }
  return payloads;
};

// Remove a codec with all its associated a lines.
const removeCodecFrameALine = (sdpLines: string[], payload: string): string[] => {
  const pattern = new RegExp(`a=(rtpmap|rtcp-fb|fmtp):${payload}\\s`);
  for (let i = sdpLines.length - 1; i > 0; i--) {
    if (sdpLines[i].match(pattern)) {
      sdpLines.splice(i, 1);
    }
  }
  return sdpLines;
};

// Returns a new m= line with the specified codec order.
const makeCodecOrder = (mLine: string, payloads: string[]): string => {
  const elements = mLine.split(" ");

  // Just copy the first three parameters; codec order starts on fourth.
  let newLine = elements.slice(0, 3);

  // Concat payload types.
  newLine = newLine.concat(payloads);

  return newLine.join(" ");
};

// Reorder codecs in m-line according the order of |codecs|. Remove codecs from
// m-line if it is not present in |codecs|
// Applied on specific m-line if mid is presented
// The format of |codec| is 'NAME/RATE', e.g. 'opus/48000'.
const reorderCodecs = (sdp?: string, type?: string, codecs?: string[], mid?: string): string | undefined => {
  if (!codecs || codecs.length === 0) {
    return sdp;
  }

  codecs = type === "audio" ? codecs.concat(audioCodecAllowList) : codecs.concat(videoCodecAllowList);

  let sdpLines = sdp!.split("\r\n");
  let headLines = null;
  let tailLines = null;
  if (typeof mid === "string") {
    const midRange = findMLineRangeWithMID(sdpLines, mid);
    if (midRange) {
      const { start, end } = midRange;
      headLines = sdpLines.slice(0, start);
      tailLines = sdpLines.slice(end);
      sdpLines = sdpLines.slice(start, end);
    }
  }

  // Search for m line.
  const mLineIndex = findLine(sdpLines, "m=", type);
  if (mLineIndex === null) {
    return sdp;
  }

  const originPayloads = sdpLines[mLineIndex].split(" ");
  originPayloads.splice(0, 3);

  // If the codec is available, set it as the default in m line.
  let payloads = [];
  for (const codec of codecs) {
    for (let i = 0; i < sdpLines.length; i++) {
      const index = findLineInRange(sdpLines, i, -1, "a=rtpmap", codec);
      if (index !== null) {
        const payload = getCodecPayloadTypeFromLine(sdpLines[index]);
        if (payload) {
          payloads.push(payload);
          i = index;
        }
      }
    }
  }
  payloads = appendRtxPayloads(sdpLines, payloads);
  sdpLines[mLineIndex] = makeCodecOrder(sdpLines[mLineIndex], payloads);

  // Remove a lines.
  for (const payload of originPayloads) {
    if (payloads.indexOf(payload) === -1) {
      sdpLines = removeCodecFrameALine(sdpLines, payload);
    }
  }

  if (headLines) {
    sdpLines = headLines.concat(sdpLines).concat(tailLines ? tailLines : []);
  }
  sdp = sdpLines.join("\r\n");
  return sdp;
};

export function setCodecOrder(sdp?: string): string | undefined {
  const audioCodecNames = Array.from([]);
  sdp = reorderCodecs(sdp, "audio", audioCodecNames);
  const videoCodecNames = Array.from([]);
  sdp = reorderCodecs(sdp, "video", videoCodecNames);
  return sdp;
}

export function setRtpReceiverOption(sdp?: string): string | undefined {
  sdp = setCodecOrder(sdp);
  return sdp;
}

export function doMaxBitrate(sdp: string | undefined, options: { [key: string]: object }): string | undefined {
  if (typeof options.audioEncodings === "object") {
    // Do something
  }
  if (typeof options.videoEncodings === "object") {
    // Do something
  }
  return sdp;
}

export function setRtpSenderOptions(sdp: string | undefined, options: {}): string | undefined {
  sdp = doMaxBitrate(sdp, options);
  return sdp;
}
