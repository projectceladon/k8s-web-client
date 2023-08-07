'use strict';
var isVideo = 1;
var connected = false;
var isUrlCorrect = 0;
var isTest = false;
var isStateLess = false;
var gpsInterval;
var serverAddress = `${document.location.protocol}//OWT_SERVER_P2P_IP:SIGNAL_PORT`; // Please change example.com to signaling server's address.
var query = window.location.search.substring(1);
var cameraResolution = 0;
var cameraId = 0;
var cameraDeviceId = [];
const MAX_URL_SIZE = 1024;
const appList = [
  { param: 'launcher', value: 'com.android.launcher3' },
  { param: 'settings', value: 'com.android.settings' },
  { param: 'subwaysurf', value: 'com.kiloo.subwaysurf' },
]

if (query.length > MAX_URL_SIZE) {
  console.error("ERROR: The URL message size " + query.length + " is too long.");
} else {
  var sId = resolveUrl(query, 'sId').toString();
  var p = resolveUrl(query, 'p').toString();
  var app = resolveUrl(query, 'app').toString();
  var serverId = resolveUrl(query, 'serverId').toString();
  var clientId = resolveUrl(query, 'clientId').toString();
  var cameraTransitionActive = false;

  if (serverId != 'false' && clientId != 'false') {
    isStateLess = true;
  }

  if (app == 'false') {
    app = 'launcher';
  }

  if (sId == 'false' && isStateLess == false) {
    console.log('Wrong configs');
  } else {
    isUrlCorrect = 1;
  }

  if (p == 'manual') {
    isTest = true;
  }

  const signaling = new SignalingChannel();
  let mouseX;
  let mouseY;
  let touch_info = {
    max_x: 32767,
    max_y: 32767
  };
  var p2p = new Owt.P2P.P2PClient({
    audioEncodings: true,
    videoEncodings: true,
    rtcConfiguration: {
      iceServers: [{
        urls: "stun:COTURN_IP:3478",
        credential: "password",
        username: "username"
      }, {
        urls: [
          "turn:COTURN_IP:3478?transport=udp",
          "turn:COTURN_IP:3478?transport=tcp"
        ],
        credential: "password",
        username: "username"
      }]
    },
  }, signaling);

  var localStream;
  var localScreen;

  var getTargetId = function () {
    return isStateLess? serverId: 's' + sId;
  };

  const sendData = function (type, event, parameters) {
    let sendMsg = {};
    switch (type) {
      case 'ctrl':
        const ctrl = {
          type: 'control',
          data: {
            event: event,
            parameters: parameters
          }
        }
        sendMsg = ctrl;
        break;
      default:
        console.log('Wrong message type');
    }
    if (connected)
      p2p.send(getTargetId(), JSON.stringify(sendMsg)).catch((error) => {
        console.log("Catch " + error.name + ": " + error.message);
      });
  }

  console.log('new server ip address is ' + serverAddress);

  function handleSizeChange() {
    const width = document.body.clientWidth;
    const height = document.body.clientHeight;
    const params = { screenSize: { width: 0, height: 0 }, rendererSize: { width: 0, height: 0 }  };

    params.screenSize.width = width;
    params.screenSize.height = height;
    params.rendererSize.width = width;
    params.rendererSize.height = height;

    sendData('ctrl', 'sizechange', params);
  }

  function getCameraHwCapability() {
    navigator.mediaDevices.enumerateDevices()
    .then(function(devices) {
      // Filter only camera devices.
      const cameras = devices.filter(device => device.kind === 'videoinput');
      console.log("Number of camera(s) available in the device = " +  cameras.length);

      const params = { numOfCameras:0, camOrientation: ["NULL"], camFacing: ["NULL"], maxCameraRes: ["NULL"] };
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
      sendData('ctrl', 'camerainfo', params);
    })
    .catch(function(err) {
      console.log(err.name + ": " + err.message);
    });
  }

  var doit;

  window.onresize = () => {
    clearTimeout(doit);
    doit = setTimeout(() => {
      handleSizeChange();
    }, 100);
  };

  p2p.allowedRemoteIds = [getTargetId()];

  if (isUrlCorrect == 1) {
    p2p.connect({
      host: serverAddress,
      token: isStateLess? clientId: 'c' + sId
    }).then(() => {
      if (isStateLess) {
        p2p.send(getTargetId(), 'start');
      }
      else {
        const pkgVal = appList.some(item => item.param == app) ? appList.find(item => item.param == app).value : app;
        p2p.send(getTargetId(), JSON.stringify({ 'type': 'control', 'data': { 'event': 'cmdchannel', 'parameters': {'pkg': pkgVal }}} )).then(() => p2p.send(getTargetId(), 'start'));
      }
      new gamepadTool(p2p, getTargetId());
      if (isTest) {
        testMode();
      }
    }, error => {
      console.log('Failed to connect to the signaling server.');
    }); // Connect to signaling server.
  };

  function testMode() {
    const testStyle = {
      'max-width': '100vw',
      'max-height': '100vh',
      'object-fit': 'contain'
    }
    $('#test-body ').css('display', 'block');
    $('#remoteVideo').css(testStyle);

    const resOpts = [
      { text: '1024 x 600', value: '1024x600' },
      { text: '1024 x 800', value: '1024x800' },
      { text: '1280 x 720', value: '1280x720' },
      { text: '1280 x 800', value: '1024x800' },
      { text: '1920 x 1080', value: '1920x1080' }
    ]

    const bitSelect = document.getElementById('bit-select');
    const icrSelect = document.getElementById('icr-select');
    const fpsSelect = document.getElementById('fps-select');
    const resSelect = document.getElementById('res-select');
    const modeSelect = document.getElementById('mode-select');

    if (bitSelect) {
      for (let i = 0; i < 40; i++) {
        bitSelect.add(new Option((i + 1) * 100 + ' kbps', (i + 1) * 100));
      }
    }
    if (resSelect) {
      for (let i = 0; i < resOpts.length; i++) {
        resSelect.add(new Option(resOpts[i].text, resOpts[i].value));
      }
    }

    icrSelect.onchange = () => {
      icrSelect.options[icrSelect.selectedIndex].value != '' ? $('#send-icr').prop('disabled', false) : $('#send-icr').prop('disabled', true);
    }
    bitSelect.onchange = () => {
      bitSelect.options[bitSelect.selectedIndex].value != '' ? $('#send-bit').prop('disabled', false) : $('#send-bit').prop('disabled', true);
    }
    resSelect.onchange = () => {
      resSelect.options[resSelect.selectedIndex].value != '' ? $('#send-res').prop('disabled', false) : $('#send-res').prop('disabled', true);
    }
    fpsSelect.onchange = () => {
      fpsSelect.options[fpsSelect.selectedIndex].value != '' ? $('#send-fps').prop('disabled', false) : $('#send-fps').prop('disabled', true);
    }
    modeSelect.onchange = () => {
      modeSelect.options[modeSelect.selectedIndex].value != '' ? $('#send-mode').prop('disabled', false) : $('#send-mode').prop('disabled', true);
    }

    $('#send-icr').click(function () {
      sendData('ctrl', 'icr-params', {"run" : icrSelect.options[icrSelect.selectedIndex].value});
    })
    $('#send-bit').click(function () {
      sendData('ctrl', 'icr-params', {"bitrate" : bitSelect.options[bitSelect.selectedIndex].value});
    })
    $('#send-res').click(function () {
      sendData('ctrl', 'icr-params', {"resolution" : resSelect.options[resSelect.selectedIndex].value});
    })
    $('#send-fps').click(function () {
      sendData('ctrl', 'icr-params', {"fps" : fpsSelect.options[fpsSelect.selectedIndex].value});
    })
    $('#send-mode').click(function () {
      sendData('ctrl', 'icr-params', {"manual_mode" : modeSelect.options[modeSelect.selectedIndex].value});
    })
    $('#cmd-back').click(function () {
      const androidUserId = sessionStorage.getItem("androidUserId");
      const androidDisplayId = sessionStorage.getItem("androidDisplayId");
      if (androidDisplayId && androidUserId && Number(androidUserId) >= 0) {
        sendData('ctrl', 'cmdchannel', {"cmd" : "input -d " + androidDisplayId + " keyevent 4"});
      } else {
        sendData('ctrl', 'cmdchannel', {"cmd" : "input keyevent 4"});
      }
    })
    $('#cmd-am').click(function () {
      const androidUserId = sessionStorage.getItem("androidUserId");
      const androidDisplayId = sessionStorage.getItem("androidDisplayId");
      if (androidDisplayId && androidUserId && Number(androidUserId) >= 0) {
        console.log("am start --user " + androidUserId + " --display " + androidDisplayId + " -n com.android.settings");
        sendData('ctrl', 'cmdchannel', {"cmd" : "am start --user " + androidUserId + " --display " + androidDisplayId + " -n com.android.settings/.Settings"});
      } else {
        sendData('ctrl', 'cmdchannel', {"cmd" : "am start -n com.android.settings/.Settings"});
      }
    })
    $('#cmd-pm').click(function () {
      sendData('ctrl', 'cmdchannel', {"cmd" : "pm list packages"});
    })
  }

  p2p.addEventListener('streamadded', function (e) { // A remote stream is available.
    connected = true;
    console.log('Stream is added connected = true');
    e.stream.addEventListener('ended', () => {
      remoteVideo.srcObject = undefined;
      console.log('Stream is removed.');
    });

    if (e.stream.source.audio || e.stream.source.video) {
      remoteVideo.srcObject = e.stream.mediaStream;
      handleSizeChange();
      getCameraHwCapability();
    }
  });

  function isJson(item) {
    item = typeof item !== 'string' ? JSON.stringify(item) : item;

    try {
      item = JSON.parse(item);
    } catch (error) {
      return false;
    }

    if (typeof item == 'object' && item !== null) {
      return true;
    }

    return false;
  }

  p2p.addEventListener('messagereceived', function (e) {
    console.log('Channel received message: ' + e.message);
    if (isJson(e.message)) {
      var jsonObj = JSON.parse(e.message);
    }
    var curPkg;
    var newPkg;

    if (jsonObj != null) {
      switch (jsonObj.key) {
        case 'ASN':
          curPkg = jsonObj.cur.pkg;
          newPkg = jsonObj.new.pkg;

          if (curPkg != newPkg) {
            //onDisconnectInstance(getTargetId());
            if (newPkg.includes('sensor')) {
              console.log('Sensor app is launched..');
              p2p.send(getTargetId(), "start-sensor-feed");
            } else if (curPkg.includes('sensor')) {
              console.log('Sensor app exit..');
              p2p.send(getTargetId(), "stop-sensor-feed");
            }
          }
          break;
        case 'start-audio-rec':
          // Audio stream is requested.
          // We now start streaming local audio to peer.
          console.log("Start audio stream is requested.");
          // start audio-only stream
          publishLocalStream('mic', undefined);
          break;
        case 'start-audio-play':
          // Start audio playback is requested.
          // Unmute audio.
          console.log("Start audio play is requested");
          remoteVideo.muted = false;
          break;
        case 'stop-audio-play':
          // Stop audio playback is requested.
          // Mute audio.
          console.log("Stop audio play is requested.");
          remoteVideo.muted = true;
          break;
        case 'stop-audio-rec':
          // Stop audio stream is requested.
          // Stop publishing local stream now.
          console.log("Stop stream is requested.");
          stopPublication(localAudioStream);
          break;
        case 'start-camera-preview':
          // Start camera preview
          if(publicationForVideo != undefined) {
            console.log("cant start camera, publication object already present");
            break;
          }
          if (cameraTransitionActive == true) {
            console.log("Waiting for previous Camera State Transition");
            break;
          }
          cameraTransitionActive = true;
          cameraResolution = jsonObj.cameraRes;
          cameraId = jsonObj.cameraId;
          console.log("start camera preview for Id = " + cameraId +
                      ", and Res = " + cameraResolution);
          publishLocalStream(undefined, 'camera');
          break;
        case 'stop-camera-preview':
          if(publicationForVideo == undefined) {
            console.log("cant stop camera, no publication object found");
            break;
          }
          if (cameraTransitionActive == true) {
            console.log("cant stop camera, camera already starting");
            break;
          }
          cameraTransitionActive = true;
          console.log("Stop video stream is requested.");
          stopVideoPublication(localVideoStream);
          break;
        case 'gps-start':
          gpsInterval = setInterval(async => getLocation(), 1000);
          break;
        case 'gps-stop':
          clearInterval(gpsInterval);
          break;
        case 'user-id':
          sessionStorage.setItem('userId', jsonObj["val"]);
          const userId = sessionStorage.getItem("userId");
          if (userId && Number(userId) >= 0) {
            p2p.send(getTargetId(), JSON.stringify({ 'type': 'control', 'data': { 'event': 'cmdchannel', 'parameters': {'cmd': 'get self --user-id ' + userId }}} ));
          }
          break;
        case 'cmd-output':
          if (jsonObj.val["cmd"].indexOf("get self") == 0) {
            let arr1 = jsonObj.val["output"].split(",");
            let androidUserId = arr1[0].split("=")[1];
            let androidDisplayId = arr1[1].split("=")[1];
            sessionStorage.setItem('androidUserId', androidUserId);
            sessionStorage.setItem('androidDisplayId', androidDisplayId);
          }
          break;
        default:
          console.log('No match key');
      }
    }
  });

  remoteVideo.addEventListener("mousemove", event => {
    event.preventDefault();
    if (event.buttons == 1) {
      mouseX = event.offsetX * touch_info.max_x / remoteVideo.clientWidth;
      mouseY = event.offsetY * touch_info.max_y / remoteVideo.clientHeight;
      const parameters = {};
      parameters.x = mouseX;
      parameters.y = mouseY;
      parameters.movementX = event.movementX;
      parameters.movementY = event.movementY;
      sendData('ctrl', 'mousemove', parameters);
    }
  });

  remoteVideo.addEventListener("touchstart", e => {
    e.preventDefault();
    let remoteVideoLeft = remoteVideo.getBoundingClientRect().left;
    let remoteVideoTop = remoteVideo.getBoundingClientRect().top;
    for (var i = 0; i < e.changedTouches.length && p2p; ++i) {
      const fingerId = e.changedTouches[i].identifier;
      const touchx = (e.changedTouches[i].clientX - remoteVideoLeft) * touch_info.max_x / remoteVideo.clientWidth;
      const touchy = (e.changedTouches[i].clientY - remoteVideoTop) * touch_info.max_y / remoteVideo.clientHeight;
      const touchStr = `d ${fingerId} ${Math.round(touchx)} ${Math.round(touchy)} 255\n`
      sendData('ctrl', 'touch', {data: touchStr + 'c\n', tID: 0});
    }
  })

  remoteVideo.addEventListener("touchend", e => {
    e.preventDefault();
    for (var i = 0; i < e.changedTouches.length && p2p; ++i) {
      const fingerId = e.changedTouches[i].identifier;
      const touchStr =`u ${fingerId}\n`
      sendData('ctrl', 'touch', {data: touchStr + 'c\n', tID: 0});
    }
  });

  remoteVideo.addEventListener("touchmove", e => {
    e.preventDefault();
    let remoteVideoLeft = remoteVideo.getBoundingClientRect().left;
    let remoteVideoTop = remoteVideo.getBoundingClientRect().top;
    for (var i = 0; i < e.changedTouches.length && p2p; ++i) {
      const fingerId = e.changedTouches[i].identifier;
      const touchx = (e.changedTouches[i].clientX - remoteVideoLeft) * touch_info.max_x / remoteVideo.clientWidth;
      const touchy = (e.changedTouches[i].clientY - remoteVideoTop) * touch_info.max_y / remoteVideo.clientHeight;
      const touchStr = `m ${fingerId} ${Math.round(touchx)} ${Math.round(touchy)} 255\n`
      sendData('ctrl', 'touch', {data: touchStr + 'c\n', tID: 0});
    }
  });

  remoteVideo.onmouseup = function (e) {
    e.preventDefault();
    sendData('ctrl', 'mouseup', {
      which: e.which,
      x: e.offsetX * touch_info.max_x / remoteVideo.clientWidth,
      y: e.offsetY * touch_info.max_y / remoteVideo.clientHeight
    });
  }

  remoteVideo.onmousedown = function (e) {
    e.preventDefault();
    sendData('ctrl', 'mousedown', {
      which: e.which,
      x: e.offsetX * touch_info.max_x / remoteVideo.clientWidth,
      y: e.offsetY * touch_info.max_y / remoteVideo.clientHeight
    });
  };

  function resolveUrl(query, variable) {
    var vars = query.split(',');
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (pair[0] == variable) {
        return pair.slice(1, pair.length).join('=');
      }
    }
    return (false);
  }

  let localAudioStream;
  let localVideoStream;
  let publicationForAudio; // audio-only
  let publicationForVideo = undefined; // video-only

  function stopPublication(localStream) {
    // FIXME: Stop publication is not working.
    // May be because publication was never returned success.
    // However, if we stop all the tracks of the local stream,
    // publication ends anyway.
    for (const track of localStream.mediaStream.getTracks()) {
      console.log("stopPublication: Track id: " + track.id);
      console.log("stopPublication: Track kind: " + track.kind);
      console.log("stopPublication: Track label: " + track.label);
      track.stop();
    }
    localStream.mediaStream = undefined;
  }

  function stopVideoPublication(localStream) {
    publicationForVideo.stop();
    stopPublication(localStream);
    publicationForVideo = undefined;
    cameraTransitionActive = false;
  }

  function publishLocalStream(audioSource, videoSource) {
    let audioConstraintsForMic;
    let videoConstraintsForCamera;
    let localStream;
    let Id = parseInt(cameraId);

    if (audioSource == 'mic') {
      audioConstraintsForMic = new Owt.Base.AudioTrackConstraints(Owt.Base.AudioSourceInfo.MIC);
    }

    if (videoSource == 'camera') {
      videoConstraintsForCamera = new Owt.Base.VideoTrackConstraints(Owt.Base.VideoSourceInfo.CAMERA);

      // Switch camera HW based on camera Id.
      videoConstraintsForCamera.deviceId = cameraDeviceId[Id];

      if (cameraResolution == '1') {
          console.log("user requested for 480p");
          videoConstraintsForCamera.resolution = {
            width: 640,
            height: 480
          };
      } else if (cameraResolution == '2') {
          console.log("user requested for 720p");
          videoConstraintsForCamera.resolution = {
            width: 1280,
            height: 720
          };
      } else if (cameraResolution == '4') {
          console.log("user Requested for 1080p");
          videoConstraintsForCamera.resolution = {
            width: 1920,
            height: 1080
          };
      }
      videoConstraintsForCamera.frameRate = 30;
    }

    let mediaStream;

    console.log(publishLocalStream.name + ": audioSource: " + audioSource + ", videoSource: " + videoSource);

    Owt.Base.MediaStreamFactory.createMediaStream(new Owt.Base.StreamConstraints(audioConstraintsForMic, videoConstraintsForCamera))
      .then(stream => {
        mediaStream = stream;
        if (audioSource == undefined) { // video-only
          localVideoStream = new Owt.Base.LocalStream(mediaStream,
            new Owt.Base.StreamSourceInfo(audioSource, videoSource));
          localStream = localVideoStream;
        } else if (videoSource == undefined) { // audio-only
          localAudioStream = new Owt.Base.LocalStream(mediaStream,
            new Owt.Base.StreamSourceInfo(audioSource, videoSource));
          localStream = localAudioStream;
        }

        console.log(publishLocalStream.name + ": Local media stream created. Id: " + localStream.mediaStream.id);
        mediaStream.getVideoTracks().forEach(track => {
          track.contentHint = "detail";
        });

        // may be useful for debugging
        // $(`#localAudio`).get(0).srcObject = localStream.mediaStream;
        // $(`#localVideo`).get(0).srcObject = localStream.mediaStream;

        p2p.publish(getTargetId(), localStream)
          .then(publication => {
            if (audioSource == undefined) {
              publicationForVideo = publication;
              cameraTransitionActive = false;
            }
            else if (videoSource == undefined)
              publicationForAudio = publication;

            console.log(publishLocalStream.name + ": Local stream is published.");
          }, error => {
            console.log(publishLocalStream.name + ": Failed to publish local stream, error:" + error);
            if (audioSource == undefined)
              cameraTransitionActive = false;
          });
      }, err => {
        console.error(publishLocalStream.name + ": Failed to create media stream, error: " + err);
      });
    console.log(publishLocalStream.name + ": out");
  }

  const functionKey = ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12", "AudioVolumeUp", "AudioVolumeDown", "AudioVolumeMute"]

  window.addEventListener("keydown", function (event) {
    if (event.defaultPrevented) {
      return;
    }

    var handled = false;
    if (event.key !== undefined && !functionKey.includes(event.key) && !event.ctrlKey && !event.altKey) {
      handled = true;
    }

    if (handled) {
      event.preventDefault();
      sendData('ctrl', 'joystick', {data: `k ${resolveKey(event.key, event.location)} 1\nc\n`, jID: 0});
    }
  }, true);

  window.addEventListener("keyup", function (event) {
    if (event.defaultPrevented) {
      return;
    }

    var handled = false;
    if (event.key !== undefined && !functionKey.includes(event.key) && !event.ctrlKey && !event.altKey) {
      handled = true;
    }

    if (handled) {
      event.preventDefault();
      sendData('ctrl', 'joystick', {data: `k ${resolveKey(event.key, event.location)} 0\nc\n`, jID: 0});
    }
  }, true);

  window.onbeforeunload = function () {
    if (isStateLess) {
      p2p.stop(serverId);
    }
    else {
      p2p.stop('s' + sId);
    }
    p2p.allowedRemoteIds = null;
    p2p.disconnect();
    connected = false;
    sessionStorage.clear();
    clearInterval(gpsInterval);
  };
}
