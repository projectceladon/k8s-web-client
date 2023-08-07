# Open WebRTC Toolkit JavaScript SDK

Open WebRTC Toolkit JavaScript SDK builds on top of the W3C standard WebRTC APIs to accelerate development of real-time communications (RTC) for web applications, including peer-to-peer, broadcasting, and conference mode communications.

## How to build release package (owt.js)
1. Git clone from https://github.com/intel-innersource/libraries.communications.webrtc.owt-client-javascript/tree/4.2.x-cloudgaming and checkout to the branch named "4.2.x-cloudgaming" which is the base branch.
  >  git clone https://github.com/intel-innersource/libraries.communications.webrtc.owt-client-javascript
  >  cd libraries.communications.webrtc.owt-client-javascript
  >  git checkout origin/4.2.x-cloudgaming
2. Download https://github.com/huangrui666/owt-client-javascript/commit/2598f4d2458475c6579d2cd6afd10de0fb1f0c86.patch.
3. Apply the patch you just downloaded.
  >  git am 2598f4d2458475c6579d2cd6afd10de0fb1f0c86.patch
4. Download https://github.com/anandmix/libraries.communications.webrtc.owt-client-javascript/commit/3dbd58880d8f3360ac7bc81ce4848aed052b643d.patch
5. Apply the patch you just downloaded.
  >  git am 3dbd58880d8f3360ac7bc81ce4848aed052b643d.patch
6. Follow the README.md at https://github.com/intel-innersource/libraries.communications.webrtc.owt-client-javascript/tree/4.2.x-cloudgaming to compile. (There has an eslint issue in the patch, use '--force' to continue)

