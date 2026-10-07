const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export class ApiError extends Error {
  public status: number;
  public code?: string;
  public details?: unknown;

  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

export async function fetcher<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { requireAuth, headers: customHeaders, ...restOptions } = options;
  const headers = new Headers(customHeaders);

  // Aseguramos que siempre envíe JSON si hay un body y no se definió otro content-type
  if (restOptions.body && !headers.has('Content-Type') && !(restOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const isAdminEndpoint = endpoint.startsWith('/admin');
  const shouldAttachAuth = requireAuth || isAdminEndpoint;

  // Si requiere auth o es ruta admin, extraemos el token de localStorage
  if (shouldAttachAuth && typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers,
    cache: 'no-store', // Deshabilita el caché agresivo de Next.js
    ...restOptions,
  });

  if (!response.ok) {
    let errorMessage = 'Error en la petición';
    let errorCode: string | undefined = undefined;
    let errorDetails: unknown = undefined;

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
      errorCode = errorData.code;
      errorDetails = errorData.details;
    } catch {
      // Ignorar si no es JSON
    }

    // T-021: Manejo global de 401/403 para rutas que requieren auth o panel administrativo
    if ((response.status === 401 || response.status === 403) && shouldAttachAuth) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        }
      }
    }

    throw new ApiError(response.status, errorMessage, errorCode, errorDetails);
  }

  // Si es un 204 No Content, no intentamos parsear JSON
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
