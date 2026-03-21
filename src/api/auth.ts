import axios from "axios";
import { tokenStore } from "@/lib/tokens";
import api from "@/lib/axiosInstance";

export const authApi = {
    register: async (body: {name: string; email: string;password: string}) => {
        const {data} = await api.post('/auth/register', body);
        return data;
    },

    login: async (body: {email: string; password: string}) => {
        const {data} = await api.post('/auth/login', body);
        tokenStore.set(data.accessToken);
        return data;
    },

    logout: async () => {
        await api.post('/auth/logout');
        tokenStore.clear();
        window.location.href = '/';
    },

    refreshSession: async (): Promise<boolean> => {
        try {
            const {data} = await axios.post(
                'https://api.cheapskate.in/auth/refresh',
                {},
                {withCredentials: true}
            )
            tokenStore.set(data.accessToken);
            return true;
        } catch {
            return false;
        }
    },

    getMe: async() => {
        const res = await api.get("/auth/me");
        return res.data;
    }
}