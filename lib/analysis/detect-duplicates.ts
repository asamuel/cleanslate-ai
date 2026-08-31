import type { CsvDataset, DataIssue } from '@/types/data-quality';

export function detectDuplicates(dataset: CsvDataset): DataIssue[] {
  const issues: DataIssue[] = [];
  const seenRows = new Map<string, number>();

  dataset.rows.forEach((row, rowIndex) => {
    const fingerprint = dataset.columns.map((column) => row[column]?.trim() ?? '').join('\u001F');

    const originalRowIndex = seenRows.get(fingerprint);

    if (originalRowIndex !== undefined) {
      issues.push({
        id: `duplicate-${rowIndex}`,
        type: 'duplicate',
        source: 'deterministic',
        rowIndex,
        reason: `This row duplicates row ${originalRowIndex + 1}.`,
        status: 'pending',
      });

      return;
    }

    seenRows.set(fingerprint, rowIndex);
  });

  return issues;
}
