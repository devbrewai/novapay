export interface Card {
  type: "Virtual" | "Physical";
  last4: string;
  status: "Active" | "Frozen" | "Cancelled";
}

export interface Account {
  id: string;
  name: string;
  email: string;
  accountNumber: string;
  tier: "Premium" | "Standard";
  balance: number;
  currency: string;
  monthlyChange: number;
  joinDate: string;
  cards: Card[];
}
