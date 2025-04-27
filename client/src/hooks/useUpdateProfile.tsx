import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile } from '../lib/api/profileService';

// Define ProfileData type matching the one in profileService.ts or import it
interface ProfileData {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  motherLastName?: string;
  curp?: string;
  street?: string;
  number?: string;
  colonia?: string;
  municipality?: string;
  state?: string;
  postalCode?: string;
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, ProfileData>({
    mutationFn: updateProfile,
    onSuccess: () => {
      // Invalidate and refetch the profile query after successful update
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    // Add onError handling if needed
  });
};
