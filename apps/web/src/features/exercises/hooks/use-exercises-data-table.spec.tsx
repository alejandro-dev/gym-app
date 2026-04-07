import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { renderHook, act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Exercise } from "@gym-app/types";
import { ErrorCode } from "@/services/errors/ErrorCode";
import { useExercisesDataTable } from "./use-exercises-data-table";

const {
   createExerciseMock,
   updateExerciseMock,
   deleteExerciseMock,
   toastSuccessMock,
   toastErrorMock,
   toastWarningMock,
} = vi.hoisted(() => ({
   createExerciseMock: vi.fn(),
   updateExerciseMock: vi.fn(),
   deleteExerciseMock: vi.fn(),
   toastSuccessMock: vi.fn(),
   toastErrorMock: vi.fn(),
   toastWarningMock: vi.fn(),
}));

vi.mock("@/services/exercisesService", () => ({
   createExercise: createExerciseMock,
   updateExercise: updateExerciseMock,
   deleteExercise: deleteExerciseMock,
}));

vi.mock("sonner", () => ({
   toast: {
      success: toastSuccessMock,
      error: toastErrorMock,
      warning: toastWarningMock,
   },
}));

const sampleExercise: Exercise = {
   id: "exercise_1",
   name: "Press banca",
   slug: "press-banca",
   description: "Empuje horizontal",
   instructions: "Desciende controlado y empuja",
   muscleGroup: "CHEST",
   category: "STRENGTH",
   equipment: "Barra",
   isCompound: true,
   createdAt: "2026-04-07T08:00:00.000Z",
   updatedAt: "2026-04-07T08:00:00.000Z",
};

function renderExercisesHook() {
   const queryClient = new QueryClient({
      defaultOptions: {
         queries: { retry: false },
         mutations: { retry: false },
      },
   });
   const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");
   const columns: ColumnDef<Exercise>[] = [{ accessorKey: "name", header: "Nombre" }];
   const pagination: PaginationState = { pageIndex: 0, pageSize: 10 };
   const setPagination = vi.fn();

   const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
   );

   const hook = renderHook(
      () =>
         useExercisesDataTable({
            columns,
            data: [sampleExercise],
            getRowId: (row) => row.id,
            pagination,
            pageCount: 1,
            onPaginationChange: setPagination,
         }),
      { wrapper },
   );

   return {
      ...hook,
      invalidateQueriesSpy,
   };
}

