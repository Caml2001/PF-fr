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
  statusInfo?: string;
  token?: string;
}

export async function fetchOnboardingStatus(): Promise<OnboardingStatusResponse> {
  const response = await apiClient.get('/onboarding/status');
  return response.data;
}

export async function completeOnboarding(consentToBureauCheck: boolean): Promise<CompleteOnboardingResponse> {
  const response = await apiClient.post('/onboarding/complete', { consentToBureauCheck });
  
  if (response.data && response.data.token) {
    localStorage.setItem('authToken', response.data.token);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    console.log('Token final de acceso guardado.');
  }
  
  return response.data;
}

// Define la interfaz para el payload de datos personales
export interface PersonalDataPayload {
  firstName: string;
  middleName?: string; // Asumiendo que middleName puede ser opcional
  lastName: string;
  motherLastName: string;
  birthDate: string; // Formato YYYY-MM-DD esperado por el backend
  sex: string; // 'Hombre', 'Mujer', u otro formato esperado
}

// Interfaz para la respuesta de submitPersonalData
export interface PersonalDataResponse {
  success: boolean;
  message?: string;
  token?: string;
  profile?: any;
}

// Nueva función para enviar datos personales
export async function submitPersonalData(data: PersonalDataPayload): Promise<PersonalDataResponse> {
  try {
    const response = await apiClient.post<PersonalDataResponse>('/onboarding/temp', data);
    
    if (response.data && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      console.log('Nuevo token de datos personales guardado.');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error al enviar datos personales:', error);
    throw error;
  }
}
