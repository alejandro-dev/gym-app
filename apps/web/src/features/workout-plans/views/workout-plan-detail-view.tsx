"use client";

import * as React from "react";
import Link from "next/link";
import { IconArrowLeft, IconPlus, IconTrash } from "@tabler/icons-react";
import {
   type Exercise,
   type WorkoutPlanExercise,
   getExerciseCategoryLabelEs,
   getMuscleGroupLabelEs,
} from "@gym-app/types";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
   Select,
   SelectContent,
   SelectGroup,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import {
   createWorkoutPlanExercise,
   deleteWorkoutPlanExercise,
   searchWorkoutPlanExercises,
   updateWorkoutPlanExercise,
   type UpdateWorkoutPlanExercisePayload,
   type WorkoutPlanExercisePayload,
} from "@/services/workoutPlanExercisesService";

import {
   getWorkoutPlanGoalLabel,
   getWorkoutPlanLevelLabel,
   type WorkoutPlanExerciseDraft,
   type WorkoutPlanViewModel,
} from "../components/types";
import { buildFallbackExercises } from "../hooks/use-workout-plans-state";

type WorkoutPlanDetailViewProps = {
   // Catálogo real de la tabla Exercise. La vista lo usa para no escribir nombres a mano.
   availableExercises: Exercise[];
   // Plan recibido desde el server, ya con sus WorkoutPlanExercise si existen.
   initialPlan: WorkoutPlanViewModel;
};

// Mantener una referencia estable evita que useMemo recalcule cuando no hay ejercicios.
const EMPTY_EXERCISES: WorkoutPlanExerciseDraft[] = [];

