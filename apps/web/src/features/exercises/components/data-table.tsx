"use client";

import * as React from "react";
import { type PaginationState } from "@tanstack/react-table";

import type { Exercise } from "@gym-app/types";
import { useExercisesDataTable } from "../hooks/use-exercises-data-table";
import { DataTableContent } from "./data-table-content";
import { AddExerciseDialog } from "./form-exercise";
import { DeleteExerciseDialog } from "./delete-exercise";
import { useDeleteExercise } from "../hooks/use-delete-exercise";
import { useExerciseColumns } from "../hooks/use-exercise-columns";
import { useExerciseForm } from "../hooks/use-exercise-form";

type DataTableProps = {
   data: Exercise[];
   isLoading: boolean;
   pageIndex: number;
   pageSize: number;
   search: string;
   filterGroupMuscle: string;
   filterCategory: string;
   total: number;
   onPaginationChange: React.Dispatch<React.SetStateAction<PaginationState>>;
   onSearchChange: (value: string) => void;
   onFilterGroupMuscleChange: (value: string) => void;
   onFilterCategoryChange: (value: string) => void;
   onClearFilters: () => void;
};

export function DataTable({
   data,
   isLoading,
   pageIndex,
   pageSize,
   search,
   filterGroupMuscle,
   filterCategory,
   total,
   onPaginationChange,
   onSearchChange,
   onFilterGroupMuscleChange,
   onFilterCategoryChange,
   onClearFilters,
}: DataTableProps) {
   const pageCount = Math.max(Math.ceil(total / pageSize), 1);
   const exerciseForm = useExerciseForm();
   const deleteExercise = useDeleteExercise();
   const columns = useExerciseColumns({
      onDelete: deleteExercise.openDelete,
      onEdit: exerciseForm.openEdit,
   });

   const {
      table,
   } = useExercisesDataTable({
      columns,
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
            isOpen={exerciseForm.isOpen}
            isSaving={exerciseForm.isSaving}
            mode={exerciseForm.selectedExercise ? "edit" : "create"}
            onOpenChange={exerciseForm.handleOpenChange}
            onMuscleGroupChange={exerciseForm.handleMuscleGroupChange}
            onCategoryChange={exerciseForm.handleCategoryChange}
            onIsCompoundChange={exerciseForm.handleIsCompoundChange}
            onSubmit={exerciseForm.handleSubmit}
            onValueChange={exerciseForm.handleValueChange}
            values={exerciseForm.values}
         />
         <DeleteExerciseDialog
            isDeleting={deleteExercise.isDeleting}
            isOpen={deleteExercise.isOpen}
            exercise={deleteExercise.selectedExercise}
            onConfirm={deleteExercise.handleConfirm}
            onOpenChange={deleteExercise.handleOpenChange}
         />
         <DataTableContent
            columnsLength={table.getAllColumns().length}
            isLoading={isLoading}
            onAddUser={exerciseForm.openCreate}
            table={table}
            total={total}
            search={search}
            filterGroupMuscle={filterGroupMuscle}
            filterCategory={filterCategory}
            onSearchChange={onSearchChange}
            onFilterGroupMuscleChange={onFilterGroupMuscleChange}
            onFilterCategoryChange={onFilterCategoryChange}
            onClearFilters={onClearFilters}
         />
      </>
   );
}
