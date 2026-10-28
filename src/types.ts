export interface Earning {
  id?: string;
  client: string;
  project: string;
  amount: number;
  date: string;
  status: "Paid" | "Pending" | "Overdue";
  paymentMethod: string;
  invoiceRef: string;
  createdAt?: string;
}

export interface Expense {
  id?: string;
  title: string;
  amount: number;
  category: "SaaS/AI Subscriptions" | "Domain & Hosting" | "Hardware/Equipment" | "Marketing" | "Misc";
  date: string;
  isSubscription: boolean;
  renewalDate?: string; // Optional renewal date for subscriptions
  createdAt?: string;
}

export interface FinancialContext {
  totalEarnings: number;
  mrr: number;
  totalExpenses: number;
  netRevenue: number;
  ytdEarnings: number;
  unpaidInvoicesCount: number;
  overdueInvoicesCount: number;
  upcomingRenewals: Expense[];
  recentEarnings: Earning[];
  recentExpenses: Expense[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
}
