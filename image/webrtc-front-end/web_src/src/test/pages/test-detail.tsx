import { Badge, Box, Button, Flex, HStack, Spacer } from "@chakra-ui/react";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SharedTable } from "../../core/components/shared-table";
import { WS, STOP_TEST } from "../../core/services/apis";
import { useSharedRequest } from "../../core/services/shared-request";
import { useWebSocket } from "../../hooks/use-web-socket";
import { isJson } from "../../utils/is-json";
import { DetailAside } from "../components/detail-aside";
import { initialTestDetail, TestDetail, testInstanceColumns } from "../models/test";

export function TestDetailPage(): React.ReactElement {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const uri = `${WS}`;

  const [stopState, stopTest] = useSharedRequest<null, null, null>();
  const [deleteState, deleteTest] = useSharedRequest<null, null, null>();
  const [data, setData] = React.useState<TestDetail>(initialTestDetail);

  const handleDeleteTest = (): void => {
    deleteTest(`${STOP_TEST}/${sessionId}?delete=true`, "GET", null, null, (): void => {
      navigate("/test/running");
    });
  };

  const handleStopTest = (): void => {
    stopTest(`${STOP_TEST}/${sessionId}`, "GET", null, null, (): void => {
      socket?.send(`test-detail,${sessionId}`);
    });
  };

  const handleReceivedMessage = (e: MessageEvent<any>): void => {
    if (isJson(e.data)) {
      setData(JSON.parse(e.data));
    }
  };

  const socket = useWebSocket(uri, handleReceivedMessage);

  React.useEffect((): void | (() => void | undefined) => {
    socket?.send(`test-detail,${sessionId}`);

    const timer = setInterval((): void => {
      socket?.send(`test-detail,${sessionId}`);
    }, 10000);

    return (): void => clearInterval(timer);
  }, [socket, sessionId]);

  return (
    <Flex alignItems="flex-start">
      <Box w="100%">
        {data.testInfo.sessionId
          && <>
            <Box borderWidth="1px" borderRadius="12px" p="3" mb="4">
              <HStack>
                <Box>
                  {JSON.stringify(data.testInstances).includes("true")
                  && data.testInstances[0].deleteFlag === ""
                  && <Button
                    size="sm"
                    mr={4}
                    variant="outline"
                    colorScheme="red"
                    loadingText="Stop"
                    isLoading={stopState.isLoading}
                    isDisabled={deleteState.isLoading}
                    onClick={handleStopTest}
                  >
                    Stop
                  </Button>
                  }
                  <Button
                    size="sm"
                    mr={4}
                    variant="outline"
                    colorScheme="red"
                    loadingText="Delete"
                    isLoading={deleteState.isLoading}
                    isDisabled={stopState.isLoading}
                    onClick={handleDeleteTest}
                  >
                    Delete
                  </Button>
                </Box>
                <Spacer />
                {JSON.stringify(data.testInstances).includes("true")
                && data.testInstances[0].deleteFlag === ""
                  ? <Badge colorScheme="green" mr={3}>Running</Badge>
                  : <Badge colorScheme="red" mr={3}>Stopped</Badge>
                }
              </HStack>
            </Box>
            <DetailAside data={data.testInfo} />
          </>
        }
        <SharedTable
          columns={testInstanceColumns(data.testInfo.logCapture)}
          data={data.testInstances}
          pageSize={1000}
        />
      </Box>
    </Flex>
  );
}
