import { Column } from "react-table";

export type SharedTableProps<Data extends object> = {
  data: Data[];
  columns: Column<Data>[];
  pageSize: number;
};

export type OptionItem = {
  label: string;
  value: string;
};

export interface VersionOriginalModel {
  tag: string;
  create_date: string;
}

export interface ADBForward {
  androidIp: string;
  targetIp: string;
  targetPort: string;
}
