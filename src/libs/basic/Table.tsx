import { Table as MaintineTable } from '@mantine/core';
import type React from 'react';
import type { TSizes } from '../types';
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
  highlightOnHover = true,
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
          {headers.map((header, i) => (
            <MaintineTable.Th key={i} ta={'center'}>
              {header}
            </MaintineTable.Th>
          ))}
        </MaintineTable.Tr>
      </MaintineTable.Thead>
      <MaintineTable.Tbody>
        {rows.map((row, i) => (
          <MaintineTable.Tr key={i}>
            {row.map((r, j) => (
              <MaintineTable.Td key={j} ta={'center'}>
                {r}
              </MaintineTable.Td>
            ))}
          </MaintineTable.Tr>
        ))}
      </MaintineTable.Tbody>
    </MaintineTable>
  );
}
