// Placeholder for credit application related API calls
import apiClient from './axios';

// Interfaz para la respuesta del crédito actualizada según respuesta del backend
export interface CreditInfo {
  limit: number;
  used: number;
  available: number;
  currency: string;
}

export const applyForCredit = async (applicationData: any) => {
  // const response = await apiClient.post('/credit/apply', applicationData);
  // return response.data;
  console.warn('applyForCredit not implemented');
  return Promise.resolve({}); // Placeholder data
};

export const getCreditStatus = async (applicationId: string) => {
  // const response = await apiClient.get(`/credit/status/${applicationId}`);
  // return response.data;
  console.warn('getCreditStatus not implemented');
  return Promise.resolve({}); // Placeholder data
};

// Obtener información del crédito disponible del usuario
export const getCreditInfo = async (): Promise<CreditInfo> => {
  try {
    const response = await apiClient.get('/profile/credit');
    return response.data;
  } catch (error) {
    console.error('Error al obtener información de crédito:', error);
    // Valores por defecto en caso de error
    return {
      limit: 0,
      used: 0,
      available: 0,
      currency: 'MXN'
    };
  }
};
