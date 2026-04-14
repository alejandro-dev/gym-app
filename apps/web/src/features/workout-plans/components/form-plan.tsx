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
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import {
   getWorkoutPlanGoalLabel,
   getWorkoutPlanLevelLabel,
   WORKOUT_PLAN_GOALS,
   WORKOUT_PLAN_LEVELS,
   type WorkoutPlanGoal,
   type WorkoutPlanLevel,
} from "./types";

export type WorkoutPlanFormValues = {
   name: string;
   description: string;
   userId: string;
   goal: WorkoutPlanGoal | "";
   level: WorkoutPlanLevel | "";
   durationWeeks: string;
   isActive: "true" | "false";
};

export const EMPTY_WORKOUT_PLAN_FORM_VALUES: WorkoutPlanFormValues = {
   name: "",
   description: "",
   userId: "",
   goal: "",
   level: "",
   durationWeeks: "",
   isActive: "true",
};

type WorkoutPlanFormDialogProps = {
   isOpen: boolean;
   isSaving?: boolean;
   mode: "create" | "edit" | "duplicate";
   onOpenChange: (open: boolean) => void;
   onSubmit: React.FormEventHandler<HTMLFormElement>;
   onValueChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
   ) => void;
   onGoalChange: (value: WorkoutPlanGoal | "") => void;
   onLevelChange: (value: WorkoutPlanLevel | "") => void;
   onStatusChange: (value: "true" | "false") => void;
   values: WorkoutPlanFormValues;
};

export function WorkoutPlanFormDialog({
   isOpen,
   isSaving = false,
   mode,
   onOpenChange,
   onSubmit,
   onValueChange,
   onGoalChange,
   onLevelChange,
   onStatusChange,
   values,
}: WorkoutPlanFormDialogProps) {
   const copy = {
      create: {
         title: "Crear plan",
         description:
            "Completa los datos base del plan para dejarlo listo y luego editar sus ejercicios.",
         submitLabel: "Crear plan",
      },
      edit: {
         title: "Editar plan",
         description: "Actualiza la configuración principal del plan.",
         submitLabel: "Guardar cambios",
      },
      duplicate: {
         title: "Duplicar plan",
         description:
            "Crea una copia reutilizable del plan y asígnala al atleta que quieras.",
         submitLabel: "Crear copia",
      },
   }[mode];

   return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
         <DialogContent className="max-h-[90vh] overflow-hidden p-0 sm:max-w-2xl">
            <form className="flex max-h-[90vh] flex-col" onSubmit={onSubmit}>
               <DialogHeader className="px-6 pt-6">
                  <DialogTitle>{copy.title}</DialogTitle>
                  <DialogDescription>{copy.description}</DialogDescription>
               </DialogHeader>

               <div className="flex-1 overflow-y-auto px-6 py-5">
                  <FieldGroup className="gap-6">
                     <div className="grid gap-4 md:grid-cols-2">
                        <Field>
                           <Label htmlFor="name">
                              Nombre<span className="text-destructive">*</span>
                           </Label>
                           <Input
                              id="name"
                              name="name"
                              value={values.name}
                              onChange={onValueChange}
                              placeholder="Ej. Push Pull Legs 12 semanas"
                           />
                        </Field>
                        <Field>
                           <Label htmlFor="durationWeeks">Duración</Label>
                           <Input
                              id="durationWeeks"
                              name="durationWeeks"
                              type="number"
                              min={1}
                              value={values.durationWeeks}
                              onChange={onValueChange}
                              placeholder="8"
                           />
                        </Field>
                     </div>

                     <Field>
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                           id="description"
                           name="description"
                           value={values.description}
                           onChange={onValueChange}
                           className="min-h-24 resize-y"
                           placeholder="Objetivo del bloque, contexto y notas globales."
                        />
                     </Field>

                     <div className="grid gap-4 md:grid-cols-3">
                        <Field>
                           <Label htmlFor="goal">Objetivo</Label>
                           <Select
                              value={values.goal || "none"}
                              onValueChange={(value) =>
                                 onGoalChange(
                                    value === "none" ? "" : (value as WorkoutPlanGoal),
                                 )
                              }
                           >
                              <SelectTrigger className="w-full">
                                 <SelectValue placeholder="Seleccionar objetivo" />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="none">Sin objetivo</SelectItem>
                                 {WORKOUT_PLAN_GOALS.map((goal) => (
                                    <SelectItem key={goal} value={goal}>
                                       {getWorkoutPlanGoalLabel(goal)}
                                    </SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                        </Field>
                        <Field>
                           <Label htmlFor="level">Nivel</Label>
                           <Select
                              value={values.level || "none"}
                              onValueChange={(value) =>
                                 onLevelChange(
                                    value === "none" ? "" : (value as WorkoutPlanLevel),
                                 )
                              }
                           >
                              <SelectTrigger className="w-full">
                                 <SelectValue placeholder="Seleccionar nivel" />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="none">Sin nivel</SelectItem>
                                 {WORKOUT_PLAN_LEVELS.map((level) => (
                                    <SelectItem key={level} value={level}>
                                       {getWorkoutPlanLevelLabel(level)}
                                    </SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                        </Field>
                        <Field>
                           <Label htmlFor="status">Estado</Label>
                           <Select value={values.isActive} onValueChange={onStatusChange}>
                              <SelectTrigger className="w-full">
                                 <SelectValue placeholder="Seleccionar estado" />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="true">Activo</SelectItem>
                                 <SelectItem value="false">Borrador</SelectItem>
                              </SelectContent>
                           </Select>
                        </Field>
                     </div>

                     <div className="grid gap-4 md:grid-cols-3">
                        
                     </div>
                  </FieldGroup>
               </div>

               <DialogFooter className="border-t px-6 py-5">
                  <div className="pb-3">
                     <DialogClose asChild className="mr-3">
                        <Button type="button" variant="outline" disabled={isSaving}>
                           Cancelar
                        </Button>
                     </DialogClose>
                     <Button type="submit" disabled={isSaving}>
                        {isSaving ? "Guardando..." : copy.submitLabel}
                     </Button>
                  </div>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
}
