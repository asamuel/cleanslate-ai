import type { CsvDataset, DataIssue } from '@/types/data-quality';

interface AnalyzeResponse {
  issues: DataIssue[];
}

export async function analyzeWithAi(dataset: CsvDataset): Promise<DataIssue[]> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      columns: dataset.columns,
      rows: dataset.rows,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? 'AI analysis failed. Please try again.');
  }

  return (data as AnalyzeResponse).issues;
}
