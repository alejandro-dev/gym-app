import { describe, expect, it, vi, beforeEach } from "vitest";
import { ErrorCode } from "@/services/errors/ErrorCode";
import {
   buildExercisesSearchPath,
   createExercise,
   deleteExercise,
   searchExercises,
   updateExercise,
} from "./exercisesService";

const { fetchJsonMock } = vi.hoisted(() => ({
   fetchJsonMock: vi.fn(),
}));

vi.mock("./httpClient", () => ({
   fetchJson: fetchJsonMock,
}));

describe("exercisesService", () => {
   beforeEach(() => {
      fetchJsonMock.mockReset();
   });

   it("builds the paginated search path including the search term", () => {
      expect(
         buildExercisesSearchPath({
            page: 2,
            limit: 25,
            search: "press banca",
         }),
      ).toBe("/api/exercises?search=press+banca&page=2&limit=25");
   });

   it("builds the default search path when params are omitted", () => {
      expect(buildExercisesSearchPath()).toBe("/api/exercises?page=0&limit=10");
   });

   it("delegates exercise searches to fetchJson", async () => {
      const response = {
         items: [],
         total: 0,
         page: 1,
         limit: 20,
      };
      fetchJsonMock.mockResolvedValue(response);

      await expect(
         searchExercises({
            page: 1,
            limit: 20,
            search: "remo",
         }),
      ).resolves.toEqual(response);

      expect(fetchJsonMock).toHaveBeenCalledWith(
         "/api/exercises?search=remo&page=1&limit=20",
         {
            method: "GET",
            headers: { "Content-Type": "application/json" },
         },
      );
   });

   it("delegates create, update and delete calls to fetchJson", async () => {
      fetchJsonMock.mockResolvedValueOnce({ id: "exercise_1" });
      fetchJsonMock.mockResolvedValueOnce({ id: "exercise_1" });
      fetchJsonMock.mockResolvedValueOnce({ id: "exercise_1" });

      const payload = {
         name: "Press banca con barra",
         slug: "press-banca-con-barra",
         description: "Ejercicio de empuje horizontal",
         instructions: "Baja controlado y empuja",
         muscleGroup: "CHEST" as const,
         category: "STRENGTH" as const,
         equipment: "Barra",
         isCompound: true,
      };

      await createExercise(payload);
      await updateExercise("exercise_1", payload);
      await deleteExercise("exercise_1");

      expect(fetchJsonMock).toHaveBeenNthCalledWith(1, "/api/exercises", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(payload),
      });
      expect(fetchJsonMock).toHaveBeenNthCalledWith(
         2,
         "/api/exercises/exercise_1",
         {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
         },
      );
      expect(fetchJsonMock).toHaveBeenNthCalledWith(
         3,
         "/api/exercises/exercise_1",
         {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
         },
      );
   });

   it("surfaces API errors unchanged", async () => {
      const error = new ErrorCode("Conflict", 409);
      fetchJsonMock.mockRejectedValue(error);

      await expect(
         createExercise({
            name: "Peso muerto",
            slug: "peso-muerto",
            description: "Bisagra de cadera",
            instructions: "Mantén la espalda neutra",
            muscleGroup: "BACK",
            category: "STRENGTH",
            equipment: "Barra",
            isCompound: true,
         }),
      ).rejects.toBe(error);
   });
});
