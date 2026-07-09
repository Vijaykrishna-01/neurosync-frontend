// src/lib/api/client.ts

import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL, API_ENDPOINTS, AUTH_TOKEN_KEY } from '@/constants';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: Array<{
    onSuccess: (token: string) => void;
    onFailure: (error: any) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true, // ✅ sends httpOnly refresh cookie automatically on every request
    });

    this.setupInterceptors();
  }

  private subscribeToRefresh(cb: {
    onSuccess: (token: string) => void;
    onFailure: (error: any) => void;
  }) {
    this.refreshSubscribers.push(cb);
  }

  private notifyRefreshSubscribers(token: string) {
    this.refreshSubscribers.forEach((subscriber) => subscriber.onSuccess(token));
    this.refreshSubscribers = [];
  }

  private notifyRefreshFailure(error: any) {
    this.refreshSubscribers.forEach((subscriber) => subscriber.onFailure(error));
    this.refreshSubscribers = [];
  }

  private setupInterceptors() {
    // ── Request: attach access token from localStorage ──────────────────────
    // The refresh token cookie is httpOnly — browser attaches it automatically.
    // We only manually attach the access token as a Bearer header.
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // ── Response: handle 401 with silent token refresh ──────────────────────
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;
        const requestUrl = originalRequest?.url ?? '';
        const isRefreshRequest = requestUrl.includes(API_ENDPOINTS.REFRESH_TOKEN);

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          if (isRefreshRequest) {
            localStorage.removeItem(AUTH_TOKEN_KEY);
            document.cookie = `${AUTH_TOKEN_KEY}=; path=/; max-age=0`;
            window.location.href = '/login';
            return Promise.reject(error);
          }

          // If a refresh is already in flight, queue this request
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.subscribeToRefresh({
                onSuccess: (newToken) => {
                  originalRequest.headers.Authorization = `Bearer ${newToken}`;
                  resolve(this.client(originalRequest));
                },
                onFailure: reject,
              });
            });
          }

          this.isRefreshing = true;

          try {
            // ✅ POST with no body. withCredentials:true sends the httpOnly
            // neurosync_refresh_token cookie automatically.
            const response = await this.client.post<{ accessToken: string }>(
              API_ENDPOINTS.REFRESH_TOKEN
            );

            const { accessToken } = response.data;
            localStorage.setItem(AUTH_TOKEN_KEY, accessToken);

            document.cookie = `${AUTH_TOKEN_KEY}=${accessToken}; path=/; SameSite=Strict; max-age=${60 * 60 * 24}${
              process.env.NODE_ENV === 'production' ? '; Secure' : ''
            }`;

            this.notifyRefreshSubscribers(accessToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.notifyRefreshFailure(refreshError);
            localStorage.removeItem(AUTH_TOKEN_KEY);
            document.cookie = `${AUTH_TOKEN_KEY}=; path=/; max-age=0`;
            window.location.href = '/login';
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  public getClient(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient().getClient();