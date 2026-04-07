"use client";

import * as React from "react";
import { IconDotsVertical } from "@tabler/icons-react";
import { type ColumnDef, type PaginationState } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Exercise } from "@gym-app/types";
import { useExercisesDataTable } from "../hooks/use-exercises-data-table";
import { DataTableContent } from "./data-table-content";
import { AddExerciseDialog } from "./form-exercise";
import { DeleteExerciseDialog } from "./delete-exercise";

type DataTableProps = {
   data: Exercise[];
   isLoading: boolean;
   pageIndex: number;
   pageSize: number;
   search: string;
   total: number;
   onPaginationChange: React.Dispatch<React.SetStateAction<PaginationState>>;
   onSearchChange: (value: string) => void;
};

export function DataTable({
   data,
   isLoading,
   pageIndex,
   pageSize,
   search,
   total,
   onPaginationChange,
   onSearchChange,
}: DataTableProps) {
   const pageCount = Math.max(Math.ceil(total / pageSize), 1);

   const {
      table,
      selectedExercise,
      isDialogOpen,
      isDeleteDialogOpen,
      isDeleting,
      isSaving,
      formValues,
      openCreateDialog,
      openEditDialog,
      openDeleteDialog,
      handleCreateExercise,
      handleDialogOpenChange,
      handleDeleteDialogOpenChange,
      handleDeleteExercise,
      handleFormValueChange,
      handleMuscleGroupChange,
      handleCategoryChange,
      handleIsCompoundChange,
   } = useExercisesDataTable({
      columns: [
         {
            accessorKey: "name",
            header: "Nombre",
            cell: ({ row }) => (
               <div className="font-medium text-foreground">{row.original.name}</div>
            ),
            enableHiding: false,
         },
         {
            accessorKey: "muscleGroup",
            header: "Grupo muscular",
            cell: ({ row }) => (
               <div className="font-medium text-foreground">{row.original.muscleGroup}</div>
            ),
         },
         {
            id: "category",
            header: "Categoría",
            cell: ({ row }) => (
               <div className="font-medium text-foreground">{row.original.category}</div>
            ),
         },
         {
            id: "actions",
            cell: ({ row }) => (
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button
                        variant="ghost"
                        className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                        size="icon"
                     >
                        <IconDotsVertical />
                        <span className="sr-only">Open menu</span>
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                     <DropdownMenuItem onClick={() => openEditDialog(row.original)}>
                        Edit
                     </DropdownMenuItem>
                     <DropdownMenuItem>View</DropdownMenuItem>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => openDeleteDialog(row.original)}
                     >
                        Delete
                     </DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
            ),
         },
      ] satisfies ColumnDef<Exercise>[],
      data,
      getRowId: (row) => row.id,
      pagination: {
         pageIndex,
         pageSize,
      },
      pageCount,
      onPaginationChange,
   });

   return (
      <>
         <AddExerciseDialog
            isOpen={isDialogOpen}
            isSaving={isSaving}
            mode={selectedExercise ? "edit" : "create"}
            onOpenChange={handleDialogOpenChange}
            onMuscleGroupChange={handleMuscleGroupChange}
            onCategoryChange={handleCategoryChange}
            onIsCompoundChange={handleIsCompoundChange}
            onSubmit={handleCreateExercise}
            onValueChange={handleFormValueChange}
            values={formValues}
         />
         <DeleteExerciseDialog
            isDeleting={isDeleting}
            isOpen={isDeleteDialogOpen}
            exercise={selectedExercise}
            onConfirm={handleDeleteExercise}
            onOpenChange={handleDeleteDialogOpenChange}
         />
         <DataTableContent
            columnsLength={table.getAllColumns().length}
            isLoading={isLoading}
            onAddUser={openCreateDialog}
            table={table}
            total={total}
            search={search}
            onSearchChange={onSearchChange}
         />
      </>
   );
}
