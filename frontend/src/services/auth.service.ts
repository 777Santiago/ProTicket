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
  
  if (options.body) {
    console.log(`[AUTH] Request body:`, JSON.parse(options.body as string));
  }
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  console.log(`[AUTH] Response status: ${response.status}`);

  if (!response.ok) {
    // Intentar parsear el error como JSON
    try {
      const errorData: AuthErrorResponse = await response.json();
      console.error(`[AUTH] Error response:`, errorData);
      throw new Error(errorData.error || `Error ${response.status}`);
    } catch (parseError) {
      // Si no se puede parsear, usar mensaje genérico
      const errorText = await response.text();
      console.error(`[AUTH] Error response (text):`, errorText);
      throw new Error(errorText || `Error ${response.status}`);
    }
  }

  const data = await response.json();
  console.log(`[AUTH] Response data:`, data);
  return data;
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