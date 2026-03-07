import axios, { type AxiosRequestConfig } from "axios";
import { tokenStore } from "./tokens";

const api = axios.create({
  baseURL: "http://localhost:3000/",
  withCredentials: true,
});

// Attach access token from memory
api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Refresh flow
let refreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config as AxiosRequestConfig & { _retry?: boolean };

    if (
      err.response?.status !== 401 ||
      original._retry ||
      original.url === "/auth/refresh"
    ) {
      return Promise.reject(err);
    }

    if (refreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers = {
          ...original.headers,
          Authorization: `Bearer ${token}`,
        };
        return api(original);
      });
    }

    original._retry = true;
    refreshing = true;

    try {
      const { data } = await axios.post(
        "http://localhost:3000/auth/refresh",
        {},
        { withCredentials: true },
      );

      tokenStore.set(data.accessToken);
      processQueue(null, data.accessToken);
      original.headers = {
        ...original.headers,
        Authorization: `Bearer ${data.accessToken}`,
      };
      return api(original);
    } catch (err) {
      processQueue(err, null);
      tokenStore.clear();
      window.location.href = "/login";
      return Promise.reject(err);
    } finally {
      refreshing = false;
    }
  },
);

export default api;
