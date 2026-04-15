"use client";

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
import { WorkoutPlanViewModel } from "./types";

type DeleteWorkoutPlanDialogProps = {
   isDeleting: boolean;
   isOpen: boolean;
   workoutPlan: WorkoutPlanViewModel | null;
   onConfirm: () => void;
   onOpenChange: (open: boolean) => void;
};

export function DeleteWorkoutPlanDialog({
   isDeleting,
   isOpen,
   workoutPlan,
   onConfirm,
   onOpenChange,
}: DeleteWorkoutPlanDialogProps) {
   return (
      <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
         <AlertDialogContent>
            <AlertDialogHeader>
               <AlertDialogTitle>¿Seguro que quieres eliminar este plan?</AlertDialogTitle>
               <AlertDialogDescription>
                  {workoutPlan
                     ? `Se eliminará permanentemente el plan de trabajo ${workoutPlan.name}. Esta acción no se puede deshacer.`
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
