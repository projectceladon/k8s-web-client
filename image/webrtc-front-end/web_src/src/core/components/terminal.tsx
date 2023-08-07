import React from "react";
import { Terminal } from "xterm";
import { AttachAddon } from "xterm-addon-attach";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { useQuery } from "../../utils/query";
import { finalHeight } from "../pages/android-image";
import { SOCKET_CLOSE } from "../services/apis";
import { useSharedRequest } from "../services/shared-request";
import { terminalOptions } from "../styles/shared.styles";

export function TermainlBody(props: { api: string; updateHeight: number; }): React.ReactElement {
  const { api, updateHeight } = props;
  const query = useQuery();
  const sId = query.get("sId");
  const socketUrl = `${api}?id=${sId}`;
  const name = api.split("/")[4];

  const [height, setHeight] = React.useState(Math.floor(updateHeight));
  const [, socketClose] = useSharedRequest<null, null, null>();

  const newFit = (term: Terminal, termDom: HTMLElement | null, h: number): void => {
    if (termDom && termDom.parentElement?.style.display !== "none") {
      setHeight(Math.floor(h));
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      fitAddon.fit();
    }
  };

  React.useEffect((): void | (() => void | undefined) => {
    const termDom = document.getElementById(`terminal_${name}`);
    const socket = new WebSocket(socketUrl);

    const term = new Terminal(terminalOptions);
    const attachAddon = new AttachAddon(socket);
    const fitAddon = new FitAddon();

    if (termDom) {
      term.loadAddon(attachAddon);
      term.loadAddon(fitAddon);
      term.open(termDom);
      fitAddon.fit();
    }

    socket.onerror = (error): void => {
      console.log(error);
    };

    const sub = finalHeight.subscribe({
      next: (value: number): void => newFit(term, termDom, value),
      error: (e): void => console.error(e)
    });

    return (): void => {
      sub.unsubscribe();
      socketClose(`${SOCKET_CLOSE}?id=${sId}&way=${name}`, "GET", null, null);
    };
  }, [api, socketUrl]);

  return <div style={{ height }} id={`terminal_${name}`} />;
}
