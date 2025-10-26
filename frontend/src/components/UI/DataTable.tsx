import { Column } from "primereact/column";
import { DataTable as PrimeDataTable, DataTablePageEvent } from "primereact/datatable";
import { ReactNode } from "react";

export interface ColumnDef<T> {
  field: string;
  header: string;
  body?: (rowData: T) => ReactNode;
}

interface DataTableProps<T> {
  value: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  totalRecords?: number;
  rows?: number;
  first?: number;
  onPage?: (event: DataTablePageEvent) => void;
}

export const DataTable = <T extends object>({
  value,
  columns,
  loading = false,
  totalRecords,
  rows = 10,
  first = 0,
  onPage,
}: DataTableProps<T>) => {
  return (
    <PrimeDataTable
      value={value}
      loading={loading}
      paginator
      rows={rows}
      totalRecords={totalRecords}
      lazy={!!onPage}
      first={first}
      onPage={onPage}
      emptyMessage="Sin registros"
      tableStyle={{ minWidth: "50rem" }}
    >
      {columns.map((col) => (
        <Column key={col.field} field={col.field} header={col.header} body={col.body} />
      ))}
    </PrimeDataTable>
  );
};
