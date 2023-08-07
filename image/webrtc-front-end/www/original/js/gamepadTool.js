'use strict';
function gamepadTool(p2p,insId) {
    if ('GamepadEvent' in window) {
      window.addEventListener("gamepadconnected", connecthandler);
      window.addEventListener("gamepaddisconnected", disconnecthandler);
    } else if ('WebKitGamepadEvent' in window) {
      window.addEventListener("webkitgamepadconnected", connecthandler);
      window.addEventListener("webkitgamepaddisconnected", disconnecthandler);
    } else {
      console.log('There is no gamepad event in window right now. Begin scan.');
      setInterval(scangamepads, 500);
    }
    var gamepads = {};
    var buttonMap = new Map();
    var axesMap = new Map();
    var BUTTONS_RATIO = 255;
    var AXES_RATIO = 127;
    var AXES_THRESHOLD = 0.04 * AXES_RATIO;
    var requestAnimationFrame = window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.requestAnimationFrame;

    function connecthandler(e) {
      let gp = navigator.getGamepads()[e.gamepad.index];
      console.log("Gamepad connected at index " + gp.index + ": " + gp.id + ". It has " + gp.buttons.length + " buttons and " + gp.axes.length + " axes.");
      if (gp.mapping == "standard") {
        console.log("Controller has standard mapping.");
      } else {
        console.log("Controller doesn't have standard mapping.");
        return;
      }

      let buttons = new Array(gp.buttons.length);
      for (var i = 0; i < gp.buttons.length; i++) {
        buttons[i] = 0;
      }
      buttonMap.set(gp.index, buttons);
      let axes = new Array(gp.axes.length);
      for (var i = 0; i < gp.axes.length; i++) {
        axes[i] = (gp.axes[i] * AXES_RATIO).toFixed(0);
      }
      axesMap.set(gp.index, axes);

      gamepads[gp.index] = gp;
      sendMsg("i\n", gp.index);
      requestAnimationFrame(updateGpData);
    }

    function disconnecthandler(e) {
      let gp = e.gamepad;
      console.log("Gamepad disconnected at index " + gp.index + ": " + gp.id + ". It has " + gp.buttons.length + " buttons and " + gp.axes.length + " axes.");
      delete gamepads[gp.index];
      delete buttonMap[gp.index];
      delete axesMap[gp.index];
      sendMsg("p\n", gp.index);
    }

    function updateGpData() {
      scangamepads();
      for (let j in gamepads) {
        let gp = gamepads[j];
        for (var i = 0; i < gp.buttons.length; i++) {
          var button = gp.buttons[i];
          if (typeof(button) == "object") {
            var pressed = button.pressed;
            var value = (button.value * BUTTONS_RATIO).toFixed(0);
            if (!buttonMap.has(gp.index))
              return;
            let buttons = buttonMap.get(gp.index);
            if (value != buttons[i]) {
              resolveButton(i, pressed, value, gp.index);
              if (pressed)
                  buttons[i] = value;
              else
                  buttons[i] = 0;
              buttonMap.set(gp.index, buttons);
            }
          }
        }

        for (var i = 0; i < gp.axes.length; i++) {
          var value = (gp.axes[i] * AXES_RATIO).toFixed(0);
          if (!axesMap.has(gp.index))
            return;
          let axes = axesMap.get(gp.index);
          if (axes[i] != value && Math.abs(axes[i] - value) > AXES_THRESHOLD) {
            resolveAxes(i, value, gp.index);
            axes[i] = value;
            axesMap.set(gp.index, axes);
          }
        }
      }
      requestAnimationFrame(updateGpData);
    }

    function resolveButton(buttonID, pressed, value, gpID){
      var message;
      let buttons = buttonMap.get(gpID)
      switch(buttonID){
        case 0:
        case 1:
        case 2:
        case 3:
          message = "m 4 0\n";
          sendMsg(message, gpID);
      }
      switch(buttonID){
        case 0: //BTN_A
          message = pressed? "k 304 1\n" : "k 304 0\n";
          break;
        case 1: //BTN_B
          message = pressed? "k 305 1\n" : "k 305 0\n";
          break;
        case 2: //BTN_X
          message = pressed? "k 307 1\n" : "k 307 0\n";
          break;
        case 3: //BTN_Y
          message = pressed? "k 308 1\n" : "k 308 0\n";
          break;
        case 4: //BTN_L1
          message = pressed? "k 310 1\n" : "k 310 0\n";
          break;
        case 6: //BTN_L2 with value
          if (pressed) {
            if (buttons[6] == 0) {
	      message = "k 312 1\n";
              sendMsg(message, gpID);
              message = "a 62 0\n";
              sendMsg(message, gpID);
            }
            message = "a 62 " + value + "\n";
          } else {
            message = "a 62 0\n";
            sendMsg(message, gpID);
            message = "k 312 0\n";
          }
          break;
        case 5: //BTN_R1
          message = pressed? "k 311 1\n" : "k 311 0\n";
          break;
        case 7: //BTN_R2 with value
          if(pressed){
            if(buttons[7] == 0){
              message = "k 313 1\n";
              sendMsg(message, gpID);
              message = "a 63 0\n";
              sendMsg(message, gpID);
            }
            message = "a 63 " + value + "\n";
          } else {
            message = "a 63 0\n";
            sendMsg(message, gpID);
            message = "k 313 0\n";
          }
          break;
        case 8: //SHARE
          message = pressed? "k 314 1\n" : "k 314 0\n";
          break;
        case 9: //OPTIONS
          message = pressed? "k 315 1\n" : "k 315 0\n";
          break;
        case 10: //BTN_THUMBL
          message = pressed? "k 317 1\n" : "k 317 0\n";
          break;
        case 11: //BTN_THUMBR
          message = pressed? "k 318 1\n" : "k 318 0\n";
          break;
        case 12: //TOP
          message = pressed? "a 17 -1\n" : "a 17 0\n";
          break;
        case 13: //Bottom
          message = pressed? "a 17 1\n" : "a 17 0\n";
          break;
        case 14: //Left
          message = pressed? "a 16 -1\n" : "a 16 0\n";
          break;
        case 15: //Right
          message = pressed? "a 16 1\n" : "a 16 0\n";
          break;
        case 16: //PS
          message = pressed? "k 316 1\n" : "k 316 0\n";
	  break;
        case 17: //controller
          message = pressed? "k 288 1\n" : "k 288 0\n";
	  break;
        default:
          console.log("Button id is: " + buttonID);
      }
      sendMsg(message, gpID);
    }

    function resolveAxes(axesID, axesVal, gpID) {
      var message;
      switch(axesID) {
        case 0: //Left Stick East/West
          message = "a 0 " + axesVal + "\n";
          break;
        case 1: //Left Stick North/South
          message = "a 1 " + axesVal + "\n";
          break;
        case 2: //Right Stick East/West
          message = "a 2 " + axesVal + "\n";
          break;
        case 3: //Right Stick North/South
          message = "a 5 " + axesVal + "\n";
          break;
        default:
          console.log("axe id is: " + axesID + " axesval =" + axesVal);
      }
      if (message != null) {
        sendMsg(message, gpID);
      }
    }

    function sendMsg(message, gpID){
      var msg = {data : null, jID : null};
      msg.jID = gpID;
      msg.data = message;
      p2p.send(insId, JSON.stringify({ type: 'control', data: { event: 'joystick', parameters: msg }}));
      if (message != "i\n" && message != "p\n") {
        message = "c\n";
        msg.data = message;
        p2p.send(insId, JSON.stringify({ type: 'control', data: { event: 'joystick', parameters: msg }}));
      }
    }

    function scangamepads() {
      var gamepadsUpdated = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
      for (var i = 0; i < gamepadsUpdated.length; i++) {
        if (gamepadsUpdated[i] && (gamepadsUpdated[i].index in gamepads)) {
          gamepads[gamepadsUpdated[i].index] = gamepadsUpdated[i];
        }
      }
    }
}
