const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.godoclab.com/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('auth');
    if (!raw) return null;
    return (JSON.parse(raw) as { token?: string }).token ?? null;
  } catch {
    return null;
  }
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function base64ToBlob(b64: string, mime: string): Blob {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime || 'application/octet-stream' });
}

/** POST with FormData (file upload) — returns Blob */
export async function apiPostBlob(
  path: string,
  formData: FormData,
): Promise<Blob> {
  let res: Response;
  const url = `${API_BASE}${path}${path.includes('?') ? '&' : '?'}xhr=1`;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        ...authHeaders(),
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: formData,
      cache: 'no-store',
    });
  } catch {
    throw new Error(
      'Could not reach the processing server. Check that the API is running, then try again.',
    );
  }
  if (!res.ok) {
    const text = await res.text();
    try {
      const data = JSON.parse(text) as { message?: string };
      if (typeof data.message === 'string' && data.message.trim()) {
        throw new Error(data.message);
      }
    } catch (e) {
      if (e instanceof Error && e.message !== text) throw e;
    }
    throw new Error(text || `Server error ${res.status}`);
  }
  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  if (contentType.includes('application/json')) {
    const payload = (await res.json()) as { mime?: string; data?: string; message?: string };
    if (typeof payload.data === 'string' && payload.data.length > 0) {
      return base64ToBlob(payload.data, payload.mime || 'application/pdf');
    }
    throw new Error(payload.message || 'Empty result from server');
  }
  return res.blob();
}

/** POST JSON — returns parsed JSON */
export async function apiPost<T = unknown>(
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as Record<string, unknown>;
    const msg = (data.message as string) || `Error ${res.status}`;
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

/** GET — returns parsed JSON */
export async function apiGet<T = unknown>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as Record<string, unknown>;
    const msg = (data.message as string) || `Error ${res.status}`;
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

/** Save a processed file blob to S3 + DB — fire and forget, never throws */
export async function saveConversion(
  blob: Blob,
  toolSlug: string,
  outputFileName: string,
  originalFileName: string,
): Promise<void> {
  const token = getToken();
  if (!token) return; // not logged in — skip
  try {
    const fd = new FormData();
    fd.append('file', blob, outputFileName);
    fd.append('toolSlug', toolSlug);
    fd.append('outputFileName', outputFileName);
    fd.append('originalFileName', originalFileName);
    await fetch(`${API_BASE}/conversions/save`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
  } catch {
    // never block the user's download
  }
}

/** DELETE — returns parsed JSON */
export async function apiDelete<T = unknown>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json() as Promise<T>;
}
