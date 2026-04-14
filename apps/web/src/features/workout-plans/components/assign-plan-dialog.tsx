"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
   Dialog,
   DialogClose,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import type { AthleteOption } from "../hooks/use-athletes-options";

export type AssignPlanFormValues = {
   userId: string;
};

export const EMPTY_ASSIGN_PLAN_FORM_VALUES: AssignPlanFormValues = {
   userId: "",
};

type AssignPlanDialogProps = {
   isOpen: boolean;
   isSaving?: boolean;
   planName?: string;
   values: AssignPlanFormValues;
   athletesOptions: AthleteOption[];
   onOpenChange: (open: boolean) => void;
   onSubmit: React.FormEventHandler<HTMLFormElement>;
   onAthleteChange: (athlete: AthleteOption) => void;
};

export function AssignPlanDialog({
   isOpen,
   isSaving = false,
   planName,
   values,
   athletesOptions,
   onOpenChange,
   onSubmit,
   onAthleteChange,
}: AssignPlanDialogProps) {
   return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
         <DialogContent className="sm:max-w-lg">
            <form className="flex flex-col gap-5" onSubmit={onSubmit}>
               <DialogHeader>
                  <DialogTitle>Asignar plan a atleta</DialogTitle>
                  <DialogDescription>
                     {planName
                        ? `Actualiza el atleta asociado al plan "${planName}".`
                        : "Selecciona el atleta para asociar el plan."}
                  </DialogDescription>
               </DialogHeader>

               <Field>
                  <Label htmlFor="status">Atleta</Label>
                  <Select
                     value={values.userId || undefined}
                     onValueChange={(userId) => {
                        const athlete = athletesOptions.find(
                           (option) => option.id === userId,
                        );

                        if (athlete) {
                           onAthleteChange(athlete);
                        }
                     }}
                  >
                     <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar atleta" />
                     </SelectTrigger>
                     <SelectContent>
                        {athletesOptions.map((athlete) => (
                           <SelectItem
                              key={athlete.id}
                              value={athlete.id}
                           >
                              {athlete.name}
                           </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               </Field>

               <DialogFooter>
                  <DialogClose asChild>
                     <Button type="button" variant="outline" disabled={isSaving}>
                        Cancelar
                     </Button>
                  </DialogClose>
                  <Button type="submit" disabled={isSaving}>
                     {isSaving ? "Guardando..." : "Asignar plan"}
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
}
