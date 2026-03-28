"use client";

import { IconDotsVertical } from "@tabler/icons-react";
import { type ColumnDef, type PaginationState } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { DataTableContent } from "./data-table-content";
import { useUsersDataTable } from "../hooks/use-users-data-table";
import type { User } from "@gym-app/types";

const columns: ColumnDef<User>[] = [
   {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
         <div className="font-medium text-foreground">{row.original.email}</div>
      ),
      enableHiding: false,
   },
   {
      accessorKey: "username",
      header: "Username",
      cell: ({ row }) => row.original.username ?? "-",
   },
   {
      id: "name",
      header: "Name",
      cell: ({ row }) => {
         const fullName = [row.original.firstName, row.original.lastName]
            .filter(Boolean)
            .join(" ");

         return fullName || "-";
      },
   },
   {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
         <Badge variant="outline" className="px-1.5 text-muted-foreground">
            {row.original.role}
         </Badge>
      ),
   },
   {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) =>
         new Intl.DateTimeFormat("es-ES", {
            dateStyle: "medium",
         }).format(new Date(row.original.createdAt)),
   },
   {
      id: "actions",
      cell: () => (
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button
                  variant="ghost"
                  className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                  size="icon"
               >
                  <IconDotsVertical />
                  <span className="sr-only">Open menu</span>
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
               <DropdownMenuItem>Edit</DropdownMenuItem>
               <DropdownMenuItem>View</DropdownMenuItem>
               <DropdownMenuSeparator />
               <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
         </DropdownMenu>
      ),
   },
];

type DataTableProps = {
   data: User[];
   isLoading: boolean;
   pageIndex: number;
   pageSize: number;
   total: number;
   onPaginationChange: React.Dispatch<React.SetStateAction<PaginationState>>;
};

export function DataTable({
   data,
   isLoading,
   pageIndex,
   pageSize,
   total,
   onPaginationChange,
}: DataTableProps) {
   const pageCount = Math.max(Math.ceil(total / pageSize), 1);

   const table = useUsersDataTable({
      columns,
      data,
      getRowId: (row) => row.id,
      pagination: {
         pageIndex,
         pageSize,
      },
      pageCount,
      onPaginationChange,
   });

   return (
      <DataTableContent
         columnsLength={columns.length}
         isLoading={isLoading}
         table={table}
         total={total}
      />
   );
}
