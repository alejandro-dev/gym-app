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
import { Textarea } from "@/components/ui/textarea";
import {
   Field,
   FieldDescription,
   FieldGroup,
   FieldLabel,
   FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
   EXERCISE_CATEGORY_VALUES,
   getExerciseCategoryLabelEs,
   getMuscleGroupLabelEs,
   MUSCLE_GROUP_VALUES,
   type ExerciseCategory,
   type MuscleGroup,
} from "@gym-app/types";

// Type para los valores del formulario de creación de ejercicio.
export type ExerciseFormValues = {
   name: string;
   slug: string;
   description: string;
   instructions: string;
   muscleGroup: MuscleGroup;
   category: ExerciseCategory;
   equipment: string;
   isCompound: boolean;
};

// Valores por defecto para el formulario de creación de ejercicio.
export const EMPTY_EXERCISE_FORM_VALUES: ExerciseFormValues = {
   name: "",
   slug: "",
   description: "",
   instructions: "",
   muscleGroup: "CHEST",
   category: "STRENGTH",
   equipment: "",
   isCompound: false,
};

// Dialogo para crear o editar un ejercicio.
type AddUExerciseDialogProps = {
   isOpen: boolean;
   isSaving: boolean;
   mode: "create" | "edit";
   onOpenChange: (open: boolean) => void;
   onCategoryChange: (category: ExerciseCategory) => void;
   onMuscleGroupChange: (muscleGroup: MuscleGroup) => void;
   onIsCompoundChange: (checked: boolean) => void;
   onSubmit: React.FormEventHandler<HTMLFormElement>;
   onValueChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
   ) => void;
   values: ExerciseFormValues;
};

export function AddExerciseDialog({
   isOpen,
   isSaving,
   mode,
   onOpenChange,
   onCategoryChange,
   onMuscleGroupChange,
   onIsCompoundChange,
   onSubmit,
   onValueChange,
   values,
}: AddUExerciseDialogProps) {
   const isEditMode = mode === "edit";

   return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
         <DialogContent className="max-h-[90vh] overflow-hidden p-0 sm:max-w-3xl">
            <form className="flex max-h-[90vh] flex-col" onSubmit={onSubmit}>
               <DialogHeader>
                  <DialogTitle className="px-6 pt-6 text-xl">
                     {isEditMode ? "Editar ejercicio" : "Añadir ejercicio"}
                  </DialogTitle>
                  <DialogDescription className="px-6">
                     {isEditMode
                        ? "Actualizar la información del ejercicio seleccionado."
                        : "Completar la información básica para crear un nuevo ejercicio."}
                  </DialogDescription>
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
                              disabled={isEditMode}
                              placeholder="Ej. Press banca con barra"
                           />
                        </Field>
                        <Field>
                           <Label htmlFor="slug">
                              Slug<span className="text-destructive">*</span>
                           </Label>
                           <Input
                              id="slug"
                              name="slug"
                              value={values.slug}
                              onChange={onValueChange}
                              disabled={isEditMode}
                              placeholder="press-banca-barra"
                           />
                        </Field>
                     </div>

                     <FieldSeparator>Configuración</FieldSeparator>

                     <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <Field>
                           <Label htmlFor="muscleGroup">
                              Grupo muscular<span className="text-destructive">*</span>
                           </Label>
                           <Select
                              value={values.muscleGroup}
                              onValueChange={onMuscleGroupChange}
                           >
                              <SelectTrigger className="w-full">
                                 <SelectValue placeholder="Seleccionar grupo muscular" />
                              </SelectTrigger>
                              <SelectContent>
                                 {MUSCLE_GROUP_VALUES.map((muscleGroup) => (
                                    <SelectItem key={muscleGroup} value={muscleGroup}>
                                       {getMuscleGroupLabelEs(muscleGroup)}
                                    </SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                        </Field>
                        <Field>
                           <Label htmlFor="category">
                              Categoría<span className="text-destructive">*</span>
                           </Label>
                           <Select
                              value={values.category}
                              onValueChange={onCategoryChange}
                           >
                              <SelectTrigger className="w-full">
                                 <SelectValue placeholder="Seleccionar categoría" />
                              </SelectTrigger>
                              <SelectContent>
                                 {EXERCISE_CATEGORY_VALUES.map((category) => (
                                    <SelectItem key={category} value={category}>
                                       {getExerciseCategoryLabelEs(category)}
                                    </SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                        </Field>
                        <Field>
                           <Label htmlFor="equipment">Equipamiento</Label>
                           <Input
                              id="equipment"
                              name="equipment"
                              value={values.equipment}
                              onChange={onValueChange}
                              placeholder="Barra, mancuernas, polea..."
                           />
                        </Field>
                     </div>

                     <Field orientation="horizontal" className="items-start rounded-xl border bg-muted/30 p-4">
                        <Checkbox
                           id="isCompound"
                           name="isCompound"
                           checked={values.isCompound}
                           onCheckedChange={(checked) => onIsCompoundChange(checked === true)}
                        />
                        <FieldLabel htmlFor="isCompound" className="border-0 bg-transparent p-0">
                           Es compuesto
                           <FieldDescription>
                              Márcalo si el ejercicio trabaja varios grupos musculares o articulaciones principales.
                           </FieldDescription>
                        </FieldLabel>
                     </Field>

                     <FieldSeparator>Detalles</FieldSeparator>

                     <div className="grid gap-4 lg:grid-cols-2">
                        <Field>
                           <Label htmlFor="description">Descripción</Label>
                           <Textarea
                              id="description"
                              name="description"
                              value={values.description}
                              onChange={onValueChange}
                              className="min-h-28 resize-y"
                              placeholder="Resumen corto del ejercicio y cuándo usarlo."
                           />
                        </Field>
                        <Field>
                           <Label htmlFor="instructions">Instrucciones</Label>
                           <Textarea
                              id="instructions"
                              name="instructions"
                              value={values.instructions}
                              onChange={onValueChange}
                              className="min-h-28 resize-y"
                              placeholder="Paso a paso, técnica, respiración y puntos clave."
                           />
                        </Field>
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
                        {isSaving ? "Guardando..." : "Guardar ejercicio"}
                     </Button>
                  </div>
                  
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
}
