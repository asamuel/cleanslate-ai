'use client';

import { useState } from 'react';

import { CsvUpload } from '@/components/csv-upload';
import { DatasetPreview } from '@/components/dataset-preview';
import { DatasetSummary } from '@/components/dataset-summary';
import type { CsvDataset } from '@/types/data-quality';

export default function Home() {
  const [dataset, setDataset] = useState<CsvDataset | null>(null);

  return (
    <main className="min-h-screen bg-white text-zinc-950">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
        <header className="mb-10 border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-950 text-sm font-semibold text-white">
              CS
            </div>

            <div>
              <h1 className="text-xl font-semibold tracking-tight">CleanSlate AI</h1>

              <p className="text-sm text-zinc-500">AI-assisted CSV data quality review</p>
            </div>
          </div>
        </header>

        <div className="space-y-8">
          <CsvUpload onDatasetLoaded={setDataset} />

          {dataset && (
            <>
              <DatasetSummary dataset={dataset} />

              <DatasetPreview dataset={dataset} />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setDataset(null)}
                  className="rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-zinc-50"
                >
                  Reset
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
