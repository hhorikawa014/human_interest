import { api } from "./client";

export type Card = {
  id: number;
  account_id: number;
  card_number: string;
  last4_digits: string;
  token: string;
  is_active: boolean;
  created_at: string;
};

export async function issueCard(accountId: number): Promise<Card> {
  const { data } = await api.post(`/accounts/${accountId}/cards`, {});
  return data;
}

export async function listCards(accountId: number): Promise<Card[]> {
  const { data } = await api.get(`/accounts/${accountId}/cards`);
  return data;
}
