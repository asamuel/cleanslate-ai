import type { DataIssue, IssueType } from '@/types/data-quality';

interface AnalysisSummaryProps {
  issues: DataIssue[];
}

const issueTypes: Array<{
  type: IssueType;
  label: string;
}> = [
  { type: 'missing', label: 'Missing' },
  { type: 'duplicate', label: 'Duplicates' },
  { type: 'inconsistent', label: 'Inconsistent' },
  { type: 'suspicious', label: 'Suspicious' },
];

export function AnalysisSummary({ issues }: AnalysisSummaryProps) {
  return (
    <section>
      <p className="mb-3 text-sm font-medium">Analysis summary</p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryItem label="Total issues" value={issues.length} />

        {issueTypes.map(({ type, label }) => (
          <SummaryItem
            key={type}
            label={label}
            value={issues.filter((issue) => issue.type === type).length}
          />
        ))}
      </div>
    </section>
  );
}

interface SummaryItemProps {
  label: string;
  value: number;
}

function SummaryItem({ label, value }: SummaryItemProps) {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
