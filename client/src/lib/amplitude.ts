// Amplitude helper functions
import * as amplitude from '@amplitude/analytics-browser';
import { sessionReplayPlugin } from '@amplitude/plugin-session-replay-browser';

// API Key for Amplitude
const AMPLITUDE_API_KEY = 'b6211dfd4f47601421617b70c9cc61d3';

// Track initialization status
let isInitialized = false;

interface AmplitudeUser {
  id: string;
  email: string;
  role?: string;
  onboardingStatus?: string;
}

/**
 * Initialize Amplitude with session replay
 * Should be called once when the app starts
 */
export const initAmplitude = (): void => {
  if (isInitialized) {
    console.log('Amplitude already initialized');
    return;
  }

  try {
    // Add session replay plugin
    amplitude.add(sessionReplayPlugin({ sampleRate: 1 }));

    // Initialize Amplitude with proper configuration
    amplitude.init(AMPLITUDE_API_KEY, {
      defaultTracking: {
        sessions: true,
        pageViews: true,
        formInteractions: false,
        fileDownloads: false,
      },
      // Flush events immediately for testing (use higher value in production)
      flushIntervalMillis: 1000,
      flushQueueSize: 10,
    });

    isInitialized = true;
    console.log('Amplitude initialized successfully');
  } catch (error) {
    console.error('Error initializing Amplitude:', error);
  }
};

/**
 * Sets the user ID in Amplitude and identifies user properties
 */
export const setAmplitudeUser = (user: AmplitudeUser): void => {
  try {
    if (!isInitialized) {
      initAmplitude();
    }

    // Set user ID
    amplitude.setUserId(user.id);

    // Identify user properties
    const identify = new amplitude.Identify();
    identify.set('email', user.email);
    if (user.role) identify.set('role', user.role);
    if (user.onboardingStatus) identify.set('onboardingStatus', user.onboardingStatus);

    amplitude.identify(identify);

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
    if (!isInitialized) {
      return;
    }

    amplitude.setUserId(null);
    console.log('Amplitude userId cleared');
  } catch (error) {
    console.error('Error clearing Amplitude user:', error);
  }
};

/**
 * Track a custom event in Amplitude
 */
export const trackAmplitudeEvent = (eventName: string, eventProperties?: Record<string, any>): void => {
  try {
    if (!isInitialized) {
      initAmplitude();
    }

    amplitude.track(eventName, eventProperties);
  } catch (error) {
    console.error('Error tracking Amplitude event:', error);
  }
};
