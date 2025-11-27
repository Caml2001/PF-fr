import { useMutation } from '@tanstack/react-query';
import { login, type AuthCredentials, type AuthResponse } from '../lib/api/authService';
import { setAmplitudeUser } from '../lib/amplitude';

export const useLogin = () => {
  return useMutation<AuthResponse, Error, AuthCredentials>({
    mutationFn: login,
    onSuccess: (data) => {
      if (data?.accessToken) {
        localStorage.setItem('authToken', data.accessToken);
        console.log('Auth token stored in localStorage (login).');

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
        console.warn('No accessToken received upon login.');
      }
    },
    // Optional: Add onError, onSettled callbacks here
  });
};
