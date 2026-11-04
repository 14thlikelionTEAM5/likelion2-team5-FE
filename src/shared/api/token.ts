const KEY = 'accessToken';

export const getToken = () => localStorage.getItem(KEY);
export const hasToken = () => !!getToken();
export const saveToken = (token: string) => localStorage.setItem(KEY, token);
export const clearToken = () => localStorage.removeItem(KEY);
