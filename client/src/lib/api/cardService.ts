import apiClient from './axios';

// Interfaces para el manejo de tarjetas
export interface CardInfo {
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
}

export interface GetCardResponse {
  hasCard: boolean;
  card?: CardInfo;
}

export interface SetupCardResponse {
  clientSecret: string;
  customerId: string;
}

export interface ConfirmCardResponse {
  success: boolean;
  card: CardInfo;
}

// Obtener información de la tarjeta actual del usuario
export const getCard = async (): Promise<GetCardResponse> => {
  const response = await apiClient.get('/api/payments/card');
  return response.data;
};

// Iniciar el proceso de agregar/cambiar tarjeta (obtiene clientSecret para Stripe)
export const setupCard = async (): Promise<SetupCardResponse> => {
  const response = await apiClient.post('/api/payments/setup-card');
  return response.data;
};

// Confirmar la nueva tarjeta después de validación en Stripe
export const confirmCard = async (setupIntentId: string): Promise<ConfirmCardResponse> => {
  const response = await apiClient.post('/api/payments/confirm-card', { setupIntentId });
  return response.data;
};

// Eliminar la tarjeta guardada
export const deleteCard = async (): Promise<{ success: boolean }> => {
  const response = await apiClient.delete('/api/payments/card');
  return response.data;
};

// Helper para formatear el brand de la tarjeta para mostrar
export const formatCardBrand = (brand: string): string => {
  const brands: Record<string, string> = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    amex: 'American Express',
    discover: 'Discover',
    diners: 'Diners Club',
    jcb: 'JCB',
    unionpay: 'UnionPay',
    unknown: 'Tarjeta'
  };
  return brands[brand.toLowerCase()] || brand;
};

// Helper para formatear la fecha de expiración
export const formatExpiry = (month: number, year: number): string => {
  const monthStr = month.toString().padStart(2, '0');
  const yearStr = year.toString().slice(-2);
  return `${monthStr}/${yearStr}`;
};
