"use client";

import { useQuery } from "@tanstack/react-query";

import { DataTable } from "../components/data-table";
import { searchUsers } from "@/services/usersService";
import type { UsersListResponse } from "@gym-app/types";
import { useState } from "react";

type UsersViewProps = {
   initialData: UsersListResponse;
   currentUserRole: string;
};

export default function UsersView({ initialData, currentUserRole }: UsersViewProps) {
   const [pagination, setPagination] = useState({
      pageIndex: initialData.page,
      pageSize: initialData.limit,
   });

   const [search, setSearch] = useState("");
   const [filterRole, setFilterRole] = useState("");

   // Creamos la consulta para obtener los usuarios.
   const usersQuery = useQuery({
      queryKey: ["users", pagination.pageIndex, pagination.pageSize, search, filterRole],
      queryFn: () =>
         searchUsers({
            page: pagination.pageIndex,
            limit: pagination.pageSize,
            search,
            role: filterRole
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

   // Evento que se activa cuando cambia el valor del filtro de rol.
   const handleFilterRoleChange = (value: string) => {
      // Actualizamos el valor del filtro de rol.
      setFilterRole(value);

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
      setFilterRole("");
   };

   return (
      <DataTable
         data={usersQuery.data.items}
         isLoading={usersQuery.isFetching}
         pageIndex={pagination.pageIndex}
         pageSize={pagination.pageSize}
         search={search}
         filterRole={filterRole}
         total={usersQuery.data.total}
         currentUserRole={currentUserRole}
         onPaginationChange={setPagination}
         onSearchChange={handleSearchChange}
         onFilterRoleChange={handleFilterRoleChange}
         onClearFilters={handleClearFilters}
      />
   );
}
