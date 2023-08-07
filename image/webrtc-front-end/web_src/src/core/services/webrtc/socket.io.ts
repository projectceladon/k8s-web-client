import io from "socket.io-client";
import { checkMessageSize, msgPayload, socketConfig, SocketEvent } from "../../models/webrtc/rtc-socket-config";
import { messageHandler } from "./peer-connection";

const connectedList: number[] = [];
let connectPromise: any | null = null;

export let socketCount = 0;
export const wsServer: SocketIOClient.Socket[] = [];

export const socketConnect = (token: string, index: number): Promise<void> => {
  const parameters: string[] = [];

  parameters.push(`clientType=${socketConfig.clientType}`);
  parameters.push(`clientVersion=${socketConfig.clientVersion}`);
  parameters.push(`isClient=${socketConfig.isClient}`);
  parameters.push(`token=${encodeURIComponent(token)}`);

  const opts = {
    query: parameters.join("&"),
    reconnection: false,
    forceNew: true,
    reconnectionAttempts: 10,
    path: "/owt/socket.io"
  };

  socketCount = index;

  wsServer[socketCount] = io(socketConfig.url, opts);

  wsServer[socketCount].on(SocketEvent.Connect, (): void => {
    console.log("Websocket server connected.");
  });

  wsServer[socketCount].on(SocketEvent.ServerAuthenticated, (data: { uid: string }): void => {
    console.log(`Authentication passed. User ID: ${data.uid}`);
    if (checkMessageSize(data)) {
      if (connectPromise) {
        connectPromise.resolve(data.uid);
      }
      connectPromise = null;
    }
  });

  wsServer[socketCount].on(SocketEvent.Error, (err: string): void => {
    console.error(`Socket.IO error: ${err}`);
    if (connectPromise) {
      connectPromise.reject(err);
    }
    connectPromise = null;
  });

  wsServer[socketCount].on(SocketEvent.ConnectFail, (errorCode: string): void => {
    console.error(`Fail to connect with websocket server, error: ${errorCode}`);
    if (connectPromise) {
      connectPromise.reject(parseInt(errorCode, undefined));
    }
    connectPromise = null;
  });

  wsServer[socketCount].on(SocketEvent.Disconnect, (reason: string): void => {
    console.log(`Server disconnected: ${reason}`);
  });

  wsServer[socketCount].on(SocketEvent.ServerDisconnect, (): void => {
    console.log("Server disconnected.");
  });

  wsServer[socketCount].on(SocketEvent.OwtMsg, (message: { data: string; type: string }): void => {
    messageHandler(message);
  });

  return new Promise((resolve, reject): void => {
    connectPromise = {
      resolve,
      reject
    };
  });
};

export const socketSend = (targetId: string, message: Object): Promise<void> => {
  return new Promise((resolve, reject): void => {
    wsServer[socketCount].emit(SocketEvent.OwtMsg, msgPayload(targetId, message), (err: Error): void => {
      err ? reject(err) : resolve();
    });
  });
};

export const socketDisconnect = (targetId: string): Promise<void> => {
  return new Promise((resolve, reject): void => {
    if (wsServer[socketCount] && connectedList[socketCount] === 1) {
      connectedList[socketCount] = 0;
      wsServer[socketCount].emit(SocketEvent.DisconnectInstance, { to: targetId }, (err: Error): void => {
        err ? reject(err) : resolve();
      });
      console.log("Instance Disconnected.");
    }
  });
};
