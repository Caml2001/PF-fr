// Amplitude helper functions

interface AmplitudeUser {
  id: string;
  email: string;
  role?: string;
  onboardingStatus?: string;
}

/**
 * Sets the user ID in Amplitude and identifies user properties
 */
export const setAmplitudeUser = (user: AmplitudeUser): void => {
  try {
    // Check if Amplitude is available
    if (typeof window === 'undefined' || !window.amplitude) {
      console.warn('Amplitude is not available');
      return;
    }

    // Set user ID
    window.amplitude.setUserId(user.id);

    // Identify user properties
    const identify = new window.amplitude.Identify();
    identify.set('email', user.email);
    if (user.role) identify.set('role', user.role);
    if (user.onboardingStatus) identify.set('onboardingStatus', user.onboardingStatus);

    window.amplitude.identify(identify);

    console.log('Amplitude userId set:', user.id);
  } catch (error) {
    console.error('Error setting Amplitude user:', error);
  }
};

/**
 * Clears the user ID in Amplitude (useful for logout)
 */
export const clearAmplitudeUser = (): void => {
  try {
    if (typeof window === 'undefined' || !window.amplitude) {
      return;
    }

    window.amplitude.setUserId(null);
    console.log('Amplitude userId cleared');
  } catch (error) {
    console.error('Error clearing Amplitude user:', error);
  }
};
