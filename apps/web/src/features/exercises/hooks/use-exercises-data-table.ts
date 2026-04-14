"use client";

import {
   getCoreRowModel,
   useReactTable,
   type ColumnDef,
   type PaginationState,
} from "@tanstack/react-table";

type UseExercisesDataTableParams<TData> = {
   columns: ColumnDef<TData>[];
   data: TData[];
   getRowId: (row: TData) => string;
   pagination: PaginationState;
   pageCount: number;
   onPaginationChange: React.Dispatch<React.SetStateAction<PaginationState>>;
};

export function useExercisesDataTable<TData>({
   columns,
   data,
   getRowId,
   pagination,
   pageCount,
   onPaginationChange,
}: UseExercisesDataTableParams<TData>) {
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
