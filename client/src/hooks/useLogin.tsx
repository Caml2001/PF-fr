import { useMutation } from '@tanstack/react-query';
import { login, type AuthCredentials, type AuthResponse } from '../lib/api/authService';

export const useLogin = () => {
  return useMutation<AuthResponse, Error, AuthCredentials>({
    mutationFn: login, 
    onSuccess: (data) => {
      if (data?.session?.access_token) {
        localStorage.setItem('authToken', data.session.access_token);
        console.log('Auth token stored in localStorage (login).');
      } else {
        console.warn('No token received upon login or session object missing.');
      }
    },
    // Optional: Add onError, onSettled callbacks here
  });
};
