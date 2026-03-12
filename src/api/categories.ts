import api from "@/lib/axiosInstance";
import { useQuery } from "@tanstack/react-query";

export type CategoryType = "INCOME" | "EXPENSE";

export type Category = {
  id: string;
  userId: string | null;
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CategoriesResponse = {
  default: Category[];
  custom: Category[];
};

export const categoriesApi = {
  list: async (): Promise<CategoriesResponse> => {
    const { data } = await api.get<CategoriesResponse>("/api/categories");
    return data;
  },
};

export const useCategories = () => {
  return useQuery<CategoriesResponse, Error>({
    queryKey: ["categories"],
    queryFn: categoriesApi.list,
  });
};

