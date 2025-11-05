import { useState } from "react";
export const usePagination = (initialRows = 10) => {
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(initialRows);
    const onPageChange = (event) => {
        setFirst(event.first ?? 0);
        setRows(event.rows ?? initialRows);
    };
    const currentPage = first / rows + 1;
    return {
        first,
        rows,
        currentPage,
        onPageChange,
    };
};
