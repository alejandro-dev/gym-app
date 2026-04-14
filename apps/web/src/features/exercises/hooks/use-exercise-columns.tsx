"use client";

import { IconDotsVertical } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
   type Exercise,
   getExerciseCategoryLabelEs,
   getMuscleGroupLabelEs,
} from "@gym-app/types";

type UseExerciseColumnsParams = {
   onDelete: (exercise: Exercise) => void;
   onEdit: (exercise: Exercise) => void;
};

export function useExerciseColumns({
   onDelete,
   onEdit,
}: UseExerciseColumnsParams) {
   return [
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
            <div className="font-medium text-foreground">
               {getMuscleGroupLabelEs(row.original.muscleGroup)}
            </div>
         ),
      },
      {
         id: "category",
         header: "Categoría",
         cell: ({ row }) => (
            <div className="font-medium text-foreground">
               {getExerciseCategoryLabelEs(row.original.category)}
            </div>
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
                  <DropdownMenuItem onClick={() => onEdit(row.original)}>
                     Editar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                     variant="destructive"
                     onSelect={() => onDelete(row.original)}
                  >
                     Eliminar
                  </DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>
         ),
      },
   ] satisfies ColumnDef<Exercise>[];
}