export default function WorkoutPlanDetailView({
   availableExercises,
   initialPlan,
}: WorkoutPlanDetailViewProps) {
   // La edición se prepara en estado local y se persiste en bloque con "Guardar cambios".
   const [plan, setPlan] = React.useState<WorkoutPlanViewModel>(() => ({
      ...initialPlan,
      // Si el plan no trae ejercicios, dejamos una primera fila editable para empezar rápido.
      exercises: initialPlan.exercises?.length
         ? initialPlan.exercises
         : buildFallbackExercises(initialPlan.id),
   }));
   const [deletedExerciseIds, setDeletedExerciseIds] = React.useState<string[]>([]);
   const [isSaving, setIsSaving] = React.useState(false);

   const exercises = plan.exercises ?? EMPTY_EXERCISES;
   // La UI se organiza por día para evitar una tabla horizontal larga y pesada.
   const exerciseGroups = React.useMemo(
      () => groupExercisesByDay(exercises),
      [exercises],
   );

   // Actualiza un campo específico de un ejercicio identificado por exerciseId.
   const handleExerciseChange = (
      exerciseId: string,
      field: keyof WorkoutPlanExerciseDraft,
      value: string,
   ) => {
      // Los inputs HTML entregan strings. Convertimos solo los campos numéricos
      // al tipo que espera Prisma/DTO, dejando vacío como null.
      const nextExercises = exercises.map((exercise) => {
         if (exercise.id !== exerciseId) return exercise;

         const numericFields: Array<keyof WorkoutPlanExerciseDraft> = [
            "day",
            "order",
            "targetSets",
            "targetRepsMin",
            "targetRepsMax",
            "targetWeightKg",
            "restSeconds",
         ];

         const nextValue = numericFields.includes(field)
            ? field === "order"
               ? Math.max(Number(value || "1"), 1)
               : value === ""
                  ? null
                  : Number(value)
            : value;

         return {
            ...exercise,
            [field]: nextValue,
         };
      });

      setPlan((current) => ({
         ...current,
         exercises: nextExercises,
         exercisesCount: nextExercises.length,
      }));
   };

   // Actualiza el ejercicio seleccionado en el select.
   const handleExerciseSelect = (
      workoutPlanExerciseId: string,
      exerciseId: string,
   ) => {
      // El select trabaja con ids. Buscamos el ejercicio completo para poder
      // mostrar nombre, grupo muscular, categoría y material sin otra llamada.
      const selectedExercise =
         availableExercises.find((exercise) => exercise.id === exerciseId) ?? null;

      const nextExercises = exercises.map((exercise) => {
         if (exercise.id !== workoutPlanExerciseId) return exercise;

         return {
            ...exercise,
            // Si el usuario vuelve a "Seleccionar ejercicio", limpiamos la relación.
            exerciseId: selectedExercise?.id ?? null,
            exercise: selectedExercise
               ? {
                    id: selectedExercise.id,
                    name: selectedExercise.name,
                    slug: selectedExercise.slug,
                    muscleGroup: selectedExercise.muscleGroup,
                    category: selectedExercise.category,
                    equipment: selectedExercise.equipment,
                    isCompound: selectedExercise.isCompound,
                 }
               : null,
         };
      });

      setPlan((current) => ({
         ...current,
         exercises: nextExercises,
         exercisesCount: nextExercises.length,
      }));
   };

   // Añade un ejercicio en el plan y devuelve la versión publica del registro.
   const handleAddExercise = (day = 1) => {
      // El orden se calcula dentro del día actual porque Prisma usa
      // @@unique([workoutPlanId, day, order]).
      const dayExercises = exercises.filter((exercise) => exercise.day === day);
      const nextExercises = [
         ...exercises,
         {
            id: `draft-${crypto.randomUUID()}`,
            workoutPlanId: plan.id,
            isDraft: true,
            day,
            order: dayExercises.length + 1,
            exerciseId: null,
            exercise: null,
            targetSets: null,
            targetRepsMin: null,
            targetRepsMax: null,
            targetWeightKg: null,
            restSeconds: null,
            notes: "",
         },
      ];

      setPlan((current) => ({
         ...current,
         exercises: nextExercises,
         exercisesCount: nextExercises.length,
      }));
   };

   // Elimina un ejercicio del plan y devuelve la versión publica del registro.
   const handleRemoveExercise = (exerciseId: string) => {
      const exerciseToRemove = exercises.find((exercise) => exercise.id === exerciseId);

      if (exerciseToRemove && !exerciseToRemove.isDraft) {
         setDeletedExerciseIds((current) => [...current, exerciseToRemove.id]);
      }

      // Tras borrar, compactamos el orden por día para no dejar huecos visuales.
      const nextExercises = normalizeExerciseOrderByDay(
         exercises.filter((exercise) => exercise.id !== exerciseId),
      );

      setPlan((current) => ({
         ...current,
         exercises: nextExercises,
         exercisesCount: nextExercises.length,
      }));
   };

   const handleSavePlanExercises = async () => {
      const incompleteExercise = exercises.find((exercise) => !exercise.exerciseId);

      if (incompleteExercise) {
         toast.error("Selecciona un ejercicio antes de guardar.");
         return;
      }

      setIsSaving(true);

      try {
         await Promise.all(
            deletedExerciseIds.map((exerciseId) =>
               deleteWorkoutPlanExercise(exerciseId),
            ),
         );

         await Promise.all(
            exercises.map((exercise) => {
               return exercise.isDraft
                  ? createWorkoutPlanExercise(
                       toWorkoutPlanExercisePayload(plan.id, exercise),
                    )
                  : updateWorkoutPlanExercise(
                       exercise.id,
                       toUpdateWorkoutPlanExercisePayload(exercise),
                    );
            }),
         );

         const persistedExercises = await searchWorkoutPlanExercises(plan.id);
         const nextExercises = persistedExercises.map(toWorkoutPlanExerciseDraft);

         setPlan((current) => ({
            ...current,
            exercises: nextExercises,
            exercisesCount: nextExercises.length,
         }));
         setDeletedExerciseIds([]);
         toast.success("Ejercicios del plan guardados");
      } catch (error) {
         toast.error(
            error instanceof Error ? error.message : "No se pudieron guardar los ejercicios.",
         );
      } finally {
         setIsSaving(false);
      }
   };

   return (
      <div className="flex flex-col gap-6 px-4 py-4 lg:px-6 lg:py-6">
         <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex max-w-4xl flex-col gap-3">
               <Button asChild variant="ghost" className="w-fit">
                  <Link href="/workout-plans">
                     <IconArrowLeft data-icon="inline-start" />
                     Volver a planes
                  </Link>
               </Button>
               <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                     <h1 className="text-2xl font-semibold">
                        {plan.name}
                     </h1>
                     <Badge variant={plan.isActive ? "default" : "secondary"}>
                        {plan.isActive ? "Activo" : "Borrador"}
                     </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                     {plan.description ||
                        "Planifica los días de entrenamiento y ajusta la prescripción de cada ejercicio."}
                  </p>
               </div>
            </div>
            <Button
               type="button"
               variant="outline"
               disabled={isSaving}
               onClick={handleSavePlanExercises}
            >
               {isSaving ? "Guardando..." : "Guardar cambios"}
            </Button>
         </div>

         <div className="grid gap-4 lg:grid-cols-4">
            <Card size="sm">
               <CardHeader>
                  <CardTitle>Atleta</CardTitle>
               </CardHeader>
               <CardContent className="flex flex-col gap-1">
                  <div className="font-medium">{getPlanAthleteName(plan)}</div>
                  <div className="text-sm text-muted-foreground">
                     {plan.user?.email || plan.userId || "Sin asignar"}
                  </div>
               </CardContent>
            </Card>
            <Card size="sm">
               <CardHeader>
                  <CardTitle>Objetivo</CardTitle>
               </CardHeader>
               <CardContent>
                  <Badge variant="outline">{getWorkoutPlanGoalLabel(plan.goal)}</Badge>
               </CardContent>
            </Card>
            <Card size="sm">
               <CardHeader>
                  <CardTitle>Nivel</CardTitle>
               </CardHeader>
               <CardContent>
                  <Badge variant="outline">{getWorkoutPlanLevelLabel(plan.level)}</Badge>
               </CardContent>
            </Card>
            <Card size="sm">
               <CardHeader>
                  <CardTitle>Duración</CardTitle>
               </CardHeader>
               <CardContent>
                  {plan.durationWeeks ? `${plan.durationWeeks} semanas` : "-"}
               </CardContent>
            </Card>
         </div>

         <main className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
               <h2 className="text-lg font-semibold">Ejercicios del plan</h2>
               <p className="text-sm text-muted-foreground">
                  Cada día queda separado para que puedas editar sin desplazarte por
                  una tabla horizontal.
               </p>
            </div>

            {exerciseGroups.length > 0 ? (
               exerciseGroups.map((group) => (
                  // Cada section representa un día del plan y contiene sus ejercicios.
                  <section
                     key={group.key}
                     className="flex flex-col gap-4 rounded-lg border bg-background p-4"
                  >
                     <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                           <h3 className="text-base font-medium">{group.label}</h3>
                           <Badge variant="secondary">
                              {group.exercises.length}{" "}
                              {group.exercises.length === 1 ? "ejercicio" : "ejercicios"}
                           </Badge>
                        </div>
                        <Button
                           type="button"
                           variant="outline"
                           size="sm"
                           onClick={() => handleAddExercise(group.day ?? 1)}
                        >
                           <IconPlus data-icon="inline-start" />
                           {group.day
                              ? `Añadir en ${group.label.toLowerCase()}`
                              : "Añadir en día 1"}
                        </Button>
                     </div>

                     <div className="grid gap-4 xl:grid-cols-2">
                        {group.exercises.map((exercise) => (
                           <Card key={exercise.id} size="sm">
                              <CardHeader className="border-b">
                                 <div className="flex items-start justify-between gap-3">
                                    <div className="flex min-w-0 flex-col gap-1">
                                       <CardTitle>
                                          {exercise.exercise?.name || "Selecciona ejercicio"}
                                       </CardTitle>
                                       <p className="text-sm text-muted-foreground">
                                          Orden {exercise.order}
                                       </p>
                                    </div>
                                    <Button
                                       type="button"
                                       size="icon"
                                       variant="ghost"
                                       onClick={() => handleRemoveExercise(exercise.id)}
                                    >
                                       <IconTrash />
                                       <span className="sr-only">Eliminar ejercicio</span>
                                    </Button>
                                 </div>
                              </CardHeader>
                              <CardContent>
                                 <FieldGroup className="gap-4">
                                    <div className="grid gap-3 lg:grid-cols-[minmax(14rem,1fr)_6rem_6rem]">
                                       <Field>
                                          <FieldLabel
                                             htmlFor={`${exercise.id}-exerciseId`}
                                          >
                                             Ejercicio
                                          </FieldLabel>
                                          <Select
                                             value={exercise.exerciseId ?? "none"}
                                             // Selecciona un Exercise existente en lugar de capturar texto libre.
                                             onValueChange={(value) =>
                                                handleExerciseSelect(
                                                   exercise.id,
                                                   value === "none" ? "" : value,
                                                )
                                             }
                                          >
                                             <SelectTrigger
                                                id={`${exercise.id}-exerciseId`}
                                                className="w-full"
                                             >
                                                <SelectValue placeholder="Seleccionar ejercicio" />
                                             </SelectTrigger>
                                             <SelectContent>
                                                <SelectGroup>
                                                   <SelectItem value="none">
                                                      Seleccionar ejercicio
                                                   </SelectItem>
                                                   {availableExercises.map((availableExercise) => (
                                                      <SelectItem
                                                         key={availableExercise.id}
                                                         value={availableExercise.id}
                                                      >
                                                         {availableExercise.name}
                                                      </SelectItem>
                                                   ))}
                                                </SelectGroup>
                                             </SelectContent>
                                          </Select>
                                       </Field>
                                       <Field>
                                          <FieldLabel htmlFor={`${exercise.id}-day`}>
                                             Día
                                          </FieldLabel>
                                          <Input
                                             id={`${exercise.id}-day`}
                                             value={exercise.day ?? ""}
                                             type="number"
                                             min={1}
                                             onChange={(event) =>
                                                handleExerciseChange(
                                                   exercise.id,
                                                   "day",
                                                   event.currentTarget.value,
                                                )
                                             }
                                          />
                                       </Field>
                                       <Field>
                                          <FieldLabel htmlFor={`${exercise.id}-order`}>
                                             Orden
                                          </FieldLabel>
                                          <Input
                                             id={`${exercise.id}-order`}
                                             value={exercise.order}
                                             type="number"
                                             min={1}
                                             onChange={(event) =>
                                                handleExerciseChange(
                                                   exercise.id,
                                                   "order",
                                                   event.currentTarget.value,
                                                )
                                             }
                                          />
                                       </Field>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                       <NumberField
                                          id={`${exercise.id}-targetSets`}
                                          label="Series"
                                          value={exercise.targetSets}
                                          onChange={(value) =>
                                             handleExerciseChange(
                                                exercise.id,
                                                "targetSets",
                                                value,
                                             )
                                          }
                                       />
                                       <NumberField
                                          id={`${exercise.id}-targetRepsMin`}
                                          label="Reps min"
                                          value={exercise.targetRepsMin}
                                          onChange={(value) =>
                                             handleExerciseChange(
                                                exercise.id,
                                                "targetRepsMin",
                                                value,
                                             )
                                          }
                                       />
                                       <NumberField
                                          id={`${exercise.id}-targetRepsMax`}
                                          label="Reps max"
                                          value={exercise.targetRepsMax}
                                          onChange={(value) =>
                                             handleExerciseChange(
                                                exercise.id,
                                                "targetRepsMax",
                                                value,
                                             )
                                          }
                                       />
                                       <NumberField
                                          id={`${exercise.id}-targetWeightKg`}
                                          label="Carga"
                                          value={exercise.targetWeightKg}
                                          step="0.5"
                                          onChange={(value) =>
                                             handleExerciseChange(
                                                exercise.id,
                                                "targetWeightKg",
                                                value,
                                             )
                                          }
                                       />
                                       <NumberField
                                          id={`${exercise.id}-restSeconds`}
                                          label="Descanso"
                                          value={exercise.restSeconds}
                                          onChange={(value) =>
                                             handleExerciseChange(
                                                exercise.id,
                                                "restSeconds",
                                                value,
                                             )
                                          }
                                       />
                                    </div>

                                    <div className="grid gap-3">
                                       {exercise.exercise ? (
                                          // Metadatos que vienen de la relación Exercise, no del item del plan.
                                          <div className="flex flex-wrap items-center gap-2">
                                             <Badge variant="outline">
                                                {getMuscleGroupLabelEs(
                                                   exercise.exercise.muscleGroup,
                                                )}
                                             </Badge>
                                             <Badge variant="outline">
                                                {getExerciseCategoryLabelEs(
                                                   exercise.exercise.category,
                                                )}
                                             </Badge>
                                             {exercise.exercise.equipment ? (
                                                <Badge variant="outline">
                                                   {exercise.exercise.equipment}
                                                </Badge>
                                             ) : null}
                                             {exercise.exercise.isCompound ? (
                                                <Badge variant="secondary">
                                                   Multiarticular
                                                </Badge>
                                             ) : null}
                                          </div>
                                       ) : null}
                                       <Field>
                                          <FieldLabel htmlFor={`${exercise.id}-notes`}>
                                             Notas
                                          </FieldLabel>
                                          <Textarea
                                             id={`${exercise.id}-notes`}
                                             value={exercise.notes ?? ""}
                                             onChange={(event) =>
                                                handleExerciseChange(
                                                   exercise.id,
                                                   "notes",
                                                   event.currentTarget.value,
                                                )
                                             }
                                             className="min-h-20 resize-y"
                                             placeholder="Notas técnicas"
                                          />
                                       </Field>
                                    </div>
                                 </FieldGroup>
                              </CardContent>
                           </Card>
                        ))}
                     </div>
                  </section>
               ))
            ) : (
               <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-center text-muted-foreground">
                  <p>Aún no hay ejercicios en este plan.</p>
                  <Button
                     type="button"
                     variant="outline"
                     onClick={() => handleAddExercise()}
                  >
                     <IconPlus data-icon="inline-start" />
                     Añadir primer ejercicio
                  </Button>
               </div>
            )}
         </main>
      </div>
   );
}

