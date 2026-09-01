import type { DataIssue } from '@/types/data-quality';
import { IssueCard } from './issue-card';

interface IssueReviewProps {
  issues: DataIssue[];
  onStatusChange: (issueId: string, status: DataIssue['status']) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
}

export function IssueReview({
  issues,
  onStatusChange,
  onAcceptAll,
  onRejectAll,
}: IssueReviewProps) {
  if (issues.length === 0) {
    return (
      <section className="rounded-xl border p-6 text-center">
        <p className="font-medium">No issues found</p>
        <p className="mt-1 text-sm text-zinc-500">
          The deterministic analysis did not detect any problems.
        </p>
      </section>
    );
  }

  const acceptedCount = issues.filter((issue) => issue.status === 'accepted').length;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Review suggestions</p>
          <p className="mt-1 text-sm text-zinc-500">
            {acceptedCount} of {issues.length} accepted
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onRejectAll}
            className="rounded-md border px-3 py-2 text-sm"
          >
            Reject all
          </button>

          <button
            type="button"
            onClick={onAcceptAll}
            className="rounded-md bg-zinc-950 px-3 py-2 text-sm text-white"
          >
            Accept all fixes
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {issues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} onStatusChange={onStatusChange} />
        ))}
      </div>
    </section>
  );
}