describe("useExercisesDataTable", () => {
   beforeEach(() => {
      createExerciseMock.mockReset();
      updateExerciseMock.mockReset();
      deleteExerciseMock.mockReset();
      toastSuccessMock.mockReset();
      toastErrorMock.mockReset();
      toastWarningMock.mockReset();
   });

   it("creates an exercise and invalidates the exercises query", async () => {
      createExerciseMock.mockResolvedValue(sampleExercise);
      const { result, invalidateQueriesSpy } = renderExercisesHook();

      act(() => {
         result.current.openCreateDialog();
      });

      act(() => {
         result.current.handleFormValueChange({
            target: { name: "name", value: sampleExercise.name },
         } as React.ChangeEvent<HTMLInputElement>);
         result.current.handleFormValueChange({
            target: { name: "slug", value: sampleExercise.slug },
         } as React.ChangeEvent<HTMLInputElement>);
         result.current.handleFormValueChange({
            target: { name: "description", value: sampleExercise.description ?? "" },
         } as React.ChangeEvent<HTMLInputElement>);
         result.current.handleFormValueChange({
            target: {
               name: "instructions",
               value: sampleExercise.instructions ?? "",
            },
         } as React.ChangeEvent<HTMLInputElement>);
         result.current.handleFormValueChange({
            target: { name: "equipment", value: sampleExercise.equipment ?? "" },
         } as React.ChangeEvent<HTMLInputElement>);
         result.current.handleMuscleGroupChange(sampleExercise.muscleGroup);
         result.current.handleCategoryChange(sampleExercise.category);
         result.current.handleIsCompoundChange(sampleExercise.isCompound);
      });

      await act(async () => {
         result.current.handleCreateExercise({
            preventDefault: vi.fn(),
         } as unknown as React.FormEvent<HTMLFormElement>);
      });

      await waitFor(() => {
         expect(createExerciseMock).toHaveBeenCalledWith({
            name: sampleExercise.name,
            slug: sampleExercise.slug,
            description: sampleExercise.description,
            instructions: sampleExercise.instructions,
            muscleGroup: sampleExercise.muscleGroup,
            category: sampleExercise.category,
            equipment: sampleExercise.equipment,
            isCompound: sampleExercise.isCompound,
         });
      });

      await waitFor(() => {
         expect(invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: ["exercises"],
         });
      });
   });

   it("updates the selected exercise and invalidates the exercises query", async () => {
      updateExerciseMock.mockResolvedValue(sampleExercise);
      const { result, invalidateQueriesSpy } = renderExercisesHook();

      act(() => {
         result.current.openEditDialog(sampleExercise);
      });

      act(() => {
         result.current.handleFormValueChange({
            target: { name: "description", value: "Nueva descripción" },
         } as React.ChangeEvent<HTMLInputElement>);
      });

      await act(async () => {
         result.current.handleCreateExercise({
            preventDefault: vi.fn(),
         } as unknown as React.FormEvent<HTMLFormElement>);
      });

      await waitFor(() => {
         expect(updateExerciseMock).toHaveBeenCalledWith("exercise_1", {
            name: sampleExercise.name,
            slug: sampleExercise.slug,
            description: "Nueva descripción",
            instructions: sampleExercise.instructions,
            muscleGroup: sampleExercise.muscleGroup,
            category: sampleExercise.category,
            equipment: sampleExercise.equipment,
            isCompound: sampleExercise.isCompound,
         });
      });

      await waitFor(() => {
         expect(invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: ["exercises"],
         });
      });
   });

   it("deletes the selected exercise and invalidates the exercises query", async () => {
      deleteExerciseMock.mockResolvedValue(sampleExercise);
      const { result, invalidateQueriesSpy } = renderExercisesHook();

      act(() => {
         result.current.openDeleteDialog(sampleExercise);
      });

      await act(async () => {
         result.current.handleDeleteExercise();
      });

      await waitFor(() => {
         expect(deleteExerciseMock).toHaveBeenCalledWith("exercise_1");
      });

      await waitFor(() => {
         expect(invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: ["exercises"],
         });
      });
   });

   it("shows a validation warning and skips the mutation when the form is invalid", async () => {
      const { result } = renderExercisesHook();

      act(() => {
         result.current.openCreateDialog();
      });

      await act(async () => {
         result.current.handleCreateExercise({
            preventDefault: vi.fn(),
         } as unknown as React.FormEvent<HTMLFormElement>);
      });

      expect(createExerciseMock).not.toHaveBeenCalled();
      expect(toastWarningMock).toHaveBeenCalledTimes(1);
   });

   it("shows exercise-specific API errors", async () => {
      createExerciseMock.mockRejectedValue(
         new ErrorCode("Conflict", 409),
      );
      const { result } = renderExercisesHook();

      act(() => {
         result.current.openCreateDialog();
      });

      act(() => {
         result.current.handleFormValueChange({
            target: { name: "name", value: sampleExercise.name },
         } as React.ChangeEvent<HTMLInputElement>);
         result.current.handleFormValueChange({
            target: { name: "slug", value: sampleExercise.slug },
         } as React.ChangeEvent<HTMLInputElement>);
         result.current.handleFormValueChange({
            target: { name: "description", value: sampleExercise.description ?? "" },
         } as React.ChangeEvent<HTMLInputElement>);
         result.current.handleFormValueChange({
            target: {
               name: "instructions",
               value: sampleExercise.instructions ?? "",
            },
         } as React.ChangeEvent<HTMLInputElement>);
         result.current.handleFormValueChange({
            target: { name: "equipment", value: sampleExercise.equipment ?? "" },
         } as React.ChangeEvent<HTMLInputElement>);
         result.current.handleMuscleGroupChange(sampleExercise.muscleGroup);
         result.current.handleCategoryChange(sampleExercise.category);
         result.current.handleIsCompoundChange(sampleExercise.isCompound);
      });

      await act(async () => {
         result.current.handleCreateExercise({
            preventDefault: vi.fn(),
         } as unknown as React.FormEvent<HTMLFormElement>);
      });

      await waitFor(() => {
         expect(toastErrorMock).toHaveBeenCalledWith(
            "Ya existe un ejercicio con este nombre o slug",
         );
      });
   });
});
