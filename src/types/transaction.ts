import { z } from "zod";

export const transactionTypeEnum = z.enum(["INCOME", "EXPENSE"]);

export const transactionSchema = z.object({
  id: z.string().optional(), // not required when creating
  accountId: z.string().min(1, "Account is required"),
  categoryId: z.string().min(1, "Category is required"),
  amount: z
    .positive("Amount must be greater than 0"),
  type: transactionTypeEnum,
  description: z.string().optional().nullable(),
  date: z.date(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;

export type ApiTransaction = {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  amount: string; // note: backend returns string
  type: "INCOME" | "EXPENSE";
  description: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    type: "INCOME" | "EXPENSE";
    color: string;
    icon: string;
    isDefault: boolean;
  };
  account: {
    id: string;
    name: string;
    type: string;
    balance: string;
    currency: string;
  };
};