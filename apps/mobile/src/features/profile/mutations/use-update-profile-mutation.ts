import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
   updateMyProfile,
   type UpdateMyProfilePayload,
} from '@/services/api/profileService';
import { profileQueryKeys } from '../queries/profile-query-keys';

// Hook para actualizar el perfil del usuario
export function useUpdateProfileMutation() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (payload: UpdateMyProfilePayload) => updateMyProfile(payload),
      onSuccess: (user) => {
         queryClient.setQueryData(profileQueryKeys.me, user);
      },
   });
}
