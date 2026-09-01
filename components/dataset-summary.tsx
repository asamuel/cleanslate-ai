import { Columns3, FileSpreadsheet, Rows3 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { CsvDataset } from '@/types/data-quality';

interface DatasetSummaryProps {
  dataset: CsvDataset;
}

export function DatasetSummary({ dataset }: DatasetSummaryProps) {
  const items = [
    {
      label: 'Rows',
      value: dataset.rows.length.toLocaleString(),
      icon: Rows3,
    },
    {
      label: 'Columns',
      value: dataset.columns.length.toLocaleString(),
      icon: Columns3,
    },
    {
      label: 'File',
      value: dataset.fileName,
      icon: FileSpreadsheet,
    },
  ];

  return (
    <Card className="rounded-xl shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base">Dataset summary</CardTitle>

        <Badge variant="secondary" className="font-normal">
          Loaded
        </Badge>
      </CardHeader>

      <CardContent className="grid gap-4 sm:grid-cols-3">
        {items.map(({ label, value, icon: Icon }) => (
          <div key={label} className="min-w-0 rounded-lg bg-muted/60 p-3">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <Icon className="size-3.5" />
              <p className="text-xs">{label}</p>
            </div>

            <p className="truncate font-mono text-sm font-medium">{value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
