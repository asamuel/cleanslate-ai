'use client';

import { useMemo, useRef, useState } from 'react';

import { AnalysisSummary } from '@/components/analysis-summary';
import { CsvUpload } from '@/components/csv-upload';
import { DatasetPreview } from '@/components/dataset-preview';
import { DatasetSummary } from '@/components/dataset-summary';
import { IssueReview } from '@/components/issue-review';

import { analyzeDataset } from '@/lib/analysis/analyze-dataset';
import { applyAcceptedIssues } from '@/lib/analysis/apply-accepted-issues';
import { analyzeWithAi } from '@/lib/ai/analyze-with-ai';
import { MAX_AI_COLUMNS, MAX_AI_ROWS } from '@/lib/ai/constants';
import { exportCsv } from '@/lib/csv/export-csv';
import { isActionableIssue } from '@/lib/analysis/issue-utils';

import type { CsvDataset, DataIssue } from '@/types/data-quality';

export default function Home() {
  const [dataset, setDataset] = useState<CsvDataset | null>(null);
  const [issues, setIssues] = useState<DataIssue[]>([]);

  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSkippedReason, setAiSkippedReason] = useState<string | null>(null);

  const analysisRequestIdRef = useRef(0);

  const cleanedDataset = useMemo(() => {
    if (!dataset) {
      return null;
    }

    return applyAcceptedIssues(dataset, issues);
  }, [dataset, issues]);

  const acceptedChangeCount = issues.filter(
    (issue) => issue.status === 'accepted' && isActionableIssue(issue)
  ).length;

  function handleDatasetLoaded(nextDataset: CsvDataset) {
    const deterministicIssues = analyzeDataset(nextDataset);

    setDataset(nextDataset);
    setIssues(deterministicIssues);
    setAiError(null);
    setAiSkippedReason(null);

    void runAiAnalysis(nextDataset, deterministicIssues);
  }

  async function runAiAnalysis(targetDataset: CsvDataset, deterministicIssues: DataIssue[]) {
    if (targetDataset.rows.length > MAX_AI_ROWS) {
      setAiSkippedReason(
        `AI analysis supports up to ${MAX_AI_ROWS} rows. Rule-based analysis is still available.`
      );
      return;
    }

    if (targetDataset.columns.length > MAX_AI_COLUMNS) {
      setAiSkippedReason(
        `AI analysis supports up to ${MAX_AI_COLUMNS} columns. Rule-based analysis is still available.`
      );
      return;
    }

    const requestId = ++analysisRequestIdRef.current;

    setIsAnalyzingAi(true);
    setAiError(null);
    setAiSkippedReason(null);

    try {
      const aiIssues = await analyzeWithAi(targetDataset);

      if (requestId !== analysisRequestIdRef.current) {
        return;
      }

      setIssues([...deterministicIssues, ...aiIssues]);
    } catch (error) {
      if (requestId !== analysisRequestIdRef.current) {
        return;
      }

      setAiError(error instanceof Error ? error.message : 'AI analysis failed. Please try again.');
    } finally {
      if (requestId === analysisRequestIdRef.current) {
        setIsAnalyzingAi(false);
      }
    }
  }

  function handleRetryAiAnalysis() {
    if (!dataset || isAnalyzingAi) {
      return;
    }

    const deterministicIssues = issues.filter((issue) => issue.source === 'deterministic');

    void runAiAnalysis(dataset, deterministicIssues);
  }

  function handleIssueStatusChange(issueId: string, status: DataIssue['status']) {
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
  }

  function handleAcceptAllFixes() {
    setIssues((currentIssues) =>
      currentIssues.map((issue) =>
        isActionableIssue(issue)
          ? {
              ...issue,
              status: 'accepted',
            }
          : issue
      )
    );
  }

  function handleRejectAllIssues() {
    setIssues((currentIssues) =>
      currentIssues.map((issue) => ({
        ...issue,
        status: 'rejected',
      }))
    );
  }

  function handleExport() {
    if (!cleanedDataset) {
      return;
    }

    exportCsv(cleanedDataset);
  }

  function handleReset() {
    analysisRequestIdRef.current += 1;

    setDataset(null);
    setIssues([]);
    setAiError(null);
    setAiSkippedReason(null);
    setIsAnalyzingAi(false);
  }

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

              <section>
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <span className="text-sm text-emerald-700">✓ Rule-based analysis complete</span>

                  {isAnalyzingAi && (
                    <span className="text-sm text-zinc-500">AI analysis in progress...</span>
                  )}

                  {!isAnalyzingAi && !aiError && !aiSkippedReason && (
                    <span className="text-sm text-emerald-700">✓ AI analysis complete</span>
                  )}
                </div>

                <AnalysisSummary issues={issues} />
              </section>

              {aiError && (
                <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-900">AI analysis unavailable</p>

                      <p className="mt-1 text-sm text-amber-700">{aiError}</p>

                      <p className="mt-1 text-xs text-amber-600">
                        Rule-based analysis is still available.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleRetryAiAnalysis}
                      disabled={isAnalyzingAi}
                      className="rounded-md border border-amber-300 px-3 py-2 text-sm font-medium text-amber-900 transition hover:bg-amber-100 disabled:opacity-50"
                    >
                      Retry AI analysis
                    </button>
                  </div>
                </section>
              )}

              {aiSkippedReason && (
                <section className="rounded-xl border p-4">
                  <p className="text-sm font-medium">AI analysis skipped</p>

                  <p className="mt-1 text-sm text-zinc-500">{aiSkippedReason}</p>
                </section>
              )}

              <IssueReview
                issues={issues}
                onStatusChange={handleIssueStatusChange}
                onAcceptAll={handleAcceptAllFixes}
                onRejectAll={handleRejectAllIssues}
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

              <div className="flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-zinc-500">{acceptedChangeCount} changes accepted</p>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-zinc-50"
                  >
                    Reset
                  </button>

                  <button
                    type="button"
                    onClick={handleExport}
                    disabled={!cleanedDataset}
                    className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Export cleaned CSV
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
