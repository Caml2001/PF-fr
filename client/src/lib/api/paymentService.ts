// Placeholder for payment related API calls
import apiClient from './axios';

export const getPaymentHistory = async () => {
  // const response = await apiClient.get('/payments/history');
  // return response.data;
  console.warn('getPaymentHistory not implemented');
  return Promise.resolve([]); // Placeholder data
};

export const makePayment = async (paymentData: any) => {
  // const response = await apiClient.post('/payments/make', paymentData);
  // return response.data;
  console.warn('makePayment not implemented');
  return Promise.resolve({}); // Placeholder data
};
