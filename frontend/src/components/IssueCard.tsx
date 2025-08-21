import { issueCard } from "../api/card";

export default function IssueCard({
  accountId,
  onIssued,
}: {
  accountId: number;
  onIssued: () => void;
}) {
  const handleClick = async () => {
    await issueCard(accountId);
    onIssued();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Virtual Card</h3>
      <p className="text-sm text-gray-600">Issue a new virtual debit card linked to your HSA.</p>
      <button
        onClick={handleClick}
        className="w-full bg-purple-600 text-white font-medium py-2 rounded-lg hover:bg-purple-700 transition"
      >
        Issue Card
      </button>
    </div>
  );
}
