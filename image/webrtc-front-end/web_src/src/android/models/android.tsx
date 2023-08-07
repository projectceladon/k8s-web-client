import { Link } from "@chakra-ui/react";
import { CellProps, Column } from "react-table";
import { TextSearchFilter } from "../../utils/filter";

export interface VersionModel {
  tag: string;
  key: number;
  node: string[];
  createDate: string;
}

export interface AndroidRequestInstance {
  id: string;
  clientId: string;
  startTime: string;
}

export interface AndroidRequestInfo {
  sessionId?: string;
  version: string;
  nodeType: string;
  userId?: string;
  count: number;
  sessionCreateDate?: string;
}

export interface AndroidDetail {
  androidInfo: AndroidRequestInfo
  androidInstances: AndroidRequestInstance[]
}

export const initialAndroidDetail: AndroidDetail = {
  androidInfo: {
    sessionCreateDate: "",
    sessionId: "",
    version: "",
    nodeType: "",
    count: 0
  },
  androidInstances: []
};

export const androidInstanceColumns: Column<AndroidRequestInstance>[] = [
  {
    Header: "Android request id",
    accessor: "id",
    Filter: TextSearchFilter
  },
  {
    Header: "Start time",
    accessor: "startTime"
  },
  {
    Header: "Action",
    Cell: (cell: CellProps<AndroidRequestInstance>): React.ReactElement => (
      <Link
        href={`/#/image?sId=${cell.cell.row.original.id}&cId=${cell.cell.row.original.clientId}&android=true`}
        color="blue.500"
        isExternal={true}
        mr={4}
      >
        View
      </Link>
    )
  }
];
