import { useMutation } from '@tanstack/react-query';
import { login, type AuthCredentials, type AuthResponse } from '../lib/api/authService';

export const useLogin = () => {
  return useMutation<AuthResponse, Error, AuthCredentials>({
    mutationFn: login,
    onSuccess: (data) => {
      if (data?.accessToken) {
        localStorage.setItem('authToken', data.accessToken);
        console.log('Auth token stored in localStorage (login).');

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
        console.warn('No accessToken received upon login.');
      }
    },
    // Optional: Add onError, onSettled callbacks here
  });
};
