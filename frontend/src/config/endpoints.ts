// Configuración de endpoints para los diferentes servicios
export const ENDPOINTS = {
  // Backend de Python (eventos, órdenes, tickets)
  BUSINESS: "http://127.0.0.1:8000",
  
  // Backend de Java (autenticación)
  AUTH: "http://127.0.0.1:8080/auth",
};

// Helper para construir URLs completas
export const getBusinessUrl = (path: string) => `${ENDPOINTS.BUSINESS}${path}`;
export const getAuthUrl = (path: string) => `${ENDPOINTS.AUTH}${path}`;