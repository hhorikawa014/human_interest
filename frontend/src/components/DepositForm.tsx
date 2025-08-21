import { useState } from "react";
import { deposit } from "../api/account";

export default function DepositForm({
  accountId,
  onDeposited,
}: {
  accountId: number;
  onDeposited: () => void;
}) {
  const [amount, setAmount] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (/^\d*(\.\d{0,2})?$/.test(v) || v === "") {
      setAmount(v);
      setError(null);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount || "0");
    if (!isFinite(num) || num <= 0) {
      setError("No negative or zero amount allowed.");
      setAmount("");
      return;
    }
    const cents = Math.round(num * 100);
    await deposit(accountId, cents);
    setAmount("");
    onDeposited();
  };

  return (
    <form onSubmit={handleDeposit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow">
      <h3 className="text-lg font-semibold text-gray-800">Deposit Funds</h3>
      <div className="flex space-x-3 items-stretch">
        <div className="flex-1 flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-500">
          <span className="px-3 text-gray-500 select-none">$</span>
          <input
            inputMode="decimal"
            step="0.01"
            min="0"
            className="flex-1 px-2 py-2 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="0.00"
            value={amount}
            onChange={handleChange}
          />
        </div>
        <button className="bg-green-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition" type="submit">
          Deposit
        </button>
      </div>
      {error && <div className="text-sm bg-red-50 border border-red-200 text-red-700 p-2 rounded">{error}</div>}
    </form>
  );
}
