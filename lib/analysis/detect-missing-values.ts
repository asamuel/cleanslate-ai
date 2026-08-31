import type { CsvDataset, DataIssue } from '@/types/data-quality';

export function detectMissingValues(dataset: CsvDataset): DataIssue[] {
  const issues: DataIssue[] = [];

  dataset.rows.forEach((row, rowIndex) => {
    dataset.columns.forEach((column) => {
      const value = row[column];

      if (value === undefined || value.trim() === '') {
        issues.push({
          id: `missing-${rowIndex}-${column}`,
          type: 'missing',
          source: 'deterministic',
          rowIndex,
          column,
          currentValue: value ?? '',
          reason: `The "${column}" field is empty.`,
          status: 'pending',
        });
      }
    });
  });

  return issues;
}