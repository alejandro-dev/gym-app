import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useState, type ReactNode } from 'react';

interface QueryProviderProps {
   children: ReactNode;
}

// Creamos una instancia de QueryClient y la proporcionamos a través del contexto de React Query para que esté disponible en toda la aplicación.
export function QueryProvider({ children }: QueryProviderProps) {
   const [queryClient] = useState(
      () =>
         new QueryClient({
            defaultOptions: {
               queries: {
                  staleTime: 1000 * 60, // Tiempo de vida de la caché en segundos. Después de este tiempo, los datos se considerarán obsoletos y se volverán a consultar cuando se acceda a ellos.
                  retry: 1, // Número de reintentos si la consulta falla
               },
            },
         }),
   );

   return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
   );
}
