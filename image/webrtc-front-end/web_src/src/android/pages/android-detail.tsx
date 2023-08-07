import { Badge, Box, Button, Flex, HStack, SimpleGrid, Spacer, Text } from "@chakra-ui/react";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SharedSpinner } from "../../core/components/shared-spinner";
import { SharedTable } from "../../core/components/shared-table";
import { ANDROID_DETAIL, ANDROID_REQUEST_DELETE } from "../../core/services/apis";
import { useSharedRequest } from "../../core/services/shared-request";
import { AndroidDetail, androidInstanceColumns, initialAndroidDetail } from "../models/android";

export function AndroidDetailPage(): React.ReactElement {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();

  const [data, setData] = React.useState<AndroidDetail>(initialAndroidDetail);

  const [deleteState, deleteTest] = useSharedRequest<null, null, null>();
  const [androidDetailState, getAndroidDetail] = useSharedRequest<null, null, AndroidDetail>();

  const handleDeleteTest = (): void => {
    deleteTest(`${ANDROID_REQUEST_DELETE}/${sessionId}`, "GET", null, null, (): void => {
      navigate("/android");
    });
  };

  React.useEffect((): void | (() => void | undefined) => {
    getAndroidDetail(`${ANDROID_DETAIL}/${sessionId}`, "GET", null, null, (data): void => {
      setData(data);
    });
  }, [sessionId]);

  return (
    androidDetailState.isLoading
      ? <SharedSpinner />
      :<Flex alignItems="flex-start">
        <Box w="100%">
          {data.androidInfo.sessionId
            && <>
              <Box borderWidth="1px" borderRadius="12px" p="3" mb="4">
                <HStack>
                  <Box>
                    <Button
                      size="sm"
                      mr={4}
                      variant="outline"
                      colorScheme="red"
                      loadingText="Delete"
                      isLoading={deleteState.isLoading}
                      onClick={handleDeleteTest}
                    >
                      Delete
                    </Button>
                  </Box>
                  <Spacer />
                  <Badge colorScheme="green" mr={3}>Running</Badge>
                </HStack>
              </Box>
              <Box width="100%">
                <Box borderWidth="1px" borderRadius="12px" p="4" mb="4">
                  <SimpleGrid minChildWidth="300px" spacing="40px">
                    <Flex justifyContent="space-between">
                      <Text>Session ID</Text>
                      <Text color="gray.500">{data.androidInfo.sessionId}</Text>
                    </Flex>
                    <Flex justifyContent="space-between">
                      <Text>Android version</Text>
                      <Text color="gray.500">{data.androidInfo.version}</Text>
                    </Flex>
                  </SimpleGrid>
                </Box>
              </Box>
            </>
          }
          <SharedTable columns={androidInstanceColumns} data={data.androidInstances} pageSize={1000} />
        </Box>
      </Flex>
  );
}
