import { useTable, useSortBy, usePagination, useFilters } from "react-table";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  chakra,
  Flex,
  TableContainer
} from "@chakra-ui/react";
import { SharedTableProps } from "../models/shared";
import { sharedTable } from "../styles/shared.styles";
import React from "react";

export function SharedTable<Data extends object>({
  data,
  columns,
  pageSize
}: SharedTableProps<Data>): React.ReactElement {
  const defaultColumn = React.useMemo(
    (): { Filter: string } => ({
      Filter: ""
    }), []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow
  } = useTable(
    {
      defaultColumn,
      columns,
      data,
      initialState: { pageIndex: 0, pageSize }
    },
    useFilters,
    useSortBy,
    usePagination
  );

  return (
    <TableContainer style={sharedTable}>
      {!data.length ? <>No data</>
        : <>
          <Table {...getTableProps()}>
            <Thead>
              {headerGroups.map((headerGroup, i): React.ReactNode => (
                <Tr {...headerGroup.getHeaderGroupProps()} key={`thead_tr_${i}`}>
                  {headerGroup.headers.map((column, i): React.ReactNode => (
                    <Th {...column.getHeaderProps()} key={`thead_th_${i}`}>
                      <Flex alignItems="center">
                        {column.render("Header")}
                        <chakra.div ml={3}>{column.canFilter ? column.render("Filter") : null}</chakra.div>
                      </Flex>
                    </Th>
                  ))}
                </Tr>
              ))}
            </Thead>
            <Tbody {...getTableBodyProps()}>
              {page.map((row, i): React.ReactNode => {
                prepareRow(row);
                return (
                  <Tr {...row.getRowProps()} key={`tbody_tr_${i}`}>
                    {row.cells.map((cell, i): React.ReactNode => (
                      <Td {...cell.getCellProps()} key={`tbody_td_${i}`}>
                        {cell.render("Cell")}
                      </Td>
                    ))}
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </>
      }
    </TableContainer>
  );
}
