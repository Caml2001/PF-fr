import apiClient from './axios';

export interface OnboardingStatusResponse {
  status: string;
  details: {
    lastUpdated: string;
    profile: any;
  };
}

export async function fetchOnboardingStatus(): Promise<OnboardingStatusResponse> {
  const response = await apiClient.get('/onboarding/status');
  return response.data;
}
