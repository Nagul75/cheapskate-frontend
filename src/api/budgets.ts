import api from "@/lib/axiosInstance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

export const createBudgetSchema = z.object({
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  accountId: z.string().min(1, "Account is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  month: z.number().min(1, "Month must be between 1 and 12").max(12, "Month must be between 1 and 12"),
  year: z.number().min(2000, "Year must be valid").max(2100, "Year must be valid"),
}).refine((data) => {
    return !!data.categoryId && !!data.accountId && !!data.month && !!data.year && data.amount > 0;
  }, {
    message: "Amount, Account, Category and time required",
    path: ["categoryId", "accountId", "month", "year", "amount"],
  });

export const updateBudgetSchema = z.object({
  description: z.string().optional(),
  categoryId: z.string().nullable().optional(),
  accountId: z.string().min(1, "Account is required").optional(),
  amount: z.number().positive("Amount must be greater than 0").optional(),
  month: z.number().min(1, "Month must be between 1 and 12").max(12, "Month must be between 1 and 12").optional(),
  year: z.number().min(2000, "Year must be valid").max(2100, "Year must be valid").optional(),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;

export type Budget = {
  id: string;
  userId: string;
  accountId: string;
  description: string | null;
  categoryId: string | null;
  amount: string;
  month: number;
  year: number;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    color: string;
    icon: string;
    type: string;
  } | null;
  spent?: number;
  remaining?: number;
  progress?: number;
  account?: {
    name: string;
    currency: string;
  } | null;
};

export type BudgetsResponse = {
  budgets: Budget[];
};

export const budgetsApi = {
  list: async (filters?: { month?: number; year?: number }): Promise<BudgetsResponse> => {
    const { data } = await api.get<BudgetsResponse>("/api/budgets", {
      params: filters,
    });
    return data;
  },
  create: async (body: CreateBudgetInput): Promise<Budget> => {
    console.log("API request body:", body);
    console.log("Request data type:", typeof body);
    
    // Map frontend field names to backend expectations
    const mappedBody = {
      description: body.description,
      categoryId: body.categoryId, // Map categoryId to category_id
      accountId: body.accountId,   // Map accountId to account_id
      amount: body.amount,
      month: body.month,
      year: body.year,
    };
    
    console.log("Mapped request body:", mappedBody);
    
    const { data } = await api.post<{ budget: Budget }>("/api/budgets", mappedBody);
    return data.budget;
  },
  update: async (id: string, body: UpdateBudgetInput): Promise<Budget> => {
    const { data } = await api.put<{ updated: Budget }>(`/api/budgets/${id}`, body);
    return data.updated;
  },
  delete: async (id: string): Promise<Budget> => {
    const { data } = await api.delete<{ deleted: Budget }>(`/api/budgets/${id}`);
    return data.deleted;
  },
};

export const useBudgets = (filters?: { month?: number; year?: number, accountId?: string }) => {
  return useQuery<BudgetsResponse, Error>({
    queryKey: ["budgets", filters],
    queryFn: () => budgetsApi.list(filters),
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation<Budget, Error, CreateBudgetInput>({
    mutationFn: budgetsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
    onError: (error) => {
      console.error("Create budget error:", error);
      console.error("Error details:", error);
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation<Budget, Error, { id: string; data: UpdateBudgetInput }>({
    mutationFn: ({ id, data }) => budgetsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();
  return useMutation<Budget, Error, string>({
    mutationFn: budgetsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};
