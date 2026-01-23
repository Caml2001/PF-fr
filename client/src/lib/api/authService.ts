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
  role?: string; // Added from new structure
  onboardingStatus?: string; // Added from new structure
  profileId?: string; // Added from new structure
  // Add other relevant user fields
}

// Session interface is no longer directly part of AuthResponse in the same way,
// but its fields are now at the root of AuthResponse or renamed.
// interface Session {
//   access_token: string;
//   token_type: string;
//   expires_in: number;
//   expires_at: number;
//   refresh_token: string;
//   user: User; // Reuse the User interface
// }

export interface AuthResponse {
  user: User;
  accessToken: string; // Changed from session.access_token
  tokenType: string; // Changed from session.token_type (e.g., "Bearer")
  expiresIn: number; // Changed from session.expires_in
  expiresAt: number; // Changed from session.expires_at
  supabaseRefreshToken: string; // Changed from session.refresh_token and renamed
  error?: string;
}

export interface RefreshTokenResponse {
  token: string; // Assuming this response structure for refresh-token endpoint remains unchanged
}

// Función para guardar tokens en localStorage
const saveTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('authToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken); // refreshToken is now supabaseRefreshToken from response
  // Update the Authorization header for future requests
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
};

// Función para obtener el refresh token
export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

// Función para verificar si un token JWT está expirado o a punto de expirar
export const isTokenExpired = (token: string, expirationBuffer: number = 300000): boolean => {
  if (!token) {
    return true;
  }
  
  try {
    // Decodificar el token (la parte del payload que está en la posición 1)
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // JWT exp está en segundos, convertir a milisegundos
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    
    // Está expirado si el tiempo actual + buffer es mayor al tiempo de expiración
    return currentTime + expirationBuffer > expirationTime;
  } catch (error) {
    console.error("Error verificando expiración del token:", error);
    return true; // En caso de error, consideramos que el token está expirado
  }
};

export const login = async (credentials: AuthCredentials): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/signin', credentials);

    // Store the access token and supabase refresh token in localStorage
    if (response.data.accessToken && response.data.supabaseRefreshToken) {
      saveTokens(
        response.data.accessToken,
        response.data.supabaseRefreshToken
      );
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
      // Include other fields from SignupData if your API /auth/signup endpoint expects them
      // For example, if SignupData included 'name':
      // name: data.name, 
    };
    const response = await apiClient.post<AuthResponse>('/auth/signup', payload);

    // Store the access token and supabase refresh token in localStorage
    if (response.data.accessToken && response.data.supabaseRefreshToken) {
      saveTokens(
        response.data.accessToken,
        response.data.supabaseRefreshToken
      );
    }

    return response.data;
  } catch (error: any) {
    console.error("Signup API error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Signup failed');
  }
};

// Función para refrescar el token de acceso usando el refresh token
export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken(); // This gets 'refreshToken' from localStorage
  
  if (!refreshToken) {
    console.error("No refresh token available");
    return null;
  }

  try {
    // Crear una instancia de axios sin interceptores para evitar bucles infinitos
    const axiosInstance = apiClient.create({
      baseURL: apiClient.defaults.baseURL,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // El endpoint /auth/refresh-token espera { supabaseRefreshToken: "..." }
    const response = await axiosInstance.post<RefreshTokenResponse>('/auth/refresh-token', {
      supabaseRefreshToken: refreshToken 
    });

    if (response.data.token) {
      // Guardar el nuevo access token
      localStorage.setItem('authToken', response.data.token);
      // Actualizar el header de autorización
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      return response.data.token;
    }
    return null;
  } catch (error: any) {
    console.error("Error refreshing token:", error.response?.data || error.message);
    // Si hay error al refrescar, limpiamos ambos tokens
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    return null;
  }
};

// ==========================================
// FORGOT PASSWORD / RESET PASSWORD
// ==========================================

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

/**
 * Solicita un email de reset de contraseña
 */
export const forgotPassword = async (email: string): Promise<ForgotPasswordResponse> => {
  try {
    const response = await apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', { email });
    return response.data;
  } catch (error: any) {
    console.error("Forgot password API error:", error.response?.data || error.message);

    // Manejar rate limiting
    if (error.response?.status === 429) {
      throw new Error('Por favor espera antes de solicitar otro email de recuperación');
    }

    throw new Error(error.response?.data?.error || 'Error al enviar el email de recuperación');
  }
};

/**
 * Resetea la contraseña usando los tokens del email de reset
 */
export const resetPassword = async (
  accessToken: string,
  refreshToken: string,
  newPassword: string
): Promise<ResetPasswordResponse> => {
  try {
    const response = await apiClient.post<ResetPasswordResponse>('/auth/reset-password', {
      accessToken,
      refreshToken,
      newPassword,
    });
    return response.data;
  } catch (error: any) {
    console.error("Reset password API error:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      throw new Error('El enlace de recuperación ha expirado. Por favor solicita uno nuevo.');
    }

    throw new Error(error.response?.data?.error || 'Error al actualizar la contraseña');
  }
};
