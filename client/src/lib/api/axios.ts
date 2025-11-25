import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { refreshAccessToken } from './authService';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Usa la variable de entorno o el valor por defecto
  headers: {
    'Content-Type': 'application/json',
  },
  // You might want to add withCredentials: true if you use cookies for sessions
  // withCredentials: true, 
});

// Add a request interceptor to include the auth token in headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request error here
    return Promise.reject(error);
  }
);

// Variable para controlar si ya estamos refrescando el token (evitar múltiples refrescos simultáneos)
let isRefreshing = false;
// Cola de peticiones fallidas para reintentar después del refresh
let failedRequestsQueue: {
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
  config: AxiosRequestConfig;
}[] = [];

// Función para procesar la cola de peticiones fallidas
const processQueue = (error: any, token: string | null = null) => {
  failedRequestsQueue.forEach(request => {
    if (error) {
      request.reject(error);
    } else if (token) {
      request.config.headers = {
        ...request.config.headers,
        Authorization: `Bearer ${token}`
      };
      apiClient(request.config).then(response => {
        request.resolve(response);
      }).catch(err => {
        request.reject(err);
      });
    }
  });
  
  // Limpiamos la cola después de procesarla
  failedRequestsQueue = [];
};

// Add a response interceptor to handle 401 errors globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Extraemos la configuración original de la petición
    const originalRequest = error.config;
    
    // Si es un error 401 (no autorizado) y no hemos intentado refrescar para esta petición
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // Marcamos que esta petición ya intentó refrescarse una vez
      originalRequest._retry = true;
      
      // Si ya estamos refrescando, ponemos esta petición en cola
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            resolve,
            reject,
            config: originalRequest
          });
        });
      }
      
      // Marcamos que estamos iniciando el proceso de refrescado
      isRefreshing = true;
      
      try {
        // Intentamos refrescar el token
        const newToken = await refreshAccessToken();
        
        // Si obtuvimos un nuevo token, actualizamos la petición y la reintentamos
        if (newToken) {
          // Actualizamos el token en las cabeceras de la petición original
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          // Procesamos cualquier petición en cola
          processQueue(null, newToken);
          
          // Reintentamos la petición original con el nuevo token
          return apiClient(originalRequest);
        } else {
          // Si no pudimos obtener un nuevo token, procesamos la cola con error
          processQueue(new Error('Could not refresh token'));
          
          // Limpiamos tokens y preparamos redirección
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          
          // Verificamos que no estemos ya en login o en proceso de registro para evitar redirecciones circulares
          const currentPath = window.location.pathname;
          if (currentPath !== '/login' && !currentPath.startsWith('/register')) {
            console.log("Sesión expirada. Redirigiendo a login...");
            window.location.href = '/login';
          }
          
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // En caso de error durante el refresh, procesamos la cola con error
        processQueue(refreshError);
        
        // Limpiamos tokens y preparamos redirección
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        
        // Verificamos que no estemos ya en login o en proceso de registro para evitar redirecciones circulares
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && !currentPath.startsWith('/register')) {
          console.log("Sesión expirada. Redirigiendo a login...");
          window.location.href = '/login';
        }
        
        return Promise.reject(error);
      } finally {
        // Sea cual sea el resultado, marcamos que ya no estamos refrescando
        isRefreshing = false;
      }
    }
    
    // Si no es un 401 o ya intentamos refrescar, simplemente propagamos el error
    return Promise.reject(error);
  }
);

export default apiClient;
