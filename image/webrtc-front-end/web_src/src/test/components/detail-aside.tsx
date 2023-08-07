import { Box, Flex, SimpleGrid, Text } from "@chakra-ui/react";
import React from "react";
import { TestInfo } from "../models/test";

export function DetailAside(props: { data: TestInfo }): React.ReactElement {
  const { data } = props;

  return (
    <Box width="100%">
      <Box borderWidth="1px" borderRadius="12px" p="4" mb="4">
        <SimpleGrid minChildWidth="300px" spacing="40px">
          <Flex justifyContent="space-between">
            <Text>Session ID</Text>
            <Text color="gray.500">{data.sessionId}</Text>
          </Flex>
          <Flex justifyContent="space-between">
            <Text>Session name</Text>
            <Text color="gray.500">{data.sessionName}</Text>
          </Flex>
          <Flex justifyContent="space-between">
            <Text>Test version</Text>
            <Text color="gray.500">{data.testVersion}</Text>
          </Flex>
          <Flex justifyContent="space-between">
            <Text>Android version</Text>
            <Text color="gray.500">{data.androidVersion}</Text>
          </Flex>
          <Flex justifyContent="space-between">
            <Text>HEVC</Text>
            <Text color="gray.500">{data.hevcEnable === "true" ? "Yes" : "No"}</Text>
          </Flex>
          <Flex justifyContent="space-between">
            <Text>Logs</Text>
            <Text color="gray.500">{data.logCapture ? "Yes" : "No"}</Text>
          </Flex>
          <Flex justifyContent="space-between">
            <Text>Force encoding</Text>
            <Text color="gray.500">{data.icrStartImmediately ? "Yes" : "No"}</Text>
          </Flex>
          <Flex justifyContent="space-between">
            <Text>Shared Data PVC</Text>
            <Text color="gray.500">{data.shareDataPVC ? data.shareDataPVC : "No"}</Text>
          </Flex>
          <Flex justifyContent="space-between">
            <Text>Shared Data Monopolize</Text>
            <Text color="gray.500">{data.shareDataMonopolize ? "Yes" : "No"}</Text>
          </Flex>
        </SimpleGrid>
      </Box>
    </Box>
  );
}
