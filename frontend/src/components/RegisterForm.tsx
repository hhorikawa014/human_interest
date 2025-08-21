import { useState } from "react";
import { createAccount } from "../api/account";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterForm({ onReady }: { onReady: (accountId: number) => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = name.trim().length > 0 && emailRegex.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!canSubmit) {
      setError("Please enter your name and a valid email address.");
      return;
    }

    try {
      setSubmitting(true);
      const acc = await createAccount(email.trim(), name.trim());
      onReady(acc.id);
    } catch (err: any) {
      setError(err?.message ?? "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow">
      <h3 className="text-lg font-semibold text-gray-800">Create Your HSA Account</h3>
      <div className="flex flex-col space-y-3">
        <input
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      {error && <div className="text-sm bg-red-50 border border-red-200 text-red-700 p-2 rounded">{error}</div>}
      <button
        className={`w-full font-medium py-2 rounded-lg transition ${
          canSubmit ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-gray-300 text-gray-600 cursor-not-allowed"
        }`}
        type="submit"
        disabled={!canSubmit || submitting}
      >
        {submitting ? "Creating..." : "Create Account"}
      </button>
    </form>
  );
}
