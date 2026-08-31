import type { DataIssue } from '@/types/data-quality';

interface IssueCardProps {
  issue: DataIssue;
  onStatusChange: (issueId: string, status: DataIssue['status']) => void;
}

export function IssueCard({ issue, onStatusChange }: IssueCardProps) {
  const suggestedValue =
    issue.suggestedValue ?? (issue.type === 'duplicate' ? 'Remove row' : undefined);

  return (
    <article className="rounded-xl border p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold capitalize">{issue.type}</span>

          <span className="rounded-full border px-2 py-0.5 text-xs text-zinc-500">
            {issue.source === 'ai' ? 'AI' : 'Rule-based'}
          </span>
        </div>

        <span className="text-xs text-zinc-500">
          Row {issue.rowIndex + 1}
          {issue.column ? ` · ${issue.column}` : ''}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <IssueValue label="Current" value={issue.currentValue} />

        <IssueValue label="Suggested" value={suggestedValue} />
      </div>

      <p className="mt-4 text-sm text-zinc-600">{issue.reason}</p>

      {issue.confidence !== undefined && (
        <p className="mt-3 text-xs text-zinc-500">
          Confidence: {Math.round(issue.confidence * 100)}%
        </p>
      )}

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={() => onStatusChange(issue.id, 'rejected')}
          className="rounded-md border px-3 py-2 text-sm"
        >
          Reject
        </button>

        <button
          type="button"
          onClick={() => onStatusChange(issue.id, 'accepted')}
          className="rounded-md bg-zinc-950 px-3 py-2 text-sm text-white"
        >
          Accept
        </button>
      </div>
    </article>
  );
}

interface IssueValueProps {
  label: string;
  value?: string;
}

function IssueValue({ label, value }: IssueValueProps) {
  return (
    <div className="rounded-lg border bg-zinc-50 p-3">
      <p className="text-xs uppercase tracking-wide text-zinc-400">{label}</p>

      <p className="mt-1 break-words text-sm font-medium">
        {value ? value : <span className="italic text-zinc-400">empty</span>}
      </p>
    </div>
  );
}
