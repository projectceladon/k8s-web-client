import { SearchIcon } from "@chakra-ui/icons";
import {
  HStack,
  InputGroup,
  InputLeftElement,
  Input,
  Box,
  Flex,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  Button
} from "@chakra-ui/react";
import React from "react";
import { useNavigate } from "react-router";
import { SharedSpinner } from "../../core/components/shared-spinner";
import { UserResponse } from "../../core/models/user";
import { ANDROID_REQUEST_LIST } from "../../core/services/apis";
import { useSharedRequest } from "../../core/services/shared-request";
import { sharedTable } from "../../core/styles/shared.styles";
import { AnroidRequestModal } from "../components/android-request-modal";
import { AndroidRequestInfo } from "../models/android";

export function Android(): React.ReactElement {
  const navigate = useNavigate();
  const [cu] = React.useState<UserResponse>(
    localStorage.getItem("android-cloud-user") && JSON.parse(localStorage.getItem("android-cloud-user")!)
  );
  const [filter, setFilter] = React.useState("");
  const [datasource, setDatasource] = React.useState<AndroidRequestInfo[]>([]);

  const [androidRequestListState, getAndroidRequestList] = useSharedRequest<null, { userId: string }, AndroidRequestInfo[]>();
  const resultList = filter ? datasource.filter((item): boolean => !!item.sessionId?.includes(filter)) : datasource;

  React.useEffect((): void | (() => void | undefined) => {
    getAndroidRequestList(ANDROID_REQUEST_LIST, "GET", null, { userId: cu.id }, (data): void => {
      setDatasource(data);
    });
  }, [cu.id]);

  return (
    <>
      <HStack mb="4" spacing="16px">
        <InputGroup>
          <InputLeftElement
            pointerEvents="none"
            children={<SearchIcon color="gray.300" />}
          />
          <Input
            bg="#f6f8fa"
            _focus={{ bg: "white" }}
            placeholder="Search android session id"
            onChange={(e): void => setFilter(e.target.value)} />
        </InputGroup>
        <AnroidRequestModal />
        <Button pl="8" pr="8" onClick={(): void => navigate("/android/manage-images")}>Manage images</Button>
      </HStack>
      {androidRequestListState.isLoading ? <SharedSpinner /> : !resultList.length
        ? <div style={sharedTable}>No data</div>
        : resultList.map((d, i): React.ReactElement => (
          <Box
            borderWidth="1px"
            borderRadius="12px"
            p="3"
            mb="4"
            key={i}
            _hover={{ border: "1px solid", cursor: "pointer" }}
            onClick={(): void => navigate(`/android/detail/${d.sessionId}`)}
          >
            <Flex alignItems="center">
              <Stat>
                <StatLabel>{d.sessionId}</StatLabel>
                <StatNumber>{d.version}</StatNumber>
                <StatHelpText>
                  <HStack>
                    <Text color="gray.500">Android count: {d.count}</Text>
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
