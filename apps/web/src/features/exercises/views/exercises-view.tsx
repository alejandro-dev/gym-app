"use client";

import { searchExercises } from "@/app/(protected)/(admin)/exercises/actions";
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
   const [filterGroupMuscle, setFilterGroupMuscle] = useState("");
   const [filterCategory, setFilterCategory] = useState("");

   // Creamos la consulta para obtener los ejercicios.
   const exercisesQuery = useQuery({
      queryKey: ["exercises", pagination.pageIndex, pagination.pageSize, search, filterGroupMuscle, filterCategory],
      queryFn: () =>
         searchExercises({
            page: pagination.pageIndex,
            limit: pagination.pageSize,
            search,
            muscleGroup: filterGroupMuscle,
            category: filterCategory,
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

   // Evento que se activa cuando cambia el valor de un filtro de grupo muscular.
   const handleFilterGroupMuscleChange = (value: string) => {
      // Actualizamos el valor de la búsqueda.
      setFilterGroupMuscle(value);

      // Reiniciamos la paginación al inicio.
      setPagination((current) => ({
         ...current,
         pageIndex: 0,
      }));
   };

   // Evento que se activa cuando cambia el valor de un filtro de categoría.
   const handleFilterCategoryChange = (value: string) => {
      // Actualizamos el valor de la búsqueda.
      setFilterCategory(value);
      
      // Reiniciamos la paginación al inicio.
      setPagination((current) => ({
         ...current,
         pageIndex: 0,
      }));
   };

   // Evento que se activa cuando se limpian los filtros.
   const handleClearFilters = () => {
      // Reiniciamos los filtros.
      setSearch("");
      setFilterGroupMuscle("");
      setFilterCategory("");
   };

   return (
         <DataTable
         data={exercisesQuery.data.items}
         isLoading={exercisesQuery.isFetching}
         pageIndex={pagination.pageIndex}
         pageSize={pagination.pageSize}
         search={search}
         filterGroupMuscle={filterGroupMuscle}
         filterCategory={filterCategory}
         total={exercisesQuery.data.total}
         onPaginationChange={setPagination}
         onSearchChange={handleSearchChange}
         onFilterGroupMuscleChange={handleFilterGroupMuscleChange}
         onFilterCategoryChange={handleFilterCategoryChange}
         onClearFilters={handleClearFilters}
      />
   );
}
