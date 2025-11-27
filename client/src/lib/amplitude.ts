// Amplitude helper functions

interface AmplitudeUser {
  id: string;
  email: string;
  role?: string;
  onboardingStatus?: string;
}

/**
 * Checks if Amplitude is available
 */
const isAmplitudeAvailable = (): boolean => {
  return typeof window !== 'undefined' && !!window.amplitude;
};

/**
 * Waits for Amplitude to be available with retries
 */
const waitForAmplitude = (callback: () => void, maxRetries = 10): void => {
  let attempts = 0;

  const check = () => {
    attempts++;

    if (isAmplitudeAvailable()) {
      callback();
    } else if (attempts < maxRetries) {
      setTimeout(check, 200); // Retry every 200ms
    } else {
      console.warn('Amplitude is not available after', maxRetries, 'attempts');
    }
  };

  check();
};

/**
 * Sets the user ID in Amplitude and identifies user properties
 */
export const setAmplitudeUser = (user: AmplitudeUser): void => {
  const setUser = () => {
    try {
      if (!isAmplitudeAvailable()) {
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

  // If Amplitude is not immediately available, wait for it
  if (!isAmplitudeAvailable()) {
    console.log('Waiting for Amplitude to load...');
    waitForAmplitude(setUser);
  } else {
    setUser();
  }
};

/**
 * Clears the user ID in Amplitude (useful for logout)
 */
export const clearAmplitudeUser = (): void => {
  try {
    if (!isAmplitudeAvailable()) {
      return;
    }

    window.amplitude.setUserId(null);
    console.log('Amplitude userId cleared');
  } catch (error) {
    console.error('Error clearing Amplitude user:', error);
  }
};
