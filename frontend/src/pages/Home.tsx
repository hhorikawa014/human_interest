import { useState } from "react";
import RegisterForm from "../components/RegisterForm";
import DepositForm from "../components/DepositForm";
import IssueCard from "../components/IssueCard";
import TransactionForm from "../components/TransactionForm";
import DashboardSummary from "../components/DashboardSummary";

export default function Home() {
  const [accountId, setAccountId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-indigo-600 text-white shadow">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-wide">💳 HSA Web App</h1>
          <span className="text-sm opacity-80">{accountId ? `Account #${accountId}` : "Guest"}</span>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-2xl space-y-6">
          {accountId === null ? (
            <RegisterForm onReady={(accId) => setAccountId(accId)} />
          ) : (
            <>
              <DashboardSummary accountId={accountId} refreshKey={refreshKey} />
              <DepositForm accountId={accountId} onDeposited={triggerRefresh} />
              <IssueCard accountId={accountId} onIssued={triggerRefresh} />
              {/* Pass refreshKey here so TransactionForm refetches cards */}
              <TransactionForm
                accountId={accountId}
                refreshKey={refreshKey}
                onTransaction={triggerRefresh}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
