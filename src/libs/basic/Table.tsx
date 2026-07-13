import { Table as MaintineTable } from "@mantine/core";
import type React from "react";
import type { TSizes } from "../types";
interface TableProp {
  headers: React.ReactNode[];
  rows: React.ReactNode[][];
  highlightOnHover?: boolean;
  rowBorder?: boolean;
  colBorder?: boolean;
  striped?: boolean;
  tableBorder?: boolean;
  hSpacing?: TSizes;
  vSpacing?: TSizes;
}

export function Table({
  headers,
  rows,
  tableBorder = true,
  rowBorder = true,
  colBorder,
  highlightOnHover,
  striped,
}: TableProp) {
  return (
    <MaintineTable
      highlightOnHover={highlightOnHover}
      withTableBorder={tableBorder}
      withRowBorders={rowBorder}
      withColumnBorders={colBorder}
      striped={striped}
    >
      <MaintineTable.Thead>
        <MaintineTable.Tr>
          {headers.map((header) => (
            <MaintineTable.Th>{header}</MaintineTable.Th>
          ))}
        </MaintineTable.Tr>
      </MaintineTable.Thead>
      <MaintineTable.Tbody>
        {rows.map((row) => (
          <MaintineTable.Tr>
            {row.map((r) => (
              <MaintineTable.Td>{r}</MaintineTable.Td>
            ))}
          </MaintineTable.Tr>
        ))}
      </MaintineTable.Tbody>
    </MaintineTable>
  );
}
