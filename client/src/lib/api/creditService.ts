// Placeholder for credit application related API calls
import apiClient from './axios';

// Interfaz para la respuesta del crédito actualizada según respuesta del backend
export interface CreditInfo {
  limit: number;
  used: number;
  available: number;
  currency: string;
}

// Interfaz para los productos de préstamo
export interface LoanProduct {
  id: string;
  name: string;
  productType: string;
  ratePeriodicity: string;
  rateDefinitionPeriodicity: string;
  minRate: number;
  maxRate: number;
  commissionRate: number;
  lateFeeRate: number;
  minAmount: number;
  maxAmount: number;
  createdAt: string;
  isExpressProduct: boolean;
  fixedTerm?: number;
}

// Interfaz para la solicitud de préstamo
export interface LoanApplicationData {
  productId: string;
  principal: number;
  term?: number;
  paymentAmount?: number;
  startDate?: string;
}

// Interfaz para la respuesta de préstamo
export interface LoanResponse {
  id: string;
  status: string;
  principal: number;
  interestRate: number;
  term: number;
  commissionAmount: number;
  disbursedAmount: number;
  startDate: string;
  dueDate: string;
  productName: string;
  createdAt: string;
  // Otros campos según schema LoanResponseSchema
}

export const applyForCredit = async (applicationData: LoanApplicationData): Promise<LoanResponse> => {
  try {
    const response = await apiClient.post('api/loans', applicationData);
    return response.data;
  } catch (error) {
    console.error('Error al solicitar préstamo:', error);
    throw error;
  }
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

// Obtener los productos de préstamo disponibles
export const getLoanProducts = async (): Promise<LoanProduct[]> => {
  try {
    const response = await apiClient.get('api/loan-products');
    return response.data;
  } catch (error) {
    console.error('Error al obtener productos de préstamo:', error);
    return [];
  }
};
