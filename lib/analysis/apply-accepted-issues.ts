import type { CsvDataset, DataIssue } from '@/types/data-quality';

export function applyAcceptedIssues(dataset: CsvDataset, issues: DataIssue[]): CsvDataset {
  const acceptedIssues = issues.filter((issue) => issue.status === 'accepted');

  const rowsToRemove = new Set(
    acceptedIssues.filter((issue) => issue.type === 'duplicate').map((issue) => issue.rowIndex)
  );

  const editedRows = dataset.rows.map((row, rowIndex) => {
    const nextRow = { ...row };

    const rowIssues = acceptedIssues.filter(
      (issue) =>
        issue.rowIndex === rowIndex &&
        issue.type !== 'duplicate' &&
        issue.column &&
        issue.suggestedValue !== undefined
    );

    rowIssues.forEach((issue) => {
      nextRow[issue.column!] = issue.suggestedValue!;
    });

    return nextRow;
  });

  return {
    ...dataset,
    rows: editedRows.filter((_, rowIndex) => !rowsToRemove.has(rowIndex)),
  };
}
