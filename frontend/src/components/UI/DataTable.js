import { jsx as _jsx } from "react/jsx-runtime";
import { Column } from "primereact/column";
import { DataTable as PrimeDataTable } from "primereact/datatable";
export const DataTable = ({ value, columns, loading = false, totalRecords, rows = 10, first = 0, onPage, }) => {
    return (_jsx(PrimeDataTable, { value: value, loading: loading, paginator: true, rows: rows, totalRecords: totalRecords, lazy: !!onPage, first: first, onPage: onPage, emptyMessage: "Sin registros", tableStyle: { minWidth: "50rem" }, children: columns.map((col) => (_jsx(Column, { field: col.field, header: col.header, body: col.body }, col.field))) }));
};
