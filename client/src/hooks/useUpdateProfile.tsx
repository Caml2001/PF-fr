import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile, ProfileData } from '../lib/api/profileService';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, Partial<ProfileData>>({
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
