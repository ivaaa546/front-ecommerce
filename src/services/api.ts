const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

export async function fetcher<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { requireAuth, headers: customHeaders, ...restOptions } = options;
  const headers = new Headers(customHeaders);

  // Aseguramos que siempre envíe JSON si hay un body y no se definió otro content-type
  if (restOptions.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Si requiere auth, tratamos de sacar el token (solo en client-side por simplicidad inicial del MVP)
  if (requireAuth && typeof window !== 'undefined') {
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
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Ignorar si no es JSON
    }
    throw new Error(errorMessage);
  }

  // Si es un 204 No Content, no intentamos parsear JSON
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
