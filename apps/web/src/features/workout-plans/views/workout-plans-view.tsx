"use client"

import { searchWorkoutPlans } from "@/services/workoutPlanService";
import type { WorkoutPlansListResponse } from "@gym-app/types";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DataTable } from "../components/data-table";

type WorkoutPlansViewProps = {
   initialData: WorkoutPlansListResponse;
};

export default function WorkoutPlansView({ initialData }: WorkoutPlansViewProps) {
   const [pagination, setPagination] = useState({
      pageIndex: initialData.page,
      pageSize: initialData.limit,
   });

   const [search, setSearch] = useState("");

   // Creamos la consulta para obtener los planes de entrenamiento.
   const workoutPlansQuery = useQuery({
      queryKey: ["workout-plans", pagination.pageIndex, pagination.pageSize, search],
      queryFn: () =>
         searchWorkoutPlans({
            page: pagination.pageIndex,
            limit: pagination.pageSize,
            search,
         }),
      initialData,
      placeholderData: (previousData) => previousData,
   });

   // Evento que se activa cuando cambia el valor de la búsqueda.
   const handleSearchChange = (value: string) => {
      // Actualizamos el valor de la búsqueda.
      setSearch(value);

      // Reiniciamos la paginación al inicio.
      setPagination((current) => ({
         ...current,
         pageIndex: 0,
      }));
   };

   // Evento que se activa cuando se hace clic en el botón de limpiar filtros.
   const handleClearFilters = () => {
      // Reiniciamos la paginación al inicio.
      setPagination((current) => ({
         ...current,
         pageIndex: 0,
      }));

      // Limpiamos los filtros.
      setSearch("");
   };

   return (
      <DataTable
         data={workoutPlansQuery.data.items}
         isLoading={workoutPlansQuery.isFetching}
         pageIndex={pagination.pageIndex}
         pageSize={pagination.pageSize}
         search={search}
         total={workoutPlansQuery.data.total}
         onPaginationChange={setPagination}
         onSearchChange={handleSearchChange}
         onClearFilters={handleClearFilters}
      />
   );
}
