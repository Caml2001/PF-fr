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
      } else {
        console.warn('Token not available in response after registration, or signup failed upstream.');
      }
      
      options?.onSuccess?.(data, variables, context);
    },
  });
};
