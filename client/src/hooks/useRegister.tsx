import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { signup, SignupData, AuthResponse } from '../lib/api/authService';
import { setAmplitudeUser } from '../lib/amplitude';

export const useRegister = (
  options?: Omit<
    UseMutationOptions<AuthResponse, Error, SignupData>,
    'mutationFn'
  >
) => {
  return useMutation<AuthResponse, Error, SignupData>({
    mutationFn: signup,
    ...options,
    onSuccess: (data, variables, context) => {
      if (data?.accessToken) {
        console.log('Registration successful, token processed by authService.');

        // Set userId in Amplitude for session replay and events
        if (data.user?.id) {
          setAmplitudeUser({
            id: data.user.id,
            email: data.user.email,
            role: data.user.role,
            onboardingStatus: data.user.onboardingStatus,
          });
        }
      } else {
        console.warn('Token not available in response after registration, or signup failed upstream.');
      }

      options?.onSuccess?.(data, variables, context);
    },
  });
};
