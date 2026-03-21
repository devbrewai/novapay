export type TransactionCategory =
  | "food"
  | "transport"
  | "shopping"
  | "entertainment"
  | "bills"
  | "income"
  | "transfer"
  | "health"
  | "travel"
  | "subscriptions";

export type TransactionStatus = "completed" | "pending" | "failed";

export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  category: TransactionCategory;
  amount: number;
  status: TransactionStatus;
  description: string;
}
