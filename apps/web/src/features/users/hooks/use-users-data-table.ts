"use client";

import {
   getCoreRowModel,
   useReactTable,
   type ColumnDef,
   type PaginationState,
} from "@tanstack/react-table";

type UseUsersDataTableParams<TData> = {
   columns: ColumnDef<TData>[];
   data: TData[];
   getRowId: (row: TData) => string;
   pagination: PaginationState;
   pageCount: number;
   onPaginationChange: React.Dispatch<React.SetStateAction<PaginationState>>;
};

export function useUsersDataTable<TData>({
   columns,
   data,
   getRowId,
   pagination,
   pageCount,
   onPaginationChange,
}: UseUsersDataTableParams<TData>) {
   const table = useReactTable({
      data,
      columns,
      state: {
         pagination,
      },
      pageCount,
      manualPagination: true,
      getRowId,
      onPaginationChange,
      getCoreRowModel: getCoreRowModel(),
   });

   return {
      table,
   };
}
