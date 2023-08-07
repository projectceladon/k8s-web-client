import { NumberSize, Resizable } from "re-resizable";
import { Box } from "@chakra-ui/react";
import axios from "axios";
import React from "react";
import { useQuery } from "../../utils/query";
import { ImageControl } from "../components/image-control";
import { SharedSpinner } from "../components/shared-spinner";
import { P2P_STATUS, POD } from "../services/apis";
import { useSharedRequest } from "../services/shared-request";
import { createPeerConnection, createDataChannel, stopConnection } from "../services/webrtc/peer-connection";
import { socketConnect } from "../services/webrtc/socket.io";
import { resizableContainer, sharedTable } from "../styles/shared.styles";
import { Subject } from "rxjs";

export const finalHeight = new Subject<any>();

export function AndroidImage(): React.ReactElement {
  const query = useQuery();
  const sId = query.get("sId");
  const cId = query.get("cId");
  const android = query.get("android");
  const defaultResizeHeight = document.body.clientHeight - 118;

  const [error, setError] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [podRunning, setPodRunning] = React.useState(false);
  const [resizeHeight, setResizeHeight] = React.useState(defaultResizeHeight);

  const [, p2pStatus] = useSharedRequest<null, null, null>();

  React.useEffect((): void | (() => void | undefined) => {
    const fetch = (): void => {
      axios(`${POD}/${sId}`)
        .then((res): void =>
          setPodRunning(res.data.running && res.data.running === "true")
        )
        .catch((error): void => console.log(error.message));
    };

    if (android && android === "true" && !podRunning) {
      fetch();

      const podTimer = setInterval((): void => {
        fetch();
      }, 10000);

      return (): void => {
        clearInterval(podTimer);
      };
    }
  }, [podRunning, android]);

  React.useEffect((): void | (() => void | undefined) => {
    setResizeHeight(document.body.clientHeight - 118);

    window.onresize = (): void => {
      setResizeHeight(document.body.clientHeight - 50);
      finalHeight.next(0);
    };
    return (): void => {
      window.onresize = null;
    };
  }, [document.body.clientHeight]);

  React.useEffect((): void | (() => void | undefined) => {
    if (!sId || !cId) {
      setError("No Data");
      return;
    }

    const unmount = (): void => {
      const video = document.getElementsByTagName("video")[0];
      if (video && video.srcObject) {
        video.srcObject = null;
      }

      stopConnection();
    };

    window.addEventListener("beforeunload", unmount);

    if (!android || android && android === "true" && podRunning) {
      setShow(true);
      p2pStatus(`${P2P_STATUS}?id=${sId}&status=occupied`, "GET", null, null);

      socketConnect(cId, 0);
      createPeerConnection(sId, 0, setError);
      createDataChannel("message");
    }

    return (): void => {
      window.removeEventListener("beforeunload", unmount);
      unmount();
    };
  }, [sId, cId, podRunning]);

  const onResizeStop = (d: NumberSize): void => {
    setResizeHeight(resizeHeight + d.height);
    const pageHeight = document.body.clientHeight;
    const headerHeight = 72;
    const tabHeaderHeight = 46;
    const target = pageHeight - headerHeight - resizeHeight - d.height - tabHeaderHeight;
    finalHeight.next(target);
  };

  return (
    <>
      <Resizable
        style={resizableContainer}
        maxHeight={defaultResizeHeight}
        enable={{ bottom: true }}
        size={{ width: "auto", height: resizeHeight }}
        onResizeStop={(_e, _direction, _ref, d): void => onResizeStop(d)}
      >
        {android && android === "true" && !podRunning
          ? <Box h="calc(100vh - 118px)" p="20px"><SharedSpinner /></Box>
          : <>
            {error && <Box h="calc(100vh - 118px)" p="20px"><Box style={sharedTable}>{error}</Box></Box>}
            <Box h="calc(100vh - 118px)" display={error ? "none" : "block"}>
              <video
                style={{ width: "100%", height: "100%", objectFit: "fill" }}
                id={sId ? sId : "no-video"}
                playsInline={true}
                autoPlay={true}
                muted={true}
              />
            </Box>
          </>
        }
      </Resizable>
      {!error && <ImageControl setHeight={setResizeHeight} podRunning={show} />}
    </>
  );
}
