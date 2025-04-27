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
      if (data?.session?.access_token) { 
        localStorage.setItem('authToken', data.session.access_token);
        console.log('Auth token stored in localStorage.');
      } else {
        console.warn('No token received upon registration or session object missing.');
      }
      
      options?.onSuccess?.(data, variables, context);
    },
  });
};
