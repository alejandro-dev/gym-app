"use client";

import * as React from "react";
import { IconCircleCheckFilled, IconDotsVertical, IconLoader } from "@tabler/icons-react";
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
import { AddUserDialog } from "./form-user";
import { DeleteUserDialog } from "./delete-user";

type DataTableProps = {
   data: User[];
   isLoading: boolean;
   pageIndex: number;
   pageSize: number;
   search: string;
   total: number;
   onPaginationChange: React.Dispatch<React.SetStateAction<PaginationState>>;
   onSearchChange: (value: string) => void;
};

export function DataTable({
   data,
   isLoading,
   pageIndex,
   pageSize,
   search,
   total,
   onPaginationChange,
   onSearchChange,
}: DataTableProps) {
   const pageCount = Math.max(Math.ceil(total / pageSize), 1);

   const {
      formValues,
      isDialogOpen,
      isDeleteDialogOpen,
      isDeleting,
      isSaving,
      selectedUser,
      table,
      handleCreateUser,
      handleDialogOpenChange,
      handleDeleteDialogOpenChange,
      handleDeleteUser,
      handleFormValueChange,
      handleRoleChange,
      openCreateDialog,
      openEditDialog,
      openDeleteDialog,
   } = useUsersDataTable({
      columns: [
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
            accessorKey: "verifyed",
            header: "Verified",
            cell: ({ row }) => (
               <Badge variant="outline" className="px-1.5 text-muted-foreground">
                  {row.original.emailVerifiedAt !== null ? (
                     <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
                  ) : (
                     <IconLoader />
                  )}
                  {row.original.emailVerifiedAt !== null ? "Verificado": "En proceso"}
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
            cell: ({ row }) => (
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
                     <DropdownMenuItem onClick={() => openEditDialog(row.original)}>
                        Edit
                     </DropdownMenuItem>
                     <DropdownMenuItem>View</DropdownMenuItem>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => openDeleteDialog(row.original)}
                     >
                        Delete
                     </DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
            ),
         },
      ] satisfies ColumnDef<User>[],
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
      <>
         <AddUserDialog
            isOpen={isDialogOpen}
            isSaving={isSaving}
            mode={selectedUser ? "edit" : "create"}
            onOpenChange={handleDialogOpenChange}
            onRoleChange={handleRoleChange}
            onSubmit={handleCreateUser}
            onValueChange={handleFormValueChange}
            values={formValues}
         />
         <DeleteUserDialog
            isDeleting={isDeleting}
            isOpen={isDeleteDialogOpen}
            user={selectedUser}
            onConfirm={handleDeleteUser}
            onOpenChange={handleDeleteDialogOpenChange}
         />
         <DataTableContent
            columnsLength={table.getAllColumns().length}
            isLoading={isLoading}
            onAddUser={openCreateDialog}
            table={table}
            total={total}
            search={search}
            onSearchChange={onSearchChange}
         />
      </>
   );
}
