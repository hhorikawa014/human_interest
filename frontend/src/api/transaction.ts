import { api } from "./client";

export type Transaction = {
  id: number;
  account_id: number;
  card_id: number | null;
  amount_cents: number;
  merchant: string;
  mcc: string;
  is_approved: boolean;
  rejection_reason: string | null;
  created_at: string;
};

export async function createTransaction(
  accountId: number,
  card_id: number,
  merchant: string,
  mcc: string,
  amount_cents: number
): Promise<Transaction> {
  const { data } = await api.post(`/accounts/${accountId}/transactions`, {
    card_id,
    merchant,
    mcc,
    amount_cents,
  });
  return data;
}

export async function listTransactions(accountId: number): Promise<Transaction[]> {
  const { data } = await api.get(`/accounts/${accountId}/transactions`);
  return data;
}
