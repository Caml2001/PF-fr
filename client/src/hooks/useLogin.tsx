import { useMutation } from '@tanstack/react-query';
import { login, type AuthCredentials, type AuthResponse } from '../lib/api/authService';

export const useLogin = () => {
  return useMutation<AuthResponse, Error, AuthCredentials>({
    mutationFn: login, 
    onSuccess: (data) => {
      if (data?.accessToken) {
        localStorage.setItem('authToken', data.accessToken);
        console.log('Auth token stored in localStorage (login).');
      } else {
        console.warn('No accessToken received upon login.');
      }
    },
    // Optional: Add onError, onSettled callbacks here
  });
};
