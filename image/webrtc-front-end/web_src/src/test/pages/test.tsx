import { SearchIcon } from "@chakra-ui/icons";
import {
  Button,
  CSSObject,
  HStack,
  Input,
  InputGroup,
  InputLeftElement
} from "@chakra-ui/react";
import React from "react";
import { useNavigate, useLocation } from "react-router";
import { Select, SingleValue } from "chakra-react-select";
import { testListOptions, TestSummary } from "../models/test";
import { SharedSpinner } from "../../core/components/shared-spinner";
import { TestSummaryData } from "../components/test-summary-data";
import { UserResponse } from "../../core/models/user";
import { OptionItem } from "../../core/models/shared";
import { useSharedRequest } from "../../core/services/shared-request";
import { TEST_SUMMARY_LIST } from "../../core/services/apis";

export function Test(): React.ReactElement {
  const navigate = useNavigate();
  const loaction = useLocation();

  const [cu] = React.useState<UserResponse>(
    localStorage.getItem("android-cloud-user") && JSON.parse(localStorage.getItem("android-cloud-user")!)
  );
  const [filter, setFilter] = React.useState("");
  const [datasource, setDatasource] = React.useState<TestSummary[]>([]);

  const [testSummaryListState, getTestSummaryList] = useSharedRequest<null, { userId: string; filter?: string }, TestSummary[]>();
  const resultList = filter
    ? datasource.filter((item): boolean => item.sessionId?.includes(filter) || item.sessionName.includes(filter))
    : datasource;

  const handleNavigateChange = (option: SingleValue<OptionItem>): void => {
    navigate(`/test/${option?.value}`);
  };

  React.useEffect((): void => {
    getTestSummaryList(TEST_SUMMARY_LIST, "GET", null,
      { userId: cu.id, filter: loaction.pathname.split("/")[2] }, (data): void => {
        setDatasource(data);
      });
  }, [cu.id, loaction.pathname.split("/")[2]]);

  return (
    <>
      <HStack mb="4" spacing="16px">
        <Select
          chakraStyles={{
            control: (provided): CSSObject => ({ ...provided, width: 150 }),
            menu: (provided): CSSObject => ({ ...provided, width: 150 })
          }}
          value={testListOptions.filter((option): boolean => option.value === loaction.pathname.split("/")[2])}
          options={testListOptions}
          useBasicStyles={true}
          isSearchable={false}
          onChange={handleNavigateChange}
        />
        <InputGroup>
          <InputLeftElement
            pointerEvents="none"
            children={<SearchIcon color="gray.300" />}
          />
          <Input
            bg="#f6f8fa"
            _focus={{ bg: "white" }}
            placeholder="Search session id or name"
            onChange={(e): void => setFilter(e.target.value)} />
        </InputGroup>
        <Button pl="8" pr="8" colorScheme="blue" onClick={(): void => navigate("/test/add")}>New test request</Button>
      </HStack>
      {testSummaryListState.isLoading ? <SharedSpinner /> : <TestSummaryData data={resultList} />}
    </>
  );
}
