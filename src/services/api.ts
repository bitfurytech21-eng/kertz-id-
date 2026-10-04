export function setAuthToken(token: string | null) {
  cachedToken = token;
  try {
    if (token) {
      localStorage.setItem('kretz_auth_token', token);
    } else {
      localStorage.removeItem('kretz_auth_token');
    }
  } catch {
    // Ignore storage access issues in restricted browsers or private mode.
  }
}

export function getAuthToken(): string | null {
  return cachedToken;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('X-Requested-With', 'XMLHttpRequest');

  if (cachedToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${cachedToken}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMessage = 'An error occurred during request.';
    try {
      const errorJson = await res.json();
      errorMessage = errorJson.error || errorJson.message || errorMessage;
    } catch {
      try {
        const text = await res.text();
        errorMessage = text || errorMessage;
      } catch {
        errorMessage = 'Request failed';
      }
    }
    throw new Error(errorMessage || `Request failed with status ${res.status}`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (res.status === 204 || !contentType.includes('application/json')) {
    return undefined as T;
  }

  try {
    return (await res.json()) as T;
  } catch {
    return undefined as T;
  }
}
