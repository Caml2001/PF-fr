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

// useUpdateProfile moved to dedicated file: hooks/useUpdateProfile.tsx
// This avoids duplication and ensures consistent behavior
