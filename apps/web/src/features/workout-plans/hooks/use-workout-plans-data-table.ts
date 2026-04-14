"use client";

import {
   getCoreRowModel,
   useReactTable,
   type ColumnDef,
   type PaginationState,
} from "@tanstack/react-table";

type UseWorkoutPlansDataTableParams<TData> = {
   columns: ColumnDef<TData>[];
   data: TData[];
   getRowId: (row: TData) => string;
   pagination: PaginationState;
   pageCount: number;
   onPaginationChange: React.Dispatch<React.SetStateAction<PaginationState>>;
};

// Hook fino sobre TanStack Table para mantener la configuración del listado
// de planes en un solo sitio. Solo exigimos id porque WorkoutPlanViewModel
// no es exactamente igual al WorkoutPlan persistido cuando está en edición.
export function useWorkoutPlansDataTable<TData extends { id: string }>({
   columns,
   data,
   getRowId,
   pagination,
   pageCount,
   onPaginationChange,
}: UseWorkoutPlansDataTableParams<TData>) {
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
