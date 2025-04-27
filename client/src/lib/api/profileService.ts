// Placeholder for profile related API calls
import apiClient from './axios';

// Define types based on API docs and onboarding steps
// (Expand as needed)
interface ProfileData {
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
  // Add other fields from GET /profile/profile response if needed
}

export const getProfile = async () => {
  try {
    const response = await apiClient.get('/profile/profile');
    return response.data; // Assuming the response contains the profile object
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error; // Re-throw to be handled by React Query
  }
};

export const updateProfile = async (profileData: ProfileData) => {
  try {
    const response = await apiClient.patch('/profile/profile', profileData);
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
    return response.data; // Response should confirm verification
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

export const uploadIne = async (ineFrontFile: File, ineBackFile: File) => {
  const formData = new FormData();
  formData.append('ineFrontal', ineFrontFile);
  formData.append('ineTrasera', ineBackFile);

  try {
    const response = await apiClient.post('/profile/ine/verify', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data; // Response likely contains OCR results or confirmation
  } catch (error) {
    console.error('Error uploading INE:', error);
    throw error;
  }
};
