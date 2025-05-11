import apiClient from './axios';

export interface OnboardingStatusResponse {
  status: string;
  details: {
    lastUpdated: string;
    profile: any;
  };
}

export interface CompleteOnboardingResponse {
  success: boolean;
  message: string;
  creditReport?: {
    score: number;
    scoreRange: string;
    folioConsulta: string;
    fechaConsulta: string;
  };
}

export async function fetchOnboardingStatus(): Promise<OnboardingStatusResponse> {
  const response = await apiClient.get('/onboarding/status');
  return response.data;
}

export async function completeOnboarding(consentToBureauCheck: boolean): Promise<CompleteOnboardingResponse> {
  const response = await apiClient.post('/onboarding/complete', { consentToBureauCheck });
  return response.data;
}
