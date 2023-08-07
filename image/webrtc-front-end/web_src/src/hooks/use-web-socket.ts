import { useToast } from "@chakra-ui/react";
import React from "react";
import { sharedToast } from "../core/components/shared-toast";

export function useWebSocket(uri: string, messageHandler: (e: MessageEvent<any>) => void): WebSocket | undefined {
  const [socket, setSocket] = React.useState<WebSocket>();
  const toast = useToast();

  React.useEffect((): void | (() => void | undefined) => {
    const conn = new WebSocket(uri);

    conn.onopen = (): void => {
      console.log("socket opened.");
      setSocket(conn);
    };

    conn.onclose = (): void => console.log("socket closed.");

    conn.onmessage = (e): void => {
      messageHandler(e);

      if (e.data === "End") {
        sharedToast(toast, "Push image successfully", "success");
      }
    };

    conn.onerror = (e): void => console.log(e);

    return (): void => conn.close();
  }, [uri]);

  return socket;
}
