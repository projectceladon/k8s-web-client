import { VStack, StackDivider, Box, Link, Icon, Flex } from "@chakra-ui/react";
import React from "react";
import { AiOutlineFile } from "react-icons/ai";
import { useParams } from "react-router-dom";
import { LOGS_FILES } from "../../core/services/apis";
import { useSharedRequest } from "../../core/services/shared-request";
import { LogsFile } from "../models/test";

export function TestLogs(): React.ReactElement {
  const { testReqId } = useParams<{ testReqId: string }>();
  const [datasource, setDatasource] = React.useState<LogsFile[]>([]);
  const [, gettestLogs] = useSharedRequest<null, { path?: string }, LogsFile[]>();

  React.useEffect((): void => {
    gettestLogs(LOGS_FILES, "GET", null, { path: testReqId }, (data): void => {
      setDatasource(data);
    });
  }, []);

  return (
    <Box borderWidth="1px" borderRadius="12px" p="4" mb="4">
      <VStack
        divider={<StackDivider borderColor="gray.200" />}
        spacing={4}
        align="stretch"
      >
        {datasource.map((l, i): React.ReactElement => (
          <Flex key={i} alignItems="center">
            <Icon mr={2} as={AiOutlineFile} />
            <Link href={`/#/test/logs/${testReqId}/${l.name}`} isExternal={true}>{l.name}</Link>
          </Flex>
        ))}
      </VStack>
    </Box>
  );
}
