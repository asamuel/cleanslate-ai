import { AlertCircle, Brain, Check, Copy, ShieldCheck, Shuffle, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { isActionableIssue } from '@/lib/analysis/issue-utils';

import type { DataIssue } from '@/types/data-quality';

interface IssueCardProps {
  issue: DataIssue;
  onStatusChange: (issueId: string, status: DataIssue['status']) => void;
}

export function IssueCard({ issue, onStatusChange }: IssueCardProps) {
  const actionable = isActionableIssue(issue);

  const suggestedValue =
    issue.suggestedValue ?? (issue.type === 'duplicate' ? 'Remove row' : undefined);

  const tone = getIssueTone(issue.type);

  return (
    <Card className="rounded-xl shadow-none">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg ${tone.container}`}
          >
            <tone.Icon className="size-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium capitalize">{issue.type}</p>

              <Badge variant="outline" className="gap-1 text-[11px]">
                {issue.source === 'ai' ? (
                  <Brain className="size-3" />
                ) : (
                  <ShieldCheck className="size-3" />
                )}

                {issue.source === 'ai' ? 'AI' : 'Rule-based'}
              </Badge>
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              Row {issue.rowIndex + 1}
              {issue.column ? ` · ${issue.column}` : ''}
            </p>
          </div>

          {issue.confidence !== undefined && (
            <span className="shrink-0 font-mono text-xs text-muted-foreground">
              {Math.round(issue.confidence * 100)}%
            </span>
          )}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <IssueValue label="Current" value={issue.currentValue} fallback="empty" />

          <IssueValue label="Suggested" value={suggestedValue} fallback="No safe replacement" />
        </div>

        <p className="mt-4 text-sm leading-6 text-muted-foreground">{issue.reason}</p>

        <div className="mt-4 flex items-center justify-end gap-2 border-t border-border pt-3">
          <Button
            variant={issue.status === 'rejected' ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => onStatusChange(issue.id, 'rejected')}
          >
            <X className="size-4" />

            {actionable ? (issue.type === 'duplicate' ? 'Keep row' : 'Reject') : 'Keep as-is'}
          </Button>

          <Button
            variant={issue.status === 'accepted' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusChange(issue.id, 'accepted')}
          >
            <Check className="size-4" />

            {actionable ? (issue.type === 'duplicate' ? 'Remove row' : 'Accept') : 'Acknowledge'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface IssueValueProps {
  label: string;
  value?: string;
  fallback: string;
}

function IssueValue({ label, value, fallback }: IssueValueProps) {
  return (
    <div className="rounded-lg bg-muted/60 p-3">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 break-words font-mono text-xs font-medium">
        {value && value.length > 0 ? (
          value
        ) : (
          <span className="italic text-muted-foreground">{fallback}</span>
        )}
      </p>
    </div>
  );
}

function getIssueTone(type: DataIssue['type']) {
  switch (type) {
    case 'missing':
      return {
        container: 'bg-warning/10 text-warning',
        Icon: AlertCircle,
      };

    case 'duplicate':
      return {
        container: 'bg-purple/10 text-purple',
        Icon: Copy,
      };

    case 'inconsistent':
      return {
        container: 'bg-accent text-primary',
        Icon: Shuffle,
      };

    case 'suspicious':
      return {
        container: 'bg-destructive/10 text-destructive',
        Icon: AlertCircle,
      };
  }
}
