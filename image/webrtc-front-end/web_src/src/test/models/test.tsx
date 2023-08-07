import { UnorderedList, ListItem, Tag, TagLabel, Box, Link } from "@chakra-ui/react";
import { CellProps, Column } from "react-table";
import { OptionItem } from "../../core/models/shared";
import { TextSearchFilter } from "../../utils/filter";

export const testListOptions: OptionItem[] = [
  { label: "Running", value: "running" },
  { label: "History", value: "history" }
];

export const fpsOptions: OptionItem[] = [
  { label: "30", value: "30" },
  { label: "60", value: "60" }
];

export const resolutionOptions: OptionItem[] = [
  { label: "1280x720", value: "1280x720" },
  { label: "1920x1080", value: "1920x1080" }
];

export const monopolizeOptions: OptionItem[] = [
  { label: "No", value: "" },
  { label: "Yes", value: "true" }
];

export const configsOptions: OptionItem[] = [
  { label: "HEVC", value: "hevc" },
  { label: "Logs", value: "logs" },
  { label: "Force encoding", value: "force-encoding" },
  { label: "Keep instances", value: "keep-instances" }
];

type NodeType = "dg1" | "dg2" | "soft";
export const NODE_TYPES: NodeType[] = ["dg1", "dg2", "soft"];

export const configsToolTips = (
  <UnorderedList p={3}>
    <ListItem><b>HEVC:</b> Encoding with hevc format</ListItem>
    <ListItem><b>Logs:</b> Enable logs capture</ListItem>
    <ListItem><b>Force encoding:</b> Start encode even no user connected</ListItem>
    <ListItem><b>Keep instances:</b> Keep android and test instance running after test completed</ListItem>
  </UnorderedList>
);

export interface TestSummary {
  sessionId?: string;
  sessionName: string;
  sessionCreateDate?: string;
  testVersion: string;
  count: number;
}

export interface TestInfo extends TestSummary {
  androidVersion: string;
  hevcEnable?: string;
  logCapture?: string;
  icrStartImmediately?: string;
  shareDataMonopolize?: string;
  shareDataPVC?: string;
}

export interface TestInstance {
  testReqId: string;
  androidReqId: string;
  clientId: string;
  testRuning: string;
  status: number;
  result: number;
  startTime: string;
  deleteFlag: string;
}

export interface TestStartPayload extends TestInfo {
  userId: string;
  nodeType: string;
  fps?: string;
  resolutionX?: string;
  resolutionY?: string;
  testParameters?: string;
  nodeSelector?: string;
}

export interface TestDetail {
  testInfo: TestInfo
  testInstances: TestInstance[]
}

export const initialTestDetail: TestDetail = {
  testInfo: {
    sessionCreateDate: "",
    sessionName: "",
    sessionId: "",
    shareDataMonopolize: "",
    shareDataPVC: "",
    logCapture: "",
    icrStartImmediately: "",
    androidVersion: "",
    testVersion: "",
    count: 0
  },
  testInstances: []
};

export interface LogsFile {
  date: string;
  isDir: boolean;
  name: string;
  permission: string;
  size: string;
}

const getStatusDesc = (status: number, result: number): React.ReactNode => {
  switch (status) {
  case 0:
  case 1:
    return (
      <Tag variant="solid" colorScheme="facebook">
        <TagLabel>INITIALIZED</TagLabel>
      </Tag>
    );
  case 2:
    return (
      <Tag variant="solid" colorScheme="teal">
        <TagLabel>TESTING</TagLabel>
      </Tag>
    );
  case 3:
    if (result === 1) {
      return (
        <Tag variant="solid" colorScheme="green">
          <TagLabel>PASS</TagLabel>
        </Tag>
      );
    } else if (!result) {
      return (
        <Tag variant="solid" colorScheme="red">
          <TagLabel>FAIL</TagLabel>
        </Tag>
      );
    }
  }
};

const getAction = (
  status: number, testId: string, androidId: string, clientId: string, log?: string, deleteFlag?: string
): React.ReactNode => {
  switch (status) {
  case 0:
  case 1:
    return <>No action</>;
  case 2:
    return (
      <Box>
        {!deleteFlag && <Link
          href={`/#/image?sId=${androidId}&cId=${clientId}`}
          color="blue.500"
          isExternal={true}
          mr={4}
        >
          View
        </Link>}
        {log && <Link
          href={`/#/test/logs/${testId}`}
          color="blue.500"
          isExternal={true}
        >
          Logs
        </Link>}
        {!log && deleteFlag && <>No action</>}
      </Box>
    );
  case 3:
    return (
      <>
        {log ? <Link
          href={`/#/test/logs/${testId}`}
          color="blue.500"
          isExternal={true}
        >
          Logs
        </Link> : <>No action</>}
      </>
    );
  }
};

export const testInstanceColumns = (log?: string): Column<TestInstance>[] => [
  {
    Header: "Test request id",
    accessor: "testReqId",
    Filter: TextSearchFilter
  },
  {
    Header: "Status",
    accessor: "status",
    Cell: (cell: CellProps<TestInstance>): React.ReactElement =>
      <>{getStatusDesc(cell.row.values.status, cell.row.original.result)}</>
  },
  {
    Header: "Android request id",
    accessor: "androidReqId",
    Filter: TextSearchFilter
  },
  {
    Header: "Start time",
    accessor: "startTime"
  },
  {
    Header: "Action",
    Cell: (cell: CellProps<TestInstance>): React.ReactElement =>
      <>
        {getAction(
          cell.row.original.status,
          cell.cell.row.original.testReqId,
          cell.cell.row.original.androidReqId,
          cell.cell.row.original.clientId,
          log,
          cell.row.original.deleteFlag
        )}
      </>
  }
];
