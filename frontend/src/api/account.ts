import { api } from "./client";

export type Account = {
  id: number;
  email: string;
  name: string;
  balance_cents: number;
  created_at: string;
};

export async function createAccount(email: string, name: string): Promise<Account> {
  const { data } = await api.post("/accounts", { email, name });
  return data;
}

export async function getAccount(id: number): Promise<Account> {
  const { data } = await api.get(`/accounts/${id}`);
  return data;
}

export async function deposit(id: number, amount_cents: number): Promise<Account> {
  const { data } = await api.post(`/accounts/${id}/deposit`, { amount_cents });
  return data;
}
