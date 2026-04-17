"use client";

import { type PaginationState } from "@tanstack/react-table";

import { DataTableContent } from "./data-table-content";
import { AddUserDialog } from "./form-user";
import { DeleteUserDialog } from "./delete-user";
import { UserDetailDialog } from "./user-detail-dialog";
import type { User } from "@gym-app/types";
import { useDeleteUser } from "../hooks/use-delete-user";
import { useUserColumns } from "../hooks/use-user-columns";
import { useUserForm } from "../hooks/use-user-form";
import { useUsersDataTable } from "../hooks/use-users-data-table";
import { useCallback, useState } from "react";
import { ChangeStatusUserDialog } from "./change-status-user";
import { useChangeStatusUser } from "../hooks/use-change-status-user";

type DataTableProps = {
   data: User[];
   isLoading: boolean;
   pageIndex: number;
   pageSize: number;
   search: string;
   filterRole: string;
   total: number;
   currentUserRole: string;
   onPaginationChange: React.Dispatch<React.SetStateAction<PaginationState>>;
   onSearchChange: (value: string) => void;
   onFilterRoleChange: (value: string) => void;
   onClearFilters: () => void;
};

export function DataTable({
   data,
   isLoading,
   pageIndex,
   pageSize,
   search,
   filterRole,
   total,
   currentUserRole,
   onPaginationChange,
   onSearchChange,
   onFilterRoleChange,
   onClearFilters
}: DataTableProps) {
   const pageCount = Math.max(Math.ceil(total / pageSize), 1);
   const [selectedUser, setSelectedUser] = useState<User | null>(null);
   const [isDetailOpen, setIsDetailOpen] = useState(false);
   const userForm = useUserForm();
   const deleteUser = useDeleteUser();
   const changeStatusUser = useChangeStatusUser();

   const handleViewUser = useCallback((user: User) => {
      setSelectedUser(user);
      setIsDetailOpen(true);
   }, []);

   const handleDetailOpenChange = useCallback((open: boolean) => {
      setIsDetailOpen(open);

      if (!open) {
         setSelectedUser(null);
      }
   }, []);

   const columns = useUserColumns({
      currentUserRole,
      onDelete: deleteUser.openDelete,
      onEdit: userForm.openEdit,
      onView: handleViewUser,
      onChangeStatus: changeStatusUser.openChange,
   });

   const {
      table,
   } = useUsersDataTable({
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
      <>
         <AddUserDialog
            isOpen={userForm.isOpen}
            isSaving={userForm.isSaving}
            mode={userForm.selectedUser ? "edit" : "create"}
            onOpenChange={userForm.handleOpenChange}
            onRoleChange={userForm.handleRoleChange}
            onSubmit={userForm.handleSubmit}
            onValueChange={userForm.handleValueChange}
            values={userForm.values}
         />
         {currentUserRole === "ADMIN" && (
            <DeleteUserDialog
               isDeleting={deleteUser.isDeleting}
               isOpen={deleteUser.isOpen}
               user={deleteUser.selectedUser}
               onConfirm={deleteUser.handleConfirm}
               onOpenChange={deleteUser.handleOpenChange}
            />
         )}
         <ChangeStatusUserDialog
            isConfirming={changeStatusUser.isConfirming}
            isOpen={changeStatusUser.isOpen}
            user={changeStatusUser.selectedUser}
            onConfirm={changeStatusUser.handleConfirm}
            onOpenChange={changeStatusUser.handleOpenChange}
         />
         <UserDetailDialog
            currentUserRole={currentUserRole}
            isOpen={isDetailOpen}
            user={selectedUser}
            onOpenChange={handleDetailOpenChange}
         />
         <DataTableContent
            columnsLength={table.getAllColumns().length}
            isLoading={isLoading}
            onAddUser={userForm.openCreate}
            table={table}
            total={total}
            search={search}
            filterRole={filterRole}
            currentUserRole={currentUserRole}
            onSearchChange={onSearchChange}
            onFilterRoleChange={onFilterRoleChange}
            onClearFilters={onClearFilters}
         />
      </>
   );
}
