import api from './axiosClient';
import type { LoginRequest, RegisterRequest, TokenResponse } from '../types/auth';

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<TokenResponse>('/auth/login', data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    api.post<TokenResponse>('/auth/register', data).then((r) => r.data),

  logout: () =>
    api.post('/auth/logout').then((r) => r.data),

  me: () =>
    api.get<TokenResponse['user']>('/auth/me').then((r) => r.data),
};
