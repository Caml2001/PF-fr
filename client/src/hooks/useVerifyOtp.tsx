import { useMutation } from '@tanstack/react-query';
import { verifyOtp } from '../lib/api/profileService';

export const useVerifyOtp = () => {
  return useMutation({ mutationFn: verifyOtp });
};
