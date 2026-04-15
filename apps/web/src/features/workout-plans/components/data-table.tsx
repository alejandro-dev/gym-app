"use client";

import * as React from "react";
import { type PaginationState } from "@tanstack/react-table";
import type { WorkoutPlan } from "@gym-app/types";
import { useRouter } from "next/navigation";

import { DataTableContent } from "./data-table-content";
import { AssignPlanDialog } from "./assign-plan-dialog";
import { WorkoutPlanFormDialog } from "./form-plan";
import { useAssignWorkoutPlan } from "../hooks/use-assign-workout-plan";
import { useWorkoutPlanColumns } from "../hooks/use-workout-plan-columns";
import { useWorkoutPlanForm } from "../hooks/use-workout-plan-form";
import { useWorkoutPlansDataTable } from "../hooks/use-workout-plans-data-table";
import { useWorkoutPlansState } from "../hooks/use-workout-plans-state";
import useAthletesOptions from "../hooks/use-athletes-options";
import { DeleteWorkoutPlanDialog } from "./delete-workout-plan";
import { useDeleteWorkoutPlan } from "../hooks/use-delete-workout-plan";

type DataTableProps = {
   data: WorkoutPlan[];
   isLoading: boolean;
   pageIndex: number;
   pageSize: number;
   search: string;
   total: number;
   onPaginationChange: React.Dispatch<React.SetStateAction<PaginationState>>;
   onSearchChange: (value: string) => void;
   onClearFilters: () => void;
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
   onClearFilters,
}: DataTableProps) {
   const router = useRouter();
   // La tabla trabaja con una copia local para reflejar cambios hechos en dialogs
   // sin esperar a refrescar el listado completo desde la API.
   const {
      plans,
      activePlans,
      assignedPlans,
      templatePlans,
      setPlans,
   } = useWorkoutPlansState(data);
   const planForm = useWorkoutPlanForm({ setPlans });
   const assignPlan = useAssignWorkoutPlan({ setPlans });
   const athletesOptionsQuery = useAthletesOptions();
   const deleteWorkoutPlan = useDeleteWorkoutPlan({ setPlans });

   const effectiveTotal = Math.max(total, plans.length);
   const pageCount = Math.max(Math.ceil(effectiveTotal / pageSize), 1);

   // "Ver detalle" ya no abre un Sheet: navega a una pantalla completa del plan.
   const columns = useWorkoutPlanColumns({
      onAssign: assignPlan.openAssign,
      onDuplicate: planForm.openDuplicate,
      onEdit: planForm.openEdit,
      onOpenEditor: (plan) => router.push(`/workout-plans/${plan.id}`),
      onDelete: deleteWorkoutPlan.openDelete,
   });

   const {
      table,
   } = useWorkoutPlansDataTable({
      columns,
      data: plans,
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
         <WorkoutPlanFormDialog
            isOpen={planForm.isOpen}
            isSaving={planForm.isSaving}
            mode={planForm.mode}
            onOpenChange={planForm.handleOpenChange}
            onSubmit={planForm.handleSubmit}
            onValueChange={planForm.handleValueChange}
            onGoalChange={(value) =>
               planForm.setValues((current) => ({ ...current, goal: value }))
            }
            onLevelChange={(value) =>
               planForm.setValues((current) => ({ ...current, level: value }))
            }
            onStatusChange={(value) =>
               planForm.setValues((current) => ({ ...current, isActive: value }))
            }
            values={planForm.values}
         />
         <AssignPlanDialog
            isOpen={assignPlan.isOpen}
            isSaving={assignPlan.isSaving}
            planName={assignPlan.selectedPlan?.name}
            values={assignPlan.values}
            onOpenChange={assignPlan.handleOpenChange}
            onSubmit={assignPlan.handleSubmit}
            onAthleteChange={assignPlan.handleAthleteChange}
            athletesOptions={athletesOptionsQuery.data ?? []}
         />
         <DeleteWorkoutPlanDialog
            isDeleting={deleteWorkoutPlan.isDeleting}
            isOpen={deleteWorkoutPlan.isOpen}
            workoutPlan={deleteWorkoutPlan.selectedWorkoutPlan}
            onConfirm={deleteWorkoutPlan.handleConfirm}
            onOpenChange={deleteWorkoutPlan.handleOpenChange}
         />
         <DataTableContent
            columnsLength={table.getAllColumns().length}
            isLoading={isLoading}
            table={table}
            total={effectiveTotal}
            search={search}
            activePlans={activePlans}
            assignedPlans={assignedPlans}
            templatePlans={templatePlans}
            onCreatePlan={planForm.openCreate}
            onSearchChange={onSearchChange}
            onClearFilters={onClearFilters}
         />
      </>
   );
}
