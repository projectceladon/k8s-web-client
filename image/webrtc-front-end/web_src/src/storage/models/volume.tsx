import { CellValue, Column } from "react-table";
import { DeleteVolume } from "../components/delete-volume";

export interface PersistentVolumeClaim {
  name: string;
  storage_class?: string;
  size?: string;
  access_mode?: string;
}

export const volumeListColumns: Column<PersistentVolumeClaim>[] = [
  {
    Header: "Name",
    accessor: "name"
  },
  {
    Header: "Access mode",
    accessor: "access_mode"
  },
  {
    Header: "Storage class",
    accessor: "storage_class"
  },
  {
    Header: "Size",
    accessor: "size"
  },
  {
    Header: "Actions",
    Cell: (cell: CellValue): React.ReactElement => <DeleteVolume name={cell.row.values.name} />
  }
];