type NumberFieldProps = {
   id: string;
   label: string;
   value: number | null | undefined;
   max?: number;
   step?: string;
   onChange: (value: string) => void;
};

function NumberField({
   id,
   label,
   value,
   max,
   step,
   onChange,
}: NumberFieldProps) {
   // Campo numérico reutilizable para la prescripción del plan.
   // Mantiene los inputs consistentes sin repetir el mismo bloque seis veces.
   return (
      <Field>
         <FieldLabel htmlFor={id}>{label}</FieldLabel>
         <Input
            id={id}
            value={value ?? ""}
            type="number"
            min={0}
            max={max}
            step={step}
            onChange={(event) => onChange(event.currentTarget.value)}
         />
      </Field>
   );
}

function groupExercisesByDay(exercises: WorkoutPlanExerciseDraft[]) {
   // Agrupa por day manteniendo un bucket especial para ejercicios sin día.
   const groups = new Map<
      string,
      {
         key: string;
         day: number | null;
         label: string;
         exercises: WorkoutPlanExerciseDraft[];
      }
   >();

   for (const exercise of exercises) {
      const key = exercise.day ? String(exercise.day) : "no-day";
      const group = groups.get(key) ?? {
         key,
         day: exercise.day,
         label: exercise.day ? `Día ${exercise.day}` : "Sin día",
         exercises: [],
      };

      group.exercises.push(exercise);
      groups.set(key, group);
   }

   return Array.from(groups.values())
      .map((group) => ({
         ...group,
         // Dentro de cada día se respeta el orden definido en WorkoutPlanExercise.order.
         exercises: [...group.exercises].sort((first, second) => {
            return first.order - second.order;
         }),
      }))
      .sort((first, second) => {
         if (first.day === null) return 1;
         if (second.day === null) return -1;
         return first.day - second.day;
      });
}

