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

type ChangeStatusUserDialogProps = {
   isConfirming: boolean;
   isOpen: boolean;
   user: User | null;
   onConfirm: () => void;
   onOpenChange: (open: boolean) => void;
};

export function ChangeStatusUserDialog({
   isConfirming,
   isOpen,
   user,
   onConfirm,
   onOpenChange,
}: ChangeStatusUserDialogProps) {
   const isDeactivating = user?.isActive ?? false;
   const actionLabel = isDeactivating ? "Desactivar acceso" : "Activar acceso";
   const pendingLabel = isDeactivating ? "Desactivando..." : "Activando...";

   return (
      <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
         <AlertDialogContent>
            <AlertDialogHeader>
               <AlertDialogTitle>
                  ¿Seguro que quieres{" "}
                  {isDeactivating ? "desactivar" : "activar"} el acceso a este
                  usuario?
               </AlertDialogTitle>
               <AlertDialogDescription>
                  {user
                     ? isDeactivating
                        ? `Se bloqueará el acceso de ${user.email} sin eliminar sus datos.`
                        : `${user.email} podrá volver a acceder a la app.`
                     : "Confirma el cambio de estado del usuario."}
               </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
               <AlertDialogCancel disabled={isConfirming}>Cancelar</AlertDialogCancel>
               <AlertDialogAction
                  variant={isDeactivating ? "destructive" : "default"}
                  disabled={isConfirming}
                  onClick={(event) => {
                     event.preventDefault();
                     onConfirm();
                  }}
               >
                  {isConfirming ? pendingLabel : actionLabel}
               </AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
   );
}
