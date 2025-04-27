import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile } from '../lib/api/profileService';

const PROFILE_QUERY_KEY = ['profile'];

export const useProfile = () => {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: getProfile,
    // Add options like staleTime, gcTime, refetchOnWindowFocus etc. if needed
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      // Invalidate the profile query to refetch fresh data
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
    // Add onError handling
  });
};
