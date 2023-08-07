import { Button, Flex, Spacer, Text } from "@chakra-ui/react";
import React from "react";
import { useParams } from "react-router";
import { LOGS_WATCHER } from "../../core/services/apis";
import { sharedTable } from "../../core/styles/shared.styles";
import { useWebSocket } from "../../hooks/use-web-socket";
import { download } from "../../utils/download";

export function TestLogsDetail(): React.ReactElement {
  const { testReqId, path } = useParams<{ testReqId: string; path: string }>();
  const [data, setData] = React.useState<React.ReactNode>(null);
  const uri = `${LOGS_WATCHER}?path=${testReqId}/${path}`;

  const downloadLogs = (): void => {
    const txt = document.querySelector(".log")?.innerHTML;
    download(txt, `test-request-${testReqId}-${path}.txt`);
  };

  const handleReceivedMessage = (e: MessageEvent<any>): void => {
    setData(
      (d): React.ReactNode => {
        return (
          <>
            {d ?? d}
            {e.data}
          </>
        );
      }
    );
  };

  useWebSocket(uri, handleReceivedMessage);

  return (
    <div style={{ width: "100%" }}>
      {!data ? (
        <div style={sharedTable}>No data</div>
      ) : (
        <>
          <Flex alignItems="center" mb={4}>
            <Text>{path?.toUpperCase()}</Text>
            <Spacer />
            <Button onClick={downloadLogs}>Download</Button>
          </Flex>
          <div className="log">{data}</div>
        </>
      )}
    </div>
  );
}
