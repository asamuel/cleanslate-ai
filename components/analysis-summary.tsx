import { AlertTriangle, CircleDashed, Copy, ListChecks, Shuffle } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

import type { DataIssue, IssueType } from '@/types/data-quality';

interface AnalysisSummaryProps {
  issues: DataIssue[];
}

const metrics: Array<{
  type?: IssueType;
  label: string;
  icon: typeof ListChecks;
  tone: string;
}> = [
  {
    label: 'Total issues',
    icon: ListChecks,
    tone: 'text-destructive',
  },
  {
    type: 'missing',
    label: 'Missing',
    icon: CircleDashed,
    tone: 'text-warning',
  },
  {
    type: 'duplicate',
    label: 'Duplicates',
    icon: Copy,
    tone: 'text-purple',
  },
  {
    type: 'inconsistent',
    label: 'Inconsistent',
    icon: Shuffle,
    tone: 'text-primary',
  },
  {
    type: 'suspicious',
    label: 'Suspicious',
    icon: AlertTriangle,
    tone: 'text-destructive',
  },
];

export function AnalysisSummary({ issues }: AnalysisSummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {metrics.map(({ type, label, icon: Icon, tone }, index) => {
        const value = type ? issues.filter((issue) => issue.type === type).length : issues.length;

        return (
          <Card key={label} className={`rounded-xl shadow-none ${index === 0 ? 'col-span-2' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className={`font-mono text-2xl font-semibold ${tone}`}>{value}</p>

                  <p className="mt-2 text-sm font-medium">{label}</p>
                </div>

                <div className="flex size-9 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
                  <Icon className="size-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
