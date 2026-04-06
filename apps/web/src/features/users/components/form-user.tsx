"use client";

import * as React from "react";

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
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserRole } from "@gym-app/types";

// Type para los valores del formulario de creación de usuario.
export type UserFormValues = {
   email: string;
   username: string;
   firstName: string;
   lastName: string;
   role: UserRole;
};

// Valores por defecto para el formulario de creación de usuario.
export const EMPTY_USER_FORM_VALUES: UserFormValues = {
   email: "",
   username: "",
   firstName: "",
   lastName: "",
   role: "USER",
};

// Dialogo para crear o editar un usuario.
type AddUserDialogProps = {
   isOpen: boolean;
   isSaving: boolean;
   mode: "create" | "edit";
   onOpenChange: (open: boolean) => void;
   onRoleChange: (role: UserRole) => void;
   onSubmit: React.FormEventHandler<HTMLFormElement>;
   onValueChange: React.ChangeEventHandler<HTMLInputElement>;
   values: UserFormValues;
};

export function AddUserDialog({
   isOpen,
   isSaving,
   mode,
   onOpenChange,
   onRoleChange,
   onSubmit,
   onValueChange,
   values,
}: AddUserDialogProps) {
   const isEditMode = mode === "edit";

   return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
         <DialogContent className="sm:max-w-sm">
            <form className="flex flex-col gap-4" onSubmit={onSubmit}>
               <DialogHeader>
                  <DialogTitle>{isEditMode ? "Edit user" : "Add user"}</DialogTitle>
                  <DialogDescription>
                     {isEditMode
                        ? "Update the selected user information."
                        : "Complete the basic information to create a new user."}
                  </DialogDescription>
               </DialogHeader>
               <FieldGroup>
                  <Field>
                     <Label htmlFor="email">Email<span className="text-destructive">*</span></Label>
                     <Input
                        id="email"
                        name="email"
                        type="email"
                        value={values.email}
                        onChange={onValueChange}
                        disabled={isEditMode}
                     />
                  </Field>
                  <Field>
                     <Label htmlFor="firstName">First name</Label>
                     <Input
                        id="firstName"
                        name="firstName"
                        value={values.firstName}
                        onChange={onValueChange}
                     />
                  </Field>
                  <Field>
                     <Label htmlFor="lastName">Last name</Label>
                     <Input
                        id="lastName"
                        name="lastName"
                        value={values.lastName}
                        onChange={onValueChange}
                     />
                  </Field>
                  <Field>
                     <Label htmlFor="username">Username</Label>
                     <Input
                        id="username"
                        name="username"
                        value={values.username}
                        onChange={onValueChange}
                     />
                  </Field>
                  <Field>
                     <Label htmlFor="role">Role</Label>
                     <Select value={values.role} onValueChange={onRoleChange}>
                        <SelectTrigger className="w-full">
                           <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="ADMIN">Admin</SelectItem>
                           <SelectItem value="COACH">Coach</SelectItem>
                           <SelectItem value="USER">User</SelectItem>
                        </SelectContent>
                     </Select>
                  </Field>
               </FieldGroup>
               <DialogFooter>
                  <DialogClose asChild>
                     <Button type="button" variant="outline" disabled={isSaving}>
                        Cancel
                     </Button>
                  </DialogClose>
                  <Button type="submit" disabled={isSaving}>
                     {isSaving ? "Saving..." : "Save user"}
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
}
