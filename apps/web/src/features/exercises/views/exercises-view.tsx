"use client";

import { searchExercises } from "@/app/(protected)/exercises/actions";
import { ExercisesListResponse } from "@gym-app/types";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DataTable } from "../components/data-table";

type ExercisesViewProps = {
   initialData: ExercisesListResponse;
};

export default function ExercisesView({ initialData }: ExercisesViewProps) {
   const [pagination, setPagination] = useState({
      pageIndex: initialData.page,
      pageSize: initialData.limit,
   });

   const [search, setSearch] = useState("");

   // Creamos la consulta para obtener los ejercicios.
   const exercisesQuery = useQuery({
      queryKey: ["exercises", pagination.pageIndex, pagination.pageSize, search],
      queryFn: () =>
         searchExercises({
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

   return (
         <DataTable
         data={exercisesQuery.data.items}
         isLoading={exercisesQuery.isFetching}
         pageIndex={pagination.pageIndex}
         pageSize={pagination.pageSize}
         search={search}
         total={exercisesQuery.data.total}
         onPaginationChange={setPagination}
         onSearchChange={handleSearchChange}
      />
   );
}
