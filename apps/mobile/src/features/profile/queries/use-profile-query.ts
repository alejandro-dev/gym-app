import { useQuery } from '@tanstack/react-query';

import { getMyProfile } from '@/services/api/profileService';
import { profileQueryKeys } from './profile-query-keys';

// Hook para obtener los datos del perfil del usuario
export function useProfileQuery() {
   return useQuery({
      queryKey: profileQueryKeys.me,
      queryFn: getMyProfile,
   });
}
