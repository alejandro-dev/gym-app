"use client";

import {
   IconCircleCheckFilled,
   IconDotsVertical,
   IconLoader,
} from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "@gym-app/types";

type UseUserColumnsParams = {
   currentUserRole: string;
   onDelete: (user: User) => void;
   onEdit: (user: User) => void;
};

export function useUserColumns({
   currentUserRole,
   onDelete,
   onEdit,
}: UseUserColumnsParams) {
   return [
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
         header: "Nombre",
         cell: ({ row }) => {
            const fullName = [row.original.firstName, row.original.lastName]
               .filter(Boolean)
               .join(" ");

            return fullName || "-";
         },
      },
      ...(currentUserRole === "ADMIN"
         ? [
              {
                 accessorKey: "role",
                 header: "Rol",
                 cell: ({ row }) => (
                    <Badge variant="outline" className="px-1.5 text-muted-foreground">
                       {row.original.role}
                    </Badge>
                 ),
              } satisfies ColumnDef<User>,
              {
                 accessorKey: "verifyed",
                 header: "Verificado",
                 cell: ({ row }) => (
                    <Badge variant="outline" className="px-1.5 text-muted-foreground">
                       {row.original.emailVerifiedAt !== null ? (
                          <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
                       ) : (
                          <IconLoader />
                       )}
                       {row.original.emailVerifiedAt !== null
                          ? "Verificado"
                          : "En proceso"}
                    </Badge>
                 ),
              } satisfies ColumnDef<User>,
              {
                 accessorKey: "createdAt",
                 header: "Creado",
                 cell: ({ row }) =>
                    new Intl.DateTimeFormat("es-ES", {
                       dateStyle: "medium",
                    }).format(new Date(row.original.createdAt)),
              } satisfies ColumnDef<User>,
           ]
         : []),
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
                  <DropdownMenuItem onClick={() => onEdit(row.original)}>
                     Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem>Ver</DropdownMenuItem>
                  {currentUserRole === "ADMIN" && (
                     <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                           variant="destructive"
                           onSelect={() => onDelete(row.original)}
                        >
                           Eliminar
                        </DropdownMenuItem>
                     </>
                  )}
               </DropdownMenuContent>
            </DropdownMenu>
         ),
      },
   ] satisfies ColumnDef<User>[];
}
