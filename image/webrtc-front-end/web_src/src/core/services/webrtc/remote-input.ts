import { touchInfo } from "../../models/webrtc/rtc-socket-config";
import { gamepadTool } from "./gamepad";

export const remoteInput = (id: string, remoteVideo: HTMLVideoElement, dataChannel: RTCDataChannel): void => {
  gamepadTool(dataChannel, id);

  remoteVideo.addEventListener("touchstart", function(e: TouchEvent): void {
    const remoteVideoLeft = remoteVideo.getBoundingClientRect().left;
    const remoteVideoTop = remoteVideo.getBoundingClientRect().top;
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; ++i) {
      const fingerId = e.changedTouches[i].identifier;
      const touchx = ((e.changedTouches[i].clientX - remoteVideoLeft) * touchInfo.max_x) / remoteVideo.clientWidth;
      const touchy = ((e.changedTouches[i].clientY - remoteVideoTop) * touchInfo.max_y) / remoteVideo.clientHeight;
      const touchStr = `d ${fingerId} ${Math.round(touchx)} ${Math.round(touchy)} 255\n`;
      dataChannel.send(
        JSON.stringify({
          id,
          data: JSON.stringify({
            type: "control",
            data: {
              event: "touch",
              parameters: { data: touchStr + "c\n", tID: 0 }
            }
          })
        })
      );
    }
  });

  remoteVideo.addEventListener("touchmove", function(e: TouchEvent): void {
    const remoteVideoLeft = remoteVideo.getBoundingClientRect().left;
    const remoteVideoTop = remoteVideo.getBoundingClientRect().top;
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; ++i) {
      const fingerId = e.changedTouches[i].identifier;
      const touchx = ((e.changedTouches[i].clientX - remoteVideoLeft) * touchInfo.max_x) / remoteVideo.clientWidth;
      const touchy = ((e.changedTouches[i].clientY - remoteVideoTop) * touchInfo.max_y) / remoteVideo.clientHeight;
      const touchStr = `m ${fingerId} ${Math.round(touchx)} ${Math.round(touchy)} 255\n`;
      dataChannel.send(
        JSON.stringify({
          id,
          data: JSON.stringify({
            type: "control",
            data: {
              event: "touch",
              parameters: { data: touchStr + "c\n", tID: 0 }
            }
          })
        })
      );
    }
  });

  remoteVideo.addEventListener("touchend", function(e: TouchEvent): void {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; ++i) {
      const fingerId = e.changedTouches[i].identifier;
      const touchStr = `u ${fingerId}\n`;
      dataChannel.send(
        JSON.stringify({
          id,
          data: JSON.stringify({
            type: "control",
            data: {
              event: "touch",
              parameters: { data: touchStr + "c\n", tID: 0 }
            }
          })
        })
      );
    }
  });

  remoteVideo.onmousedown = function(e: MouseEvent): void {
    e.preventDefault();
    const parameters = {
      // Must pass more than 3 params.
      which: e.which,
      x: (e.offsetX * touchInfo.max_x) / remoteVideo.clientWidth,
      y: (e.offsetY * touchInfo.max_y) / remoteVideo.clientHeight
    };
    dataChannel.send(
      JSON.stringify({
        id,
        data: JSON.stringify({
          type: "control",
          data: { event: "mousedown", parameters }
        })
      })
    );
  };

  remoteVideo.onmouseup = function(e: MouseEvent): void {
    e.preventDefault();
    const parameters = {
      x: (e.offsetX * touchInfo.max_x) / remoteVideo.clientWidth,
      y: (e.offsetY * touchInfo.max_y) / remoteVideo.clientHeight
    };
    dataChannel.send(
      JSON.stringify({
        id,
        data: JSON.stringify({
          type: "control",
          data: { event: "mouseup", parameters }
        })
      })
    );
  };

  remoteVideo.onmousemove = function(e: MouseEvent): void {
    e.preventDefault();
    if (e.buttons === 1) {
      const mouseX = (e.offsetX * touchInfo.max_x) / remoteVideo.clientWidth;
      const mouseY = (e.offsetY * touchInfo.max_y) / remoteVideo.clientHeight;
      const parameters: { [key: string]: number } = {};
      parameters.x = mouseX;
      parameters.y = mouseY;
      parameters.movementX = e.movementX;
      parameters.movementY = e.movementY;
      dataChannel.send(
        JSON.stringify({
          id,
          data: JSON.stringify({
            type: "control",
            data: { event: "mousemove", parameters }
          })
        })
      );
    }
  };
};