function normalizeExerciseOrderByDay(exercises: WorkoutPlanExerciseDraft[]) {
   // Reasigna order de forma secuencial por día tras eliminar un item.
   const dayCounters = new Map<string, number>();

   return exercises.map((exercise) => {
      const key = exercise.day ? String(exercise.day) : "no-day";
      const nextOrder = (dayCounters.get(key) ?? 0) + 1;

      dayCounters.set(key, nextOrder);

      return {
         ...exercise,
         order: nextOrder,
      };
   });
}

function toWorkoutPlanExercisePayload(
   workoutPlanId: string,
   exercise: WorkoutPlanExerciseDraft,
): WorkoutPlanExercisePayload {
   if (!exercise.exerciseId) {
      throw new Error("Selecciona un ejercicio antes de guardar.");
   }

   return {
      workoutPlanId,
      exerciseId: exercise.exerciseId,
      day: exercise.day,
      order: exercise.order,
      targetSets: exercise.targetSets,
      targetRepsMin: exercise.targetRepsMin,
      targetRepsMax: exercise.targetRepsMax,
      targetWeightKg: exercise.targetWeightKg,
      restSeconds: exercise.restSeconds,
      notes: exercise.notes,
   };
}

function toUpdateWorkoutPlanExercisePayload(
   exercise: WorkoutPlanExerciseDraft,
): UpdateWorkoutPlanExercisePayload {
   if (!exercise.exerciseId) {
      throw new Error("Selecciona un ejercicio antes de guardar.");
   }

   return {
      exerciseId: exercise.exerciseId,
      day: exercise.day,
      order: exercise.order,
      targetSets: exercise.targetSets,
      targetRepsMin: exercise.targetRepsMin,
      targetRepsMax: exercise.targetRepsMax,
      targetWeightKg: exercise.targetWeightKg,
      restSeconds: exercise.restSeconds,
      notes: exercise.notes,
   };
}

function toWorkoutPlanExerciseDraft(
   exercise: WorkoutPlanExercise,
): WorkoutPlanExerciseDraft {
   return {
      id: exercise.id,
      workoutPlanId: exercise.workoutPlanId,
      day: exercise.day,
      order: exercise.order,
      exerciseId: exercise.exerciseId,
      exercise: exercise.exercise,
      targetSets: exercise.targetSets,
      targetRepsMin: exercise.targetRepsMin,
      targetRepsMax: exercise.targetRepsMax,
      targetWeightKg: exercise.targetWeightKg,
      restSeconds: exercise.restSeconds,
      notes: exercise.notes,
   };
}

function getPlanAthleteName(plan: WorkoutPlanViewModel) {
   // Preferimos los datos derivados de asignación si existen; si no, usamos la relación user.
   const userName = plan.user
      ? `${plan.user.firstName ?? ""} ${plan.user.lastName ?? ""}`.trim()
      : "";

   return (
      userName ||
      "Sin asignar"
   );
}
