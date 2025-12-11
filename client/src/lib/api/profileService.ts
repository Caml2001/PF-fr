// Placeholder for profile related API calls
import apiClient from './axios';

// Define types based on API docs and onboarding steps
// (Expand as needed)
export interface ProfileData {
  id: string;
  userId: string;
  email?: string;
  phoneNumber?: string;
  phoneVerified?: boolean;
  onboardingStatus: string;
  createdAt: string;
  updatedAt: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  motherLastName?: string;
  curp?: string;
  street?: string;
  number?: string;
  colonia?: string;
  municipality?: string;
  state?: string;
  postalCode?: string;
  proofOfAddressUrl?: string | null;
  ineClaveElector?: string;
  ineIssueDate?: string;
  ineExpirationDate?: string;
  // Add other fields from GET /profile/profile response if needed
}

// Nueva interfaz para la respuesta de uploadIne
export interface ProfileUploadResponse {
  profile: ProfileData;
  token: string; // Asumiendo que este es un accessToken
  // Podría haber otros campos si el backend los envía
}

export const getProfile = async (): Promise<ProfileData> => {
  try {
    const response = await apiClient.get<ProfileData>('/profile/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error; // Re-throw to be handled by React Query
  }
};

export const updateProfile = async (profileData: Partial<ProfileData>): Promise<ProfileData> => {
  try {
    console.log('Sending profile update:', profileData);
    const response = await apiClient.patch<ProfileData>('/profile/profile', profileData);
    console.log('Profile update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Submit phone number to initiate OTP verification
export const submitPhoneNumber = async (phoneNumber: string) => {
  try {
    // Corrected payload format
    const payload = {
      phone_number: phoneNumber
    };
    const response = await apiClient.patch('/profile/phone', payload);
    return response.data; // Response might indicate success or require OTP step
  } catch (error) {
    console.error('Error submitting phone number:', error);
    throw error;
  }
};

// Verifies OTP for a given phone number
export const verifyOtp = async ({ phoneNumber, otp }: { phoneNumber: string; otp: string }) => {
  try {
    const payload = {
      phone_number: phoneNumber,
      token: otp
    };
    const response = await apiClient.post('/profile/phone/verify', payload);

    // Check if response includes token and update auth token in localStorage
    if (response.data && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      // Also update the Authorization header for future requests
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }

    return response.data; // Response should confirm verification
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

export const uploadIne = async (ineFrontFile: File, ineBackFile: File): Promise<ProfileUploadResponse> => {
  const formData = new FormData();
  formData.append('ineFrontal', ineFrontFile);
  formData.append('ineTrasera', ineBackFile);

  try {
    const response = await apiClient.post<ProfileUploadResponse>('/profile/ine/verify', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Si la respuesta contiene un nuevo token, lo guardamos.
    // Asumimos que el 'token' recibido es un accessToken.
    // Si también se recibe un refreshToken, authService.saveTokens sería más apropiado.
    if (response.data && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      console.log('New token from INE upload saved.');
    }
    
    // Devolvemos toda la respuesta, ya que el componente podría necesitar el perfil.
    return response.data; 
  } catch (error) {
    console.error('Error uploading INE:', error);
    throw error;
  }
};
