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

   const usersQuery = useQuery({
      queryKey: ["users", pagination.pageIndex, pagination.pageSize],
      queryFn: () =>
         searchUsers({
            page: pagination.pageIndex,
            limit: pagination.pageSize,
         }),
      initialData,
      placeholderData: (previousData) => previousData,
   });

   return (
      <DataTable
         data={usersQuery.data.items}
         isLoading={usersQuery.isFetching}
         pageIndex={pagination.pageIndex}
         pageSize={pagination.pageSize}
         total={usersQuery.data.total}
         onPaginationChange={setPagination}
      />
   );
}
