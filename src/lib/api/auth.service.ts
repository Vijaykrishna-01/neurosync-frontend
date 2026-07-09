// src/lib/api/auth.service.ts

import { API_ENDPOINTS } from '@/constants';
import { LoginRequest, SignupRequest, AuthResponse } from '@/types/auth';
import { apiClient } from './client';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.LOGIN,
      credentials
    );
    return response.data;
  },

  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.SIGNUP,
      data
    );
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.LOGOUT);
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await apiClient.post<{ accessToken: string }>(
      API_ENDPOINTS.REFRESH_TOKEN,
      { refreshToken }
    );
    return response.data;
  },

  async getCurrentUser(): Promise<AuthResponse> {
    const response = await apiClient.get<AuthResponse>(API_ENDPOINTS.ME);
    return response.data;
  },
};