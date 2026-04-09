"use client";

import {
   flexRender,
   type Table as TanstackTable,
} from "@tanstack/react-table";
import {
   IconChevronLeft,
   IconChevronRight,
   IconChevronsLeft,
   IconChevronsRight,
   IconPlus,
   IconTrash,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
   EXERCISE_CATEGORY_VALUES,
   getExerciseCategoryLabelEs,
   getMuscleGroupLabelEs,
   MUSCLE_GROUP_VALUES,
} from "@gym-app/types";

type DataTableContentProps<TData> = {
   columnsLength: number;
   isLoading: boolean;
   table: TanstackTable<TData>;
   total: number;
   search: string;
   filterGroupMuscle: string;
   filterCategory: string;
   onAddUser: () => void;
   onSearchChange: (value: string) => void;
   onFilterGroupMuscleChange: (value: string) => void;
   onFilterCategoryChange: (value: string) => void;
   onClearFilters: () => void;
};

export function DataTableContent<TData>({
   columnsLength,
   isLoading,
   table,
   total,
   search,
   filterGroupMuscle,
   filterCategory,
   onAddUser,
   onSearchChange,
   onFilterGroupMuscleChange,
   onFilterCategoryChange,
   onClearFilters
}: DataTableContentProps<TData>) {
   return (
      <Tabs
         defaultValue="outline"
         className="w-full flex-col justify-start gap-6"
      >
         <div className="flex items-center justify-between px-4 lg:px-6 py-1">
            <div className="flex gap-5">
               <Input
                  placeholder="Filtro..."
                  value={search}
                  onChange={(event) =>
                     onSearchChange(event.currentTarget.value)
                  }
                  className="max-w-sm"
               />
               <Select
                  value={filterGroupMuscle}
                  onValueChange={onFilterGroupMuscleChange}
               >
                  <SelectTrigger className="w-full">
                     <SelectValue placeholder="Filtrar por grupo muscular" />
                  </SelectTrigger>
                  <SelectContent>
                     {MUSCLE_GROUP_VALUES.map((muscleGroup) => (
                        <SelectItem key={muscleGroup} value={muscleGroup}>
                           {getMuscleGroupLabelEs(muscleGroup)}
                        </SelectItem>
                     ))}
                  </SelectContent>
               </Select>
               <Select
                  value={filterCategory}
                  onValueChange={onFilterCategoryChange}
               >
                  <SelectTrigger className="w-full">
                     <SelectValue placeholder="Filtrar por categoría" />
                  </SelectTrigger>
                  <SelectContent>
                     {EXERCISE_CATEGORY_VALUES.map((category) => (
                        <SelectItem key={category} value={category}>
                           {getExerciseCategoryLabelEs(category)}
                        </SelectItem>
                     ))}
                  </SelectContent>
               </Select>
               <div className="ml-auto flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={onClearFilters}>
                     <IconTrash data-icon="inline-start" />
                     <span className="hidden lg:inline">Limpiar filtros</span>
                  </Button>
               </div>
            </div>
            <div className="flex items-center justify-between px-4 lg:px-6">
               <div className="ml-auto flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={onAddUser}>
                     <IconPlus data-icon="inline-start" />
                     <span className="hidden lg:inline">Añadir ejercicio</span>
                  </Button>
               </div>
            </div>
         </div>
         <TabsContent
            value="outline"
            className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
         >
            <div className="overflow-hidden rounded-lg border">
               <Table>
                  <TableHeader className="sticky top-0 z-10 bg-muted">
                     {/* TanStack genera grupos de headers para soportar columnas complejas. */}
                     {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                           {headerGroup.headers.map((header) => (
                              <TableHead key={header.id} colSpan={header.colSpan}>
                                 {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                         header.column.columnDef.header,
                                         header.getContext(),
                                      )}
                              </TableHead>
                           ))}
                        </TableRow>
                     ))}
                  </TableHeader>
                  <TableBody className="**:data-[slot=table-cell]:first:w-8">
                     {/* Si hay filas visibles, renderizamos las celdas; si no, mostramos estado vacio. */}
                     {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                           <TableRow key={row.id}>
                              {row.getVisibleCells().map((cell) => (
                                 <TableCell key={cell.id}>
                                    {flexRender(
                                       cell.column.columnDef.cell,
                                       cell.getContext(),
                                    )}
                                 </TableCell>
                              ))}
                           </TableRow>
                        ))
                     ) : isLoading ? (
                        <TableRow>
                           <TableCell
                              colSpan={columnsLength}
                              className="h-24 text-center"
                           >
                              Cargando ejercicios...
                           </TableCell>
                        </TableRow>
                     ) : (
                        <TableRow>
                           <TableCell
                              colSpan={columnsLength}
                              className="h-24 text-center"
                           >
                              No results.
                           </TableCell>
                        </TableRow>
                     )}
                  </TableBody>
               </Table>
            </div>
            <div className="flex items-center justify-between px-4">
               <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
                  {total} ejercicios
               </div>
               <div className="flex w-full items-center gap-8 lg:w-fit">
                  <div className="hidden items-center gap-2 lg:flex">
                     <Label htmlFor="rows-per-page" className="text-sm font-medium">
                        Filas por página
                     </Label>
                     <Select
                        value={`${table.getState().pagination.pageSize}`}
                        onValueChange={(value) => {
                           table.setPageSize(Number(value));
                           table.setPageIndex(0);
                        }}
                     >
                        <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                           <SelectValue
                              placeholder={table.getState().pagination.pageSize}
                           />
                        </SelectTrigger>
                        <SelectContent side="top">
                           {[10, 20, 30, 40, 50].map((pageSize) => (
                              <SelectItem key={pageSize} value={`${pageSize}`}>
                                 {pageSize}
                              </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>
                  {/* La paginacion vive en el hook y TanStack calcula el total de paginas. */}
                  <div className="flex w-fit items-center justify-center text-sm font-medium">
                     Página {table.getState().pagination.pageIndex + 1} de{" "}
                     {table.getPageCount()}
                  </div>
                  <div className="ml-auto flex items-center gap-2 lg:ml-0">
                     <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                     >
                        <span className="sr-only">Ir a la primera página</span>
                        <IconChevronsLeft />
                     </Button>
                     <Button
                        variant="outline"
                        className="size-8"
                        size="icon"
                        onClick={() => table.previousPage()}
                        disabled={isLoading || !table.getCanPreviousPage()}
                     >
                        <span className="sr-only">Ir a la página anterior</span>
                        <IconChevronLeft />
                     </Button>
                     <Button
                        variant="outline"
                        className="size-8"
                        size="icon"
                        onClick={() => table.nextPage()}
                        disabled={isLoading || !table.getCanNextPage()}
                     >
                        <span className="sr-only">Ir a la página siguiente</span>
                        <IconChevronRight />
                     </Button>
                     <Button
                        variant="outline"
                        className="hidden size-8 lg:flex"
                        size="icon"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={isLoading || !table.getCanNextPage()}
                     >
                        <span className="sr-only">Ir a la última página</span>
                        <IconChevronsRight />
                     </Button>
                  </div>
               </div>
            </div>
         </TabsContent>
      </Tabs>
   );
}
