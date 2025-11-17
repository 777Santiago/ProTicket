import { ENDPOINTS } from '../config/endpoints';

export interface RegisterRequest {
  email: string;
  password: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  role: string;
}

export interface AuthErrorResponse {
  error: string;
}

async function authRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${ENDPOINTS.AUTH}${endpoint}`;
  
  console.log(`[AUTH] ${options.method || 'POST'} ${url}`);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log(`[AUTH] Response status: ${response.status}`);

    // Intentar parsear como JSON
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      // Intentar parsear el texto como JSON
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text };
      }
    }

    console.log(`[AUTH] Response data:`, data);

    if (!response.ok) {
      // Extraer el mensaje de error limpio
      let errorMessage = "Error al procesar la solicitud";
      
      if (typeof data === 'string') {
        errorMessage = data;
      } else if (data && data.error) {
        errorMessage = data.error;
      } else if (data && data.message) {
        errorMessage = data.message;
      } else if (data && data.detail) {
        errorMessage = data.detail;
      }
      
      throw new Error(errorMessage);
    }

    return data;
  } catch (error: any) {
    console.error(`[AUTH] Request error:`, error);
    
    // Si el error ya tiene un mensaje, usarlo
    if (error.message && !error.message.includes('Failed to fetch')) {
      throw error;
    }
    
    // Error de red
    throw new Error('Error de conexión con el servidor');
  }
}

export const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    return await authRequest<AuthResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return await authRequest<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};