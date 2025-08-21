import { useEffect, useState } from "react";
import { listCards } from "../api/card";
import { createTransaction, type Transaction } from "../api/transaction";

type CardOption = { id: number; last4: string };

export default function TransactionForm({
  accountId,
  refreshKey,
  onTransaction,
}: {
  accountId: number;
  refreshKey: number;
  onTransaction: () => void;
}) {
  const [merchant, setMerchant] = useState("");
  const [mcc, setMcc] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [cards, setCards] = useState<CardOption[]>([]);
  const [cardId, setCardId] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Transaction | null>(null);

  useEffect(() => {
    (async () => {
      const list = await listCards(accountId);
      setCards(list.map((c) => ({ id: c.id, last4: c.last4_digits })));
    })();
  }, [accountId, refreshKey]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (/^\d*(\.\d{0,2})?$/.test(v) || v === "") {
      setAmount(v);
      setError(null);
    }
  };

  const handleMccChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 4);
    setMcc(v);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (cardId === "") return setError("Please select a card.");
    if (!merchant.trim()) return setError("Please enter a merchant name.");
    if (mcc.length !== 4) return setError("MCC must be 4 digits.");

    const num = parseFloat(amount || "0");
    if (!isFinite(num) || num <= 0) {
      setError("No negative or zero amount allowed.");
      setAmount("");
      return;
    }
    const cents = Math.round(num * 100);

    const tx = await createTransaction(accountId, Number(cardId), merchant.trim(), mcc, cents);
    setResult(tx);
    setMerchant(""); setMcc(""); setAmount(""); setCardId("");
    onTransaction();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow">
      <h3 className="text-lg font-semibold text-gray-800">Make a Transaction</h3>

      <div className="flex flex-col space-y-3">
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={cardId}
          onChange={(e) => setCardId(e.target.value ? Number(e.target.value) : "")}
        >
          <option value="" disabled>
            Select card (last 4)
          </option>
          {cards.map((c) => (
            <option key={c.id} value={c.id}>
              •••• {c.last4}
            </option>
          ))}
        </select>

        <input
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Merchant"
          value={merchant}
          onChange={(e) => setMerchant(e.target.value)}
        />

        <input
          inputMode="numeric"
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="MCC (4 digits)"
          value={mcc}
          onChange={handleMccChange}
        />

        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
          <span className="px-3 text-gray-500 select-none">$</span>
          <input
            inputMode="decimal"
            step="0.01"
            min="0"
            className="flex-1 px-2 py-2 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="0.00"
            value={amount}
            onChange={handleAmountChange}
          />
        </div>
      </div>

      <button className="w-full bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 transition" type="submit">
        Submit
      </button>

      {error && <div className="text-sm bg-red-50 border border-red-200 text-red-700 p-2 rounded">{error}</div>}

      {result && (
        <div
          className={`mt-4 p-3 rounded-lg text-sm ${
            result.is_approved ? "bg-green-100 text-green-700 border border-green-300"
                               : "bg-red-100 text-red-700 border border-red-300"
          }`}
        >
          {result.is_approved ? "✅ Transaction Approved" : `❌ Declined: ${result.rejection_reason}`}
        </div>
      )}
    </form>
  );
}
