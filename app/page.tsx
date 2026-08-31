'use client';

import { useMemo, useState } from 'react';

import { CsvUpload } from '@/components/csv-upload';
import { DatasetPreview } from '@/components/dataset-preview';
import { DatasetSummary } from '@/components/dataset-summary';
import type { CsvDataset, DataIssue } from '@/types/data-quality';
import { analyzeDataset } from '@/lib/analysis/analyze-dataset';
import { AnalysisSummary } from '@/components/analysis-summary';
import { applyAcceptedIssues } from '@/lib/analysis/apply-accepted-issues';
import { IssueReview } from '@/components/issue-review';

export default function Home() {
  const [dataset, setDataset] = useState<CsvDataset | null>(null);
  const [issues, setIssues] = useState<DataIssue[]>([]);

  const cleanedDataset = useMemo(() => {
    if (!dataset) {
      return null;
    }

    return applyAcceptedIssues(dataset, issues);
  }, [dataset, issues]);

  const handleIssueStatusChange = (issueId: string, status: DataIssue['status']) => {
    setIssues((currentIssues) =>
      currentIssues.map((issue) =>
        issue.id === issueId
          ? {
              ...issue,
              status,
            }
          : issue
      )
    );
  };

  const handleAllIssueStatuses = (status: DataIssue['status']) => {
    setIssues((currentIssues) =>
      currentIssues.map((issue) => ({
        ...issue,
        status,
      }))
    );
  };

  const handleDatasetLoaded = (nextDataset: CsvDataset) => {
    setDataset(nextDataset);
    setIssues(analyzeDataset(nextDataset));
  };

  const handleReset = () => {
    setDataset(null);
    setIssues([]);
  };

  const updateIssueStatus = (issueId: string, status: DataIssue['status']) => {
    setIssues((currentIssues) =>
      currentIssues.map((issue) => (issue.id === issueId ? { ...issue, status } : issue))
    );
  };

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
          <CsvUpload onDatasetLoaded={handleDatasetLoaded} />

          {dataset && (
            <>
              <DatasetSummary dataset={dataset} />

              <DatasetPreview dataset={dataset} />

              <AnalysisSummary issues={issues} />

              <IssueReview
                issues={issues}
                onStatusChange={handleIssueStatusChange}
                onAcceptAll={() => handleAllIssueStatuses('accepted')}
                onRejectAll={() => handleAllIssueStatuses('rejected')}
              />

              {cleanedDataset && (
                <section className="rounded-xl border p-5">
                  <p className="text-sm font-medium">Cleaned dataset</p>

                  <p className="mt-1 text-sm text-zinc-500">
                    {cleanedDataset.rows.length} rows after accepted changes
                  </p>

                  <p className="mt-1 text-xs text-zinc-400">
                    Original dataset: {dataset.rows.length} rows
                  </p>
                </section>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleReset}
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
