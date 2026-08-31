import Papa from 'papaparse';

import type { CsvDataset } from '@/types/data-quality';

export function exportCsv(dataset: CsvDataset) {
  const csv = Papa.unparse({
    fields: dataset.columns,
    data: dataset.rows.map((row) => dataset.columns.map((column) => row[column] ?? '')),
  });

  const blob = new Blob([csv], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const baseName = dataset.fileName.replace(/\.csv$/i, '');

  link.href = url;
  link.download = `cleaned-${baseName}.csv`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}
