"use client";

import type { Exercise } from "@gym-app/types";

import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type DeleteExerciseDialogProps = {
   isDeleting: boolean;
   isOpen: boolean;
   exercise: Exercise | null;
   onConfirm: () => void;
   onOpenChange: (open: boolean) => void;
};

export function DeleteExerciseDialog({
   isDeleting,
   isOpen,
   exercise,
   onConfirm,
   onOpenChange,
}: DeleteExerciseDialogProps) {
   return (
      <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
         <AlertDialogContent>
            <AlertDialogHeader>
               <AlertDialogTitle>¿Seguro que quieres eliminar este ejercicio?</AlertDialogTitle>
               <AlertDialogDescription>
                  {exercise
                     ? `Se eliminará permanentemente el ejercicio ${exercise.name}. Esta acción no se puede deshacer.`
                     : "Esta acción no se puede deshacer."}
               </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
               <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
               <AlertDialogAction
                  variant="destructive"
                  disabled={isDeleting}
                  onClick={onConfirm}
               >
                  {isDeleting ? "Eliminando..." : "Eliminar"}
               </AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
   );
}
