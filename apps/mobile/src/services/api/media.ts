import { buildApiUrl } from '@/services/api/client';

// Resolve el URL de una imagen de la API.
export function resolveApiImageUrl(imageUrl: string | null) {
   if (!imageUrl?.trim()) {
      return null;
   }

   const normalizedImageUrl = imageUrl.trim();

   if (normalizedImageUrl.startsWith('data:image/')) {
      return normalizedImageUrl;
   }

   return buildApiUrl(normalizedImageUrl);
}
