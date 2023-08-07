import { CSSProperties } from "react";
import { ITerminalOptions } from "xterm";

export const sharedFormContainer: CSSProperties = {
  width: 370
};

export const sharedFormBody: CSSProperties = {
  padding: 16,
  background: "#f6f8fa",
  borderRadius: 6,
  border: "1px solid #d8dee4"
};

export const sharedFormBottom: CSSProperties = {
  padding: 16,
  marginTop: 16,
  textAlign: "center",
  borderRadius: 6,
  border: "1px solid #d8dee4"
};

export const sharedTable: CSSProperties = {
  padding: "0.75em",
  borderRadius: 6,
  border: "1px solid #e2e8f0",
  width: "100%"
};

export const resizableContainer: CSSProperties = {
  borderBottom: "1PX solid #ddd",
  overflow: "hidden"
};

export const hiddenOverflow: CSSProperties = {
  overflow: "hidden",
  height: "calc(100vh - 74px)"
};

export const terminalOptions: ITerminalOptions = {
  cursorBlink: true,
  theme: { background: "black" }
};
