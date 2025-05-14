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

export interface RefreshTokenResponse {
  token: string;
}

// Función para guardar tokens en localStorage
const saveTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('authToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
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

    // Store the access token in localStorage
    if (response.data.session?.access_token) {
      saveTokens(
        response.data.session.access_token,
        response.data.session.refresh_token
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
    };
    const response = await apiClient.post<AuthResponse>('/auth/signup', payload);

    // Store the access token in localStorage
    if (response.data.session?.access_token) {
      saveTokens(
        response.data.session.access_token,
        response.data.session.refresh_token
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
  const refreshToken = getRefreshToken();
  
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

    const response = await axiosInstance.post<RefreshTokenResponse>('/auth/refresh-token', {
      token: refreshToken
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
