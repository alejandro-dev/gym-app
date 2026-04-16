"use client";

import * as React from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
   Dialog,
   DialogClose,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { User } from "@gym-app/types";

type UserDetailDialogProps = {
   currentUserRole: string;
   isOpen: boolean;
   onOpenChange: (open: boolean) => void;
   user: User | null;
};

type DetailItem = {
   label: string;
   value: React.ReactNode;
};

function formatDate(value: string | null) {
   if (!value) return "-";

   return new Intl.DateTimeFormat("es-ES", {
      dateStyle: "medium",
   }).format(new Date(value));
}

function formatDateTime(value: string | null) {
   if (!value) return "-";

   return new Intl.DateTimeFormat("es-ES", {
      dateStyle: "medium",
      timeStyle: "short",
   }).format(new Date(value));
}

function getFullName(user: User) {
   return [user.firstName, user.lastName].filter(Boolean).join(" ") || "Sin nombre";
}

function getInitials(user: User) {
   const name = getFullName(user);

   if (name !== "Sin nombre") {
      return name
         .split(" ")
         .slice(0, 2)
         .map((part) => part[0])
         .join("")
         .toUpperCase();
   }

   return user.email.slice(0, 2).toUpperCase();
}

function getAge(birthDate: string | null) {
   if (!birthDate) return "-";

   const birth = new Date(birthDate);
   const today = new Date();
   let age = today.getFullYear() - birth.getFullYear();
   const monthDelta = today.getMonth() - birth.getMonth();

   if (
      monthDelta < 0 ||
      (monthDelta === 0 && today.getDate() < birth.getDate())
   ) {
      age -= 1;
   }

   return `${age} años`;
}

function formatMeasurement(value: number | null, unit: string) {
   if (value === null) return "-";

   return `${value} ${unit}`;
}

function DetailGrid({ items }: { items: DetailItem[] }) {
   return (
      <dl className="grid gap-3 sm:grid-cols-2">
         {items.map((item) => (
            <div key={item.label} className="flex flex-col gap-1">
               <dt className="text-xs font-medium uppercase text-muted-foreground">
                  {item.label}
               </dt>
               <dd className="text-sm font-medium text-foreground">{item.value}</dd>
            </div>
         ))}
      </dl>
   );
}

export function UserDetailDialog({
   currentUserRole,
   isOpen,
   onOpenChange,
   user,
}: UserDetailDialogProps) {
   if (!user) return null;

   const fullName = getFullName(user);
   const isAdminView = currentUserRole === "ADMIN";

   const adminIdentityItems: DetailItem[] = [
      { label: "id", value: user.id },
      { label: "Email", value: user.email },
      { label: "Username", value: user.username ?? "-" },
      { label: "Rol", value: <Badge variant="outline">{user.role}</Badge> },
      { label: "Nombre", value: user.firstName ?? "-" },
      { label: "Apellidos", value: user.lastName ?? "-" },
      { label: "Coach asignado", value: user.coachId ?? "Sin coach" },
   ];

   const adminProfileItems: DetailItem[] = [
      { label: "Peso", value: formatMeasurement(user.weightKg, "kg") },
      { label: "Altura", value: formatMeasurement(user.heightCm, "cm") },
      { label: "Fecha de nacimiento", value: formatDate(user.birthDate) },
      { label: "Edad calculada", value: getAge(user.birthDate) },
   ];

   const adminStatusItems: DetailItem[] = [
      {
         label: "Email verificado",
         value: user.emailVerifiedAt ? "Sí" : "Pendiente",
      },
      {
         label: "Fecha de verificación",
         value: formatDateTime(user.emailVerifiedAt),
      },
      { label: "Fecha de creación", value: formatDateTime(user.createdAt) },
      { label: "Ultima actualización", value: formatDateTime(user.updatedAt) },
   ];

   const coachIdentityItems: DetailItem[] = [
      { label: "Email", value: user.email },
      { label: "Username", value: user.username ?? "-" },
      { label: "Nombre", value: user.firstName ?? "-" },
      { label: "Apellidos", value: user.lastName ?? "-" },
      { label: "Rol", value: <Badge variant="outline">{user.role}</Badge> },
      { label: "Coach asignado", value: user.coachId ?? "Sin coach" },
   ];

   const coachProfileItems: DetailItem[] = [
      { label: "Peso", value: formatMeasurement(user.weightKg, "kg") },
      { label: "Altura", value: formatMeasurement(user.heightCm, "cm") },
      { label: "Fecha de nacimiento", value: formatDate(user.birthDate) },
      { label: "Edad calculada", value: getAge(user.birthDate) },
   ];

   const coachAccountItems: DetailItem[] = [
      {
         label: "Email verificado",
         value: user.emailVerifiedAt ? "Sí" : "No",
      },
      { label: "Fecha de alta", value: formatDate(user.createdAt) },
      { label: "Última actualización", value: formatDate(user.updatedAt) },
   ];

   return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
         <DialogContent className="max-h-[90vh] overflow-hidden p-0 sm:max-w-2xl">
            <div className="flex max-h-[90vh] flex-col">
               <DialogHeader className="shrink-0 px-6 pt-6">
                  <DialogTitle>
                     {isAdminView ? "Detalle del usuario" : "Ficha del atleta"}
                  </DialogTitle>
               </DialogHeader>

               <div className="flex-1 overflow-y-auto px-6 py-5">
                  <div className="flex items-start gap-4">
                     <Avatar className="size-12">
                        <AvatarFallback>{getInitials(user)}</AvatarFallback>
                     </Avatar>
                     <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <div>
                           <h3 className="truncate text-base font-semibold">
                              {fullName}
                           </h3>
                           <p className="truncate text-sm text-muted-foreground">
                              {user.email}
                           </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           <Badge variant="secondary">
                              {isAdminView ? user.role : "Atleta activo"}
                           </Badge>
                           <Badge variant="outline">
                              {user.emailVerifiedAt ? "Verificado" : "Pendiente"}
                           </Badge>
                        </div>
                     </div>
                  </div>

                  <Separator className="my-5" />

                  <div className="flex flex-col gap-6">
                     <section className="flex flex-col gap-3">
                        <h4 className="text-sm font-semibold">
                           {isAdminView ? "Identidad y permisos" : "Identidad"}
                        </h4>
                        <DetailGrid
                           items={isAdminView ? adminIdentityItems : coachIdentityItems}
                        />
                     </section>

                     <section className="flex flex-col gap-3">
                        <h4 className="text-sm font-semibold">
                           Perfil físico
                        </h4>
                        <DetailGrid
                           items={isAdminView ? adminProfileItems : coachProfileItems}
                        />
                     </section>

                     {isAdminView ? (
                        <section className="flex flex-col gap-3">
                           <h4 className="text-sm font-semibold">
                              Estado y auditoría
                           </h4>
                           <DetailGrid items={adminStatusItems} />
                        </section>
                     ) : (
                        <section className="flex flex-col gap-3">
                           <h4 className="text-sm font-semibold">
                              Estado de cuenta
                           </h4>
                           <DetailGrid items={coachAccountItems} />
                        </section>
                     )}
                  </div>
               </div>

               <DialogFooter className="shrink-0 border-t bg-muted/50 px-6 py-5">
                  <div className="pb-3">
                     <DialogClose asChild>
                        <Button type="button" variant="outline">
                           Cerrar
                        </Button>
                     </DialogClose>
                  </div>
               </DialogFooter>
            </div>
         </DialogContent>
      </Dialog>
   );
}
