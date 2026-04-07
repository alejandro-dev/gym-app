"use client";

import { useQuery } from "@tanstack/react-query";
import * as React from "react";

import { DataTable } from "../components/data-table";
import { searchUsers } from "@/services/usersService";
import type { UsersListResponse } from "@gym-app/types";

type UsersViewProps = {
   initialData: UsersListResponse;
};

export default function UsersView({ initialData }: UsersViewProps) {
   const [pagination, setPagination] = React.useState({
      pageIndex: initialData.page,
      pageSize: initialData.limit,
   });

   const [search, setSearch] = React.useState("");

   // Creamos la consulta para obtener los usuarios.
   const usersQuery = useQuery({
      queryKey: ["users", pagination.pageIndex, pagination.pageSize, search],
      queryFn: () =>
         searchUsers({
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
         data={usersQuery.data.items}
         isLoading={usersQuery.isFetching}
         pageIndex={pagination.pageIndex}
         pageSize={pagination.pageSize}
         search={search}
         total={usersQuery.data.total}
         onPaginationChange={setPagination}
         onSearchChange={handleSearchChange}
      />
   );
}
