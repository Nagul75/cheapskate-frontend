import api from "@/lib/axiosInstance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().email("Invalid email format").max(255, "Email must be less than 255 characters"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters").max(100, "Password must be less than 100 characters"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export const settingsApi = {
  changePassword: async (body: ChangePasswordInput): Promise<{ message: string }> => {
    const { data } = await api.post<{ message: string }>("/api/account/change-password", body);
    return data;
  },
};

export const useChangePassword = () => {
  return useMutation<{ message: string }, Error, ChangePasswordInput>({
    mutationFn: settingsApi.changePassword,
  });
};
