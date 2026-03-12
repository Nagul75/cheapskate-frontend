import api from "@/lib/axiosInstance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

export const accountTypeSchema = z.enum(["CHECKING", "SAVINGS", "CREDIT"]);

export type AccountType = z.infer<typeof accountTypeSchema>;

export const createAccountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  type: accountTypeSchema,
  balance: z.number().min(0, "Balance must be non-negative"),
  currency: z.string().min(1, "Currency is required"),
});

export const updateAccountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  type: accountTypeSchema,
  currency: z.string().min(1, "Currency is required"),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

export type Account = {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
};

export type AccountsResponse = {
  accounts: Account[];
};

export const accountsApi = {
  list: async (): Promise<AccountsResponse> => {
    const { data } = await api.get<AccountsResponse>("/api/accounts");
    return data;
  },
  create: async (body: CreateAccountInput): Promise<Account> => {
    const { data } = await api.post<{ account: Account }>("/api/accounts", body);
    return data.account;
  },
  update: async (id: string, body: UpdateAccountInput): Promise<Account> => {
    const { data } = await api.put<{ account: Account }>(`/api/accounts/${id}`, body);
    return data.account;
  },
  delete: async (id: string): Promise<Account> => {
    const { data } = await api.delete<{ deleted: Account }>(`/api/accounts/${id}`);
    return data.deleted;
  },
};

export const useAccounts = () => {
  return useQuery<AccountsResponse, Error>({
    queryKey: ["accounts"],
    queryFn: accountsApi.list,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  return useMutation<Account, Error, CreateAccountInput>({
    mutationFn: accountsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();
  return useMutation<Account, Error, { id: string; data: UpdateAccountInput }>({
    mutationFn: ({ id, data }) => accountsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  return useMutation<Account, Error, string>({
    mutationFn: accountsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};

