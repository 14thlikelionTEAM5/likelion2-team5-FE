import { clearToken, getToken } from './token';

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/v1`;

type ApiResponse<T> = {
  code: string;
  message: string;
  data: T;
  errors: unknown;
  timestamp: string;
};

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public errors?: unknown,
  ) {
    super(message);
  }
}

type Options = Omit<RequestInit, 'body'> & { body?: unknown };

export async function api<T>(path: string, { body, headers, ...init }: Options = {}): Promise<T> {
  const token = getToken();

  const res = await fetch(BASE_URL + path, {
    ...init,
    headers: {
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;

  if (!res.ok) {
    // 로그인 실패(401)는 이동하지 않음
    if (res.status === 401 && !path.startsWith('/auth/')) {
      clearToken();
      window.location.replace('/login');
    }
    throw new ApiError(
      res.status,
      json?.code ?? `E${res.status}`,
      json?.message ?? '요청에 실패했어요.',
      json?.errors,
    );
  }

  return json?.data as T;
}
