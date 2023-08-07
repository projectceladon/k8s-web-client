let dc: RTCDataChannel;
let id: string;

const nmeaCheckSum = (nmea: string): string => {
  const ch = nmea.split("").join(",");
  let result: any;
  for (let i = 2; i < ch.length; i++) {
    if (ch[i] !== "*") {
      result ^= ch[i] as unknown as number;
    }
  }
  return result.toString(16);
};

const buildComposedNmeaMessage = (lat: number, lon: number): string => {
  let latitude = lat;
  let longitude = lon;
  let nmeaMessage = "$GPGGA,061120.00,2922.413610,N,10848.823876,E,1,04,1.5,0,M,-27.8,M,,*4D";
  const str = nmeaMessage.split(",");
  const date = new Date();
  let utcHours = date.getUTCHours().toString();
  let utcMinutes = date.getUTCMinutes().toString();
  let utcSeconds = date.getUTCSeconds().toString();
  let utcMilliseconds = date.getUTCMilliseconds().toString();
  utcHours = utcHours.length === 1 ? utcHours = "0" + utcHours : utcHours;
  utcMinutes = utcMinutes.length === 1 ? utcMinutes = "0" + utcMinutes : utcMinutes;
  utcSeconds = utcSeconds.length ===1 ? utcSeconds = "0" + utcSeconds : utcSeconds;
  utcMilliseconds = utcMilliseconds.length === 1
    ? utcMilliseconds = "00" + utcMilliseconds : utcMilliseconds.length === 2 ? "0" + utcMilliseconds : utcMilliseconds;
  const utcDate = utcHours + utcMinutes + utcSeconds + "." + utcMilliseconds;

  str[1] = utcDate;

  if (lat < 0) {
    latitude = Math.abs(lat);
    str[5] = "W";
  } else {
    str[5] = "E";
  }
  if (lon < 0) {
    longitude = Math.abs(lon);
    str[3] = "S";
  } else {
    str[3] = "N";
  }
  const nmeaLatitude = (latitude - +latitude) * 60 + +latitude * 100;
  const nmeaLongitude = (longitude - +longitude) * 60 + +longitude * 100;
  const latStr = nmeaLatitude.toFixed(6).toString();
  const lonStr = nmeaLongitude.toFixed(6).toString();
  str[4] = lonStr;
  str[2] = latStr;
  str[6] = "1"; // gps state, nmea sometimes is 0 (means no gps)

  nmeaMessage = str.join(",");
  const checkVal = nmeaCheckSum(nmeaMessage);
  str[14] = "*" + checkVal + "\r\n"; // check segment
  nmeaMessage = str.join(",");
  console.log(`GPS Composed NMEA: ${nmeaMessage}`);
  return nmeaMessage;
};

const showPosition = (position: GeolocationPosition): void => {
  const msg = buildComposedNmeaMessage(position.coords.latitude, position.coords.longitude);
  dc.send(
    JSON.stringify({ id, data: JSON.stringify({ type: "control", data: { event: "gps", parameters: { data: msg } } }) })
  );
};

export const getLocation = (remoteId: string, dataChannel: RTCDataChannel): void => {
  if (navigator.geolocation) {
    id = remoteId;
    dc = dataChannel;
    navigator.geolocation.getCurrentPosition(showPosition);
  }
};
