"use client";

import {
   IconCopy,
   IconDotsVertical,
   IconEdit,
   IconEye,
   IconUserPlus,
} from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
   getWorkoutPlanGoalLabel,
   getWorkoutPlanLevelLabel,
   type WorkoutPlanViewModel,
} from "../components/types";

type UseWorkoutPlanColumnsParams = {
   onAssign: (plan: WorkoutPlanViewModel) => void;
   onDuplicate: (plan: WorkoutPlanViewModel) => void;
   onEdit: (plan: WorkoutPlanViewModel) => void;
   onOpenEditor: (plan: WorkoutPlanViewModel) => void;
};

export function useWorkoutPlanColumns({
   onAssign,
   onDuplicate,
   onEdit,
   onOpenEditor,
}: UseWorkoutPlanColumnsParams) {
   return [
      {
         accessorKey: "name",
         header: "Nombre",
         cell: ({ row }) => (
            <div className="space-y-1">
               <div className="flex items-center gap-2">
                  <div className="font-medium text-foreground">
                     {row.original.name}
                  </div>
                  {row.original.sourcePlanId ? (
                     <Badge variant="outline">Copia</Badge>
                  ) : null}
               </div>
               <div className="line-clamp-2 text-sm text-muted-foreground">
                  {row.original.description || "Sin descripción"}
               </div>
            </div>
         ),
         enableHiding: false,
      },
      {
         id: "athlete",
         header: "Atleta",
         cell: ({ row }) => (
            <div className="space-y-1">
               <div className="font-medium">
                  {getAthletePrimaryLabel(row.original)}
               </div>
               <div className="text-sm text-muted-foreground">
                  {getAthleteSecondaryLabel(row.original)}
               </div>
            </div>
         ),
      },
      {
         id: "planning",
         header: "Planificación",
         cell: ({ row }) => (
            <div className="flex flex-wrap items-center gap-2">
               <Badge variant="outline">
                  {getWorkoutPlanGoalLabel(row.original.goal)}
               </Badge>
               <Badge variant="outline">
                  {getWorkoutPlanLevelLabel(row.original.level)}
               </Badge>
               <Badge variant="outline">
                  {row.original.durationWeeks
                     ? `${row.original.durationWeeks} semanas`
                     : "Sin duración"}
               </Badge>
            </div>
         ),
      },
      {
         accessorKey: "isActive",
         header: "Estado",
         cell: ({ row }) => (
            <Badge variant={row.original.isActive ? "default" : "secondary"}>
               {row.original.isActive ? "Activo" : "Borrador"}
            </Badge>
         ),
      },
      {
         accessorKey: "updatedAt",
         header: "Actualizado",
         cell: ({ row }) => formatDate(row.original.updatedAt),
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
                     <span className="sr-only">Abrir menú</span>
                  </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onSelect={() => onOpenEditor(row.original)}>
                     <IconEye data-icon="inline-start" />
                     Ver detalle
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onEdit(row.original)}>
                     <IconEdit data-icon="inline-start" />
                     Editar plan
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onDuplicate(row.original)}>
                     <IconCopy data-icon="inline-start" />
                     Duplicar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => onAssign(row.original)}>
                     <IconUserPlus data-icon="inline-start" />
                     Asignar a atleta
                  </DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>
         ),
      },
   ] satisfies ColumnDef<WorkoutPlanViewModel>[];
}

function formatDate(date: string) {
   return new Intl.DateTimeFormat("es-ES", {
      dateStyle: "medium",
   }).format(new Date(date));
}

function getAthletePrimaryLabel(plan: WorkoutPlanViewModel) {
   let nameFromUser = "Sin nombre";
   if (plan.user) {
      nameFromUser =
         `${plan.user.firstName ?? ""} ${plan.user.lastName ?? ""}`.trim() ||
         "Sin nombre";
   }
   return nameFromUser;
}

function getAthleteSecondaryLabel(plan: WorkoutPlanViewModel) {
   let emailFromUser = "Sin asignar";
   if (plan.user && plan.user.email) {
      emailFromUser = plan.user.email;
   }
   return emailFromUser;
}
