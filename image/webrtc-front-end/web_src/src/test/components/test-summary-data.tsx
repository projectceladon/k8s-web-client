import { Box, Flex, HStack, Stat, StatHelpText, StatLabel, StatNumber, Text } from "@chakra-ui/react";
import React from "react";
import { useNavigate } from "react-router";
import { sharedTable } from "../../core/styles/shared.styles";
import { TestSummary } from "../models/test";

export function TestSummaryData(props: { data: TestSummary[] }): React.ReactElement {
  const { data } = props;
  const navigate = useNavigate();

  return (
    <>
      {!data.length
        ? <div style={sharedTable}>No data</div>
        : data.map((d, i ): React.ReactElement => (
          <Box
            key={i}
            borderWidth="1px"
            borderRadius="12px"
            p="3"
            mb="4"
            _hover={{ border: "1px solid", cursor: "pointer" }}
            onClick={(): void => navigate(`/test/detail/${d.sessionId}`)}
          >
            <Flex alignItems="center">
              <Stat>
                <StatLabel>{d.sessionId}</StatLabel>
                <StatNumber>{d.sessionName}-{d.testVersion}</StatNumber>
                <StatHelpText>
                  <HStack>
                    <Text color="gray.500">Test count: {d.count}</Text>
                    <Text color="gray.500">Start time: {d.sessionCreateDate}</Text>
                  </HStack>
                </StatHelpText>
              </Stat>
            </Flex>
          </Box>
        ))
      }
    </>
  );
}
