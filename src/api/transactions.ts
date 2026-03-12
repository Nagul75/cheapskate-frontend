import api from "@/lib/axiosInstance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type TransactionType = "INCOME" | "EXPENSE";

export type TransactionCategory = {
  id: string;
  userId: string | null;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TransactionAccount = {
  id: string;
  userId: string;
  name: string;
  type: string;
  balance: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
};

export type Transaction = {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  amount: string;
  type: TransactionType;
  description: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
  category: TransactionCategory | null;
  account: TransactionAccount | null;
};

export type TransactionsFilters = {
  accountId?: string;
  categoryId?: string;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
};

export const transactionsApi = {
  list: async (filters: TransactionsFilters = {}): Promise<Transaction[]> => {
    const { data } = await api.get<{ transactions: Transaction[] }>(
      "/api/transactions",
      { params: filters },
    );
    return data.transactions;
  },
  create: async (body: {
    accountId: string;
    categoryId: string;
    amount: number;
    type: TransactionType;
    description?: string;
    date: string;
  }): Promise<Transaction> => {
    const { data } = await api.post<{ transaction: Transaction }>(
      "/api/transactions",
      body,
    );
    return data.transaction;
  },
  update: async (id: string, body: Partial<{
    accountId: string;
    categoryId: string;
    amount: number;
    type: TransactionType;
    description?: string | null;
    date: string;
  }>): Promise<Transaction> => {
    const { data } = await api.put<{ transaction: Transaction }>(
      `/api/transactions/${id}`,
      body,
    );
    return data.transaction;
  },
  remove: async (id: string): Promise<Transaction> => {
    const { data } = await api.delete<{ transaction: Transaction }>(
      `/api/transactions/${id}`,
    );
    return data.transaction;
  },
};

export const useTransactions = (filters: TransactionsFilters) => {
  return useQuery<Transaction[], Error>({
    queryKey: ["transactions", filters],
    queryFn: () => transactionsApi.list(filters),
  });
};

type CreatePayload = {
  accountId: string;
  categoryId: string;
  amount: number;
  type: TransactionType;
  description?: string;
  date: Date;
};

type UpdatePayload = {
  id: string;
  accountId: string;
  categoryId: string;
  amount: number;
  type: TransactionType;
  description?: string | null;
  date: Date;
};

export const useCreateTransaction = (filters: TransactionsFilters) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePayload) =>
      transactionsApi.create({
        ...payload,
        date: payload.date.toISOString(),
      }),
    onMutate: async (values) => {
      await queryClient.cancelQueries({ queryKey: ["transactions", filters] });
      const prev = queryClient.getQueryData<Transaction[]>([
        "transactions",
        filters,
      ]);

      const optimistic: Transaction = {
        id: crypto.randomUUID(),
        userId: "optimistic",
        accountId: values.accountId,
        categoryId: values.categoryId,
        amount: String(values.amount),
        type: values.type,
        description: values.description ?? null,
        date: values.date.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: null,
        account: null,
      };

      queryClient.setQueryData<Transaction[]>(
        ["transactions", filters],
        (old = []) => [optimistic, ...old],
      );

      return { prev };
    },
    onError: (_err, _values, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(["transactions", filters], ctx.prev);
      }
    },
    onSuccess: (created, _values, _ctx) => {
      queryClient.setQueryData<Transaction[]>(
        ["transactions", filters],
        (old = []) => {
          const withoutOptimistic = old.filter((t) => t.userId !== "optimistic");
          return [created, ...withoutOptimistic];
        },
      );
    },
  });
};

export const useUpdateTransaction = (filters: TransactionsFilters) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdatePayload) =>
      transactionsApi.update(payload.id, {
        accountId: payload.accountId,
        categoryId: payload.categoryId,
        amount: payload.amount,
        type: payload.type,
        description: payload.description,
        date: payload.date.toISOString(),
      }),
    onMutate: async (values) => {
      await queryClient.cancelQueries({ queryKey: ["transactions", filters] });
      const prev = queryClient.getQueryData<Transaction[]>([
        "transactions",
        filters,
      ]);

      queryClient.setQueryData<Transaction[]>(
        ["transactions", filters],
        (old = []) =>
          old.map((t) =>
            t.id === values.id
              ? {
                  ...t,
                  accountId: values.accountId,
                  categoryId: values.categoryId,
                  amount: String(values.amount),
                  type: values.type,
                  description: values.description ?? null,
                  date: values.date.toISOString(),
                }
              : t,
          ),
      );

      return { prev };
    },
    onError: (_err, _values, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(["transactions", filters], ctx.prev);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", filters] });
    },
  });
};

export const useDeleteTransaction = (filters: TransactionsFilters) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => transactionsApi.remove(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["transactions", filters] });
      const prev = queryClient.getQueryData<Transaction[]>([
        "transactions",
        filters,
      ]);

      queryClient.setQueryData<Transaction[]>(
        ["transactions", filters],
        (old = []) => old.filter((t) => t.id !== id),
      );

      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(["transactions", filters], ctx.prev);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", filters] });
    },
  });
};

