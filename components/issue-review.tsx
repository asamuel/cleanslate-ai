import { Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { IssueCard } from '@/components/issue-card';

import type { DataIssue } from '@/types/data-quality';

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
      <section className="rounded-xl border border-border bg-card p-6 text-center">
        <p className="font-medium">No issues found</p>

        <p className="mt-1 text-sm text-muted-foreground">
          The analysis did not detect any problems.
        </p>
      </section>
    );
  }

  const acceptedCount = issues.filter((issue) => issue.status === 'accepted').length;

  return (
    <section aria-labelledby="suggestions-title">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 id="suggestions-title" className="text-xl font-semibold tracking-tight">
            Suggested fixes
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {acceptedCount} of {issues.length} accepted
          </p>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <Button variant="outline" size="sm" onClick={onRejectAll}>
            Reject all
          </Button>

          <Button size="sm" onClick={onAcceptAll} className="gap-2">
            <Sparkles className="size-4" />
            Accept all fixes
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {issues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} onStatusChange={onStatusChange} />
        ))}
      </div>
    </section>
  );
}
