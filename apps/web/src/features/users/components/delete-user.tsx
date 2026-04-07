"use client";

import type { User } from "@gym-app/types";

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

type DeleteUserDialogProps = {
   isDeleting: boolean;
   isOpen: boolean;
   user: User | null;
   onConfirm: () => void;
   onOpenChange: (open: boolean) => void;
};

export function DeleteUserDialog({
   isDeleting,
   isOpen,
   user,
   onConfirm,
   onOpenChange,
}: DeleteUserDialogProps) {
   return (
      <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
         <AlertDialogContent>
            <AlertDialogHeader>
               <AlertDialogTitle>¿Seguro que quieres eliminar este usuario?</AlertDialogTitle>
               <AlertDialogDescription>
                  {user
                     ? `Se eliminará permanentemente a ${user.email}. Esta acción no se puede deshacer.`
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
