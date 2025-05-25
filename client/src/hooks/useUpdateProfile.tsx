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
    onSuccess: (updatedData) => {
      console.log('Profile updated successfully:', updatedData);
      
      // Update the cache with the new data from the response
      queryClient.setQueryData(['profile'], updatedData);
      
      // Also invalidate to ensure we have the latest server state
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
    }
  });
};
