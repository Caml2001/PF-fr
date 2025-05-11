import apiClient from './axios';

// Define types (you might want to move these to a dedicated types file like src/lib/types/auth.ts)
export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignupData extends AuthCredentials {
  // Add other signup fields if needed by the API
  // Example: firstName?: string;
}

// Define more specific types if possible based on actual API response
interface User {
  id: string;
  email: string;
  // Add other relevant user fields
}

// Define a more specific type for the Session object
interface Session {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
  refresh_token: string;
  user: User; // Reuse the User interface
}

export interface AuthResponse {
  user: User; 
  session: Session; // Use the specific Session interface
  error?: string; 
}

export const login = async (credentials: AuthCredentials): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/signin', credentials);

    // Store the access token in localStorage
    if (response.data.session?.access_token) {
      localStorage.setItem('authToken', response.data.session.access_token);
      // Update the Authorization header for future requests
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.session.access_token}`;
    }

    return response.data;
  } catch (error: any) {
    // Re-throw or handle error appropriately
    console.error("Login API error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Login failed');
  }
};

export const signup = async (data: SignupData): Promise<AuthResponse> => {
  try {
    // Ensure only email and password are sent as per docs, unless API expects more
    const payload = {
      email: data.email,
      password: data.password,
    };
    const response = await apiClient.post<AuthResponse>('/auth/signup', payload);

    // Store the access token in localStorage
    if (response.data.session?.access_token) {
      localStorage.setItem('authToken', response.data.session.access_token);
      // Update the Authorization header for future requests
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.session.access_token}`;
    }

    return response.data;
  } catch (error: any) {
    console.error("Signup API error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Signup failed');
  }
};

// Optional: Add logout function if there's a backend endpoint for it
// export const logout = async (): Promise<void> => {
//   try {
//     await apiClient.post('/auth/signout'); 
//   } catch (error: any) {
//     console.error("Logout API error:", error.response?.data || error.message);
//     // Decide if logout failure should prevent frontend logout
//     throw new Error(error.response?.data?.error || 'Logout failed');
//   }
// };
