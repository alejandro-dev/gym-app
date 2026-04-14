"use client";

import {
   flexRender,
   type Table as TanstackTable,
} from "@tanstack/react-table";
import {
   IconActivity,
   IconChevronLeft,
   IconChevronRight,
   IconChevronsLeft,
   IconChevronsRight,
   IconPlus,
   IconTemplate,
   IconUsers,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

type DataTableContentProps<TData> = {
   columnsLength: number;
   isLoading: boolean;
   table: TanstackTable<TData>;
   total: number;
   search: string;
   activePlans: number;
   assignedPlans: number;
   templatePlans: number;
   onCreatePlan: () => void;
   onSearchChange: (value: string) => void;
   onClearFilters: () => void;
};

export function DataTableContent<TData>({
   columnsLength,
   isLoading,
   table,
   total,
   search,
   activePlans,
   assignedPlans,
   templatePlans,
   onCreatePlan,
   onSearchChange,
   onClearFilters
}: DataTableContentProps<TData>) {
   return (
      <Tabs
         defaultValue="outline"
         className="w-full flex-col justify-start gap-6"
      >
         <div className="grid gap-4 px-4 lg:grid-cols-3 lg:px-6">
            <Card size="sm" className="bg-muted/40">
               <CardContent className="flex items-center gap-3 pt-3">
                  <div className="rounded-lg bg-background p-2 text-muted-foreground ring-1 ring-border">
                     <IconActivity />
                  </div>
                  <div>
                     <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        Planes activos
                     </div>
                     <div className="text-xl font-semibold">{activePlans}</div>
                  </div>
               </CardContent>
            </Card>
            <Card size="sm" className="bg-muted/40">
               <CardContent className="flex items-center gap-3 pt-3">
                  <div className="rounded-lg bg-background p-2 text-muted-foreground ring-1 ring-border">
                     <IconUsers />
                  </div>
                  <div>
                     <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        Planes asignados
                     </div>
                     <div className="text-xl font-semibold">{assignedPlans}</div>
                  </div>
               </CardContent>
            </Card>
            <Card size="sm" className="bg-muted/40">
               <CardContent className="flex items-center gap-3 pt-3">
                  <div className="rounded-lg bg-background p-2 text-muted-foreground ring-1 ring-border">
                     <IconTemplate />
                  </div>
                  <div>
                     <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        Plantillas
                     </div>
                     <div className="text-xl font-semibold">{templatePlans}</div>
                  </div>
               </CardContent>
            </Card>
         </div>
         <div className="flex flex-col gap-3 px-4 py-1 lg:flex-row lg:items-center lg:justify-between lg:px-6">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
               <Input
                  placeholder="Buscar plan por nombre..."
                  value={search}
                  onChange={(event) =>
                     onSearchChange(event.currentTarget.value)
                  }
                  className="max-w-sm"
               />
               <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={onClearFilters}>
                     Limpiar filtros
                  </Button>
                  <Badge variant="outline">{total} planes</Badge>
               </div>
            </div>
            <Button onClick={onCreatePlan}>
               <IconPlus data-icon="inline-start" />
               Crear plan
            </Button>
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
                              Cargando planes...
                           </TableCell>
                        </TableRow>
                     ) : (
                        <TableRow>
                           <TableCell
                              colSpan={columnsLength}
                              className="h-24 text-center"
                           >
                              No hay resultados.
                           </TableCell>
                        </TableRow>
                     )}
                  </TableBody>
               </Table>
            </div>
            <div className="flex items-center justify-between px-4">
               <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
                  {total} planes en total
               </div>
               <div className="flex w-full items-center gap-8 lg:w-fit">
                  <div className="hidden items-center gap-2 lg:flex">
                     <span className="text-sm font-medium">
                        Filas por página
                     </span>
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
