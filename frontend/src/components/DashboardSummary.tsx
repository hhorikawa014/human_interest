import { useEffect, useState } from "react";
import { getAccount, type Account } from "../api/account";
import { listCards, type Card } from "../api/card";
import { listTransactions, type Transaction } from "../api/transaction";

export default function DashboardSummary({
  accountId,
  refreshKey,
}: {
  accountId: number;
  refreshKey: number;
}) {
  const [account, setAccount] = useState<Account | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    (async () => {
      const acc = await getAccount(accountId);
      setAccount(acc);
      const cs = await listCards(accountId);
      setCards(cs);
      const txs = await listTransactions(accountId);
      setTransactions(txs.slice(0, 10));
    })();
  }, [accountId, refreshKey]);

  const balance = account?.balance_cents ?? 0;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Account Balance</h2>
        <p className="text-2xl font-bold text-indigo-600 mt-2">
          ${Number.isFinite(balance) ? (balance / 100).toFixed(2) : "0.00"}
        </p>
        {account?.name && account?.email && (
          <p className="text-xs text-gray-500 mt-1">{account.name} · {account.email}</p>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800">Cards</h2>
        {cards.length === 0 ? (
          <p className="text-sm text-gray-500 mt-1">No cards issued yet</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {cards.map((card) => (
              <li key={card.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <span className="text-sm text-gray-700">•••• {card.last4_digits}</span>
                {card.is_active ? (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">Active</span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">Inactive</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
        <ul className="mt-2 space-y-2">
          {transactions.length === 0 && <li className="text-sm text-gray-500">No transactions yet</li>}
          {transactions.map((tx) => (
            <li key={tx.id} className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <span className="text-sm font-medium text-gray-700">
                {tx.merchant} — ${(tx.amount_cents / 100).toFixed(2)} (MCC {tx.mcc})
              </span>
              {tx.is_approved ? (
                <span className="text-xs font-medium text-green-600">Approved</span>
              ) : (
                <span className="text-xs font-medium text-red-600">Declined{tx.rejection_reason ? ` (${tx.rejection_reason})` : ""}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
