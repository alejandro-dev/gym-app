"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getStatusErrorMessage, type StatusMessageMap } from "@/features/auth/lib/auth-errors";
import {
   createExercise,
   type CreateExercisePayload,
   updateExercise,
   type UpdateExercisePayload,
   uploadExerciseImage,
} from "@/services/exercisesService";
import type { Exercise } from "@gym-app/types";
import {
   EMPTY_EXERCISE_FORM_VALUES,
   type ExerciseFormValues,
} from "../components/form-exercise";
import { exerciseSchema } from "../schemas/exercise.schema";
import { useState } from "react";

type SaveExerciseMutationInput =
   | {
        mode: "create";
        payload: CreateExercisePayload;
        imageFile: File | null;
     }
   | {
        mode: "edit";
        exerciseId: string;
        payload: UpdateExercisePayload;
        imageFile: File | null;
     };

type SaveExerciseMutationResult = {
   imageUploadFailed: boolean;
};

const EXERCISE_ERROR_MESSAGES: StatusMessageMap = {
   400: "Revise los datos del ejercicio y vuelva a intentarlo",
   401: "No tienes permiso para realizar esta acción",
   403: "No tienes permiso para administrar ejercicios",
   409: "Ya existe un ejercicio con este nombre o slug",
};

export function useExerciseForm() {
   const queryClient = useQueryClient();
   const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
   const [isOpen, setIsOpen] = useState(false);
   const [values, setValues] = useState<ExerciseFormValues>(
      EMPTY_EXERCISE_FORM_VALUES,
   );
   const [imageFile, setImageFile] = useState<File | null>(null);
   const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

   // Limpiamos el formulario
   const reset = () => {
      setSelectedExercise(null);
      setValues(EMPTY_EXERCISE_FORM_VALUES);
      setImageFile(null);
      setImagePreviewUrl(null);
   };

   // Guardamos los cambios en el formulario
   const saveMutation = useMutation<
      SaveExerciseMutationResult,
      Error,
      SaveExerciseMutationInput
   >({
      mutationFn: async (input) => {
         // Elegimos si crear o editar un ejercicio
         const savedExercise = input.mode === "create"
            ? await createExercise(input.payload)
            : await updateExercise(input.exerciseId, input.payload);

         // Si no hay imagen, no subimos nada
         if (!input.imageFile) {
            return { imageUploadFailed: false };
         }

         try {
            // Subimos la imagen
            await uploadExerciseImage(savedExercise.id, input.imageFile);
            return { imageUploadFailed: false };
         } catch {
            return { imageUploadFailed: true };
         }
      },
      onSuccess: async (result, input) => {
         if (result.imageUploadFailed) {
            toast.warning("Ejercicio guardado, pero no se pudo subir la imagen");
         } else {
            toast.success(
               input.mode === "create"
                  ? "Ejercicio creado correctamente"
                  : "Ejercicio actualizado correctamente",
            );
         }

         setIsOpen(false);
         reset();
         await queryClient.invalidateQueries({ queryKey: ["exercises"] });
      },
      onError: (error) => {
         toast.error(getStatusErrorMessage(error, EXERCISE_ERROR_MESSAGES));
      },
   });

   // Abrimos el formulario para crear un nuevo ejercicio
   const openCreate = () => {
      reset();
      setIsOpen(true);
   };

   // Abrimos el formulario para editar un ejercicio existente
   const openEdit = (exercise: Exercise) => {
      setSelectedExercise(exercise);
      setValues({
         name: exercise.name,
         slug: exercise.slug,
         description: exercise.description ?? "",
         instructions: exercise.instructions ?? "",
         muscleGroup: exercise.muscleGroup,
         category: exercise.category,
         equipment: exercise.equipment ?? "",
         isCompound: exercise.isCompound,
         videoUrl: exercise.videoUrl ?? ""
      });
      setImageFile(null);
      setImagePreviewUrl(exercise.imageUrl);
      setIsOpen(true);
   };

   // Cambiamos el estado del formulario
   const handleOpenChange = (open: boolean) => {
      setIsOpen(open);
      if (!open) reset();
   };

   // Actualizamos los valores del formulario
   const handleValueChange = (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
   ) => {
      const { name, value } = event.target;
      setValues((current) => ({
         ...current,
         [name]: value,
      }));
   };

   // Actualizamos el grupo muscular del ejercicio
   const handleMuscleGroupChange = (
      muscleGroup: ExerciseFormValues["muscleGroup"],
   ) => {
      setValues((current) => ({
         ...current,
         muscleGroup,
      }));
   };

   // Actualizamos la categoría del ejercicio
   const handleCategoryChange = (category: ExerciseFormValues["category"]) => {
      setValues((current) => ({
         ...current,
         category,
      }));
   };

   // Actualizamos el estado de la composición del ejercicio
   const handleIsCompoundChange = (isCompound: boolean) => {
      setValues((current) => ({
         ...current,
         isCompound,
      }));
   };

   // Evento de envío del formulario
   const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
      event.preventDefault();

      // Validamos el formulario
      const result = exerciseSchema.safeParse({
         name: values.name.trim(),
         slug: values.slug.trim(),
         description: values.description.trim(),
         instructions: values.instructions.trim(),
         muscleGroup: values.muscleGroup,
         category: values.category,
         equipment: values.equipment.trim(),
         isCompound: values.isCompound,
         videoUrl: values.videoUrl?.trim()
      });

      // Si el formulario no es válido, mostramos un mensaje de error
      if (!result.success) {
         toast.warning(result.error.issues[0]?.message ?? "Formulario inválido");
         return;
      }

      // Si hay un ejercicio seleccionado, actualizamos el ejercicio
      if (selectedExercise) {
         saveMutation.mutate({
            mode: "edit",
            exerciseId: selectedExercise.id,
            imageFile,
            payload: {
               name: result.data.name,
               slug: result.data.slug,
               description: result.data.description,
               instructions: result.data.instructions,
               muscleGroup: result.data.muscleGroup,
               category: result.data.category,
               equipment: result.data.equipment,
               isCompound: result.data.isCompound,
               videoUrl: result.data.videoUrl
            },
         });

         return;
      }

      // Si no hay ejercicio seleccionado, creamos un nuevo ejercicio
      saveMutation.mutate({
         mode: "create",
         imageFile,
         payload: {
            name: result.data.name,
            slug: result.data.slug,
            description: result.data.description,
            instructions: result.data.instructions,
            muscleGroup: result.data.muscleGroup,
            category: result.data.category,
            equipment: result.data.equipment,
            isCompound: result.data.isCompound,
            videoUrl: result.data.videoUrl
         },
      });
   };

   // Evento de cambio de archivo de imagen
   const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      // Obtenemos el archivo seleccionado
      const file = event.target.files?.[0] ?? null;

      // Añadimos el archivo a la lista de subidas
      setImageFile(file);

      // Si no hay archivo, mostramos la imagen del ejercicio seleccionado o limpiamos la vista previa
      if (!file) {
         setImagePreviewUrl(selectedExercise?.imageUrl ?? null);
         return;
      }

      // Creamos una vista previa de la imagen
      const previewUrl = URL.createObjectURL(file);
      setImagePreviewUrl(previewUrl);
   };


   return {
      isOpen,
      isSaving: saveMutation.isPending,
      selectedExercise,
      values,
      imagePreviewUrl,
      handleCategoryChange,
      handleIsCompoundChange,
      handleMuscleGroupChange,
      handleOpenChange,
      handleSubmit,
      handleValueChange,
      handleImageChange,
      openCreate,
      openEdit,
   };
}

