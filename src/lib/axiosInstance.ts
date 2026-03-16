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
let refreshPromise: Promise<string> | null = null;

let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

function doRefresh(): Promise<string> {
  if (refreshPromise) return refreshPromise; // same promise returned to all concurrent callers

  refreshPromise = axios
    .post<{ accessToken: string }>(
      "http://localhost:3000/auth/refresh",
      {},
      { withCredentials: true },
    )
    .then(({ data }) => {
      tokenStore.set(data.accessToken);
      processQueue(null, data.accessToken);
      return data.accessToken;
    })
    .catch((err) => {
      processQueue(err, null);
      tokenStore.clear();
      window.location.href = "/login";
      throw err;
    })
    .finally(() => {
      refreshPromise = null; // clear so future refreshes can happen
    });

  return refreshPromise;
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config as AxiosRequestConfig & { _retry?: boolean };

    if (
      err.response?.status !== 401 ||
      original._retry ||
      original.url === "/auth/refresh" ||
      original.url === "/auth/login" 
    ) {
      return Promise.reject(err);
    }

    original._retry = true;

    try {
      const token = await doRefresh();
      original.headers = {
        ...original.headers,
        Authorization: `Bearer ${token}`,
      };
      return api(original);
    } catch (refreshErr) {
      return Promise.reject(refreshErr);
    }
  },
);

export default api;