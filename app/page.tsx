'use client';

import { useMemo, useRef, useState } from 'react';
import { ArrowDownToLine, CheckCircle2, RotateCcw } from 'lucide-react';

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
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';

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
    <main className="min-h-screen bg-background">
      <AppHeader />

      <div className="mx-auto max-w-[1440px] px-5 pb-28 pt-8 sm:px-8 lg:pt-12">
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_440px] xl:gap-12">
          {/* Main dataset workflow */}
          <div className="flex min-w-0 flex-col gap-10">
            <section>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    Step 01
                  </p>

                  <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    Upload your dataset
                  </h1>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    We&apos;ll scan your CSV with deterministic checks and AI-assisted analysis.
                  </p>
                </div>

                <div className="hidden rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground sm:block">
                  CSV only · up to 5 MB
                </div>
              </div>

              <CsvUpload onDatasetLoaded={handleDatasetLoaded} />
            </section>

            {dataset && (
              <>
                <DatasetSummary dataset={dataset} />

                <DatasetPreview dataset={dataset} />
              </>
            )}
          </div>

          {/* Findings sidebar */}
          {dataset && (
            <aside className="flex min-w-0 flex-col gap-8 xl:pt-1">
              <section>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                      Step 02
                    </p>

                    <h2 className="text-2xl font-semibold tracking-tight">Review findings</h2>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Review every recommendation before applying changes.
                    </p>
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
                    <CheckCircle2 className="size-3.5 text-success" />
                    Rule-based complete
                  </span>

                  {isAnalyzingAi && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-purple/30 bg-purple/10 px-3 py-1.5 text-xs text-purple">
                      <span className="size-2 animate-pulse rounded-full bg-purple" />
                      AI analyzing
                    </span>
                  )}

                  {!isAnalyzingAi && !aiError && !aiSkippedReason && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-purple/30 bg-purple/10 px-3 py-1.5 text-xs text-purple">
                      <CheckCircle2 className="size-3.5" />
                      AI complete
                    </span>
                  )}
                </div>

                <AnalysisSummary issues={issues} />
              </section>

              {aiError && (
                <section className="rounded-xl border border-warning/30 bg-warning/10 p-4">
                  <p className="text-sm font-medium">AI analysis unavailable</p>

                  <p className="mt-1 text-sm text-muted-foreground">{aiError}</p>

                  <p className="mt-2 text-xs text-muted-foreground">
                    Rule-based analysis is still available.
                  </p>

                  <button
                    type="button"
                    onClick={handleRetryAiAnalysis}
                    disabled={isAnalyzingAi}
                    className="mt-3 rounded-md border border-border px-3 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
                  >
                    Retry AI analysis
                  </button>
                </section>
              )}

              {aiSkippedReason && (
                <section className="rounded-xl border border-border bg-card p-4">
                  <p className="text-sm font-medium">AI analysis skipped</p>

                  <p className="mt-1 text-sm text-muted-foreground">{aiSkippedReason}</p>
                </section>
              )}

              <IssueReview
                issues={issues}
                onStatusChange={handleIssueStatusChange}
                onAcceptAll={handleAcceptAllFixes}
                onRejectAll={handleRejectAllIssues}
              />

              {cleanedDataset && (
                <section className="rounded-xl border border-border bg-card p-4">
                  <p className="text-sm font-medium">Cleaned dataset</p>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-muted/60 p-3">
                      <p className="text-xs text-muted-foreground">Original rows</p>

                      <p className="mt-1 font-mono text-sm font-medium">{dataset.rows.length}</p>
                    </div>

                    <div className="rounded-lg bg-muted/60 p-3">
                      <p className="text-xs text-muted-foreground">Cleaned rows</p>

                      <p className="mt-1 font-mono text-sm font-medium">
                        {cleanedDataset.rows.length}
                      </p>
                    </div>
                  </div>
                </section>
              )}
            </aside>
          )}
        </div>
      </div>

      {dataset && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-3 sm:px-8">
            <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
              <CheckCircle2 className="size-4 text-success" />
              {acceptedChangeCount} changes accepted
            </div>

            <div className="ml-auto flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="gap-2 hover:bg-muted"
              >
                <RotateCcw className="size-4" />
                Reset
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handleExport}
                disabled={!cleanedDataset}
                className="gap-2"
              >
                <ArrowDownToLine className="size-4" />
                Export cleaned CSV
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
