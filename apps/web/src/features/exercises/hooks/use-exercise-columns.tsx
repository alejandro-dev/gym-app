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
         id: "image",
         header: "Imagen",
         cell: ({ row }) => {
            const imageUrl = row.original.imageUrl;

            return (
               <div className="flex size-10 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                  {imageUrl ? (
                     // eslint-disable-next-line @next/next/no-img-element
                     <img
                        src={imageUrl}
                        alt={`Imagen de ${row.original.name}`}
                        className="h-full w-full object-cover"
                     />
                  ) : (
                     <span className="text-xs font-medium text-muted-foreground">
                        {row.original.name.charAt(0).toUpperCase()}
                     </span>
                  )}
               </div>
            );
         },
         enableSorting: false,
         enableHiding: false,
      },
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
