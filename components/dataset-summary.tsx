import { Columns3, FileSpreadsheet, Rows3 } from 'lucide-react';

import type { CsvDataset } from '@/types/data-quality';

interface DatasetSummaryProps {
  dataset: CsvDataset;
}

export function DatasetSummary({ dataset }: DatasetSummaryProps) {
  const items = [
    {
      label: 'File',
      value: dataset.fileName,
      icon: FileSpreadsheet,
    },
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
  ];

  return (
    <section>
      <p className="mb-3 text-sm font-medium">Dataset</p>

      <div className="grid overflow-hidden rounded-xl border md:grid-cols-3">
        {items.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-3 border-b p-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"
          >
            <div className="rounded-md border p-2">
              <Icon className="size-4" />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-zinc-500">{label}</p>
              <p className="truncate text-sm font-medium">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
