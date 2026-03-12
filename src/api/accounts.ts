import api from "@/lib/axiosInstance";
import { useQuery } from "@tanstack/react-query";

export type AccountType = "CHECKING" | "SAVINGS" | "CREDIT" | "CASH" | string;

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
};

export const useAccounts = () => {
  return useQuery<AccountsResponse, Error>({
    queryKey: ["accounts"],
    queryFn: accountsApi.list,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

