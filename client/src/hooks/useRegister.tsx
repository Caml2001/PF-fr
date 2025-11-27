import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { signup, SignupData, AuthResponse } from '../lib/api/authService'; 

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
          window.amplitude.setUserId(data.user.id);

          // Identify user properties in Amplitude
          const identify = new window.amplitude.Identify();
          identify.set('email', data.user.email);
          if (data.user.role) identify.set('role', data.user.role);
          if (data.user.onboardingStatus) identify.set('onboardingStatus', data.user.onboardingStatus);
          window.amplitude.identify(identify);

          console.log('Amplitude userId set:', data.user.id);
        }
      } else {
        console.warn('Token not available in response after registration, or signup failed upstream.');
      }

      options?.onSuccess?.(data, variables, context);
    },
  });
};
