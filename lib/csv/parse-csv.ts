import Papa, { ParseError } from 'papaparse';

import type { CsvDataset, CsvRow } from '@/types/data-quality';

export interface CsvParseResult {
  dataset: CsvDataset;
  errors: ParseError[];
}

function normalizeHeader(header: string) {
  return header.replace(/^\uFEFF/, '').trim();
}

export function parseCsv(file: File): Promise<CsvParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeader,

      complete: (results) => {
        const columns = results.meta.fields ?? [];

        const criticalError = results.errors.find(
          (error) => error.type === 'Quotes' || error.type === 'Delimiter'
        );

        if (criticalError) {
          reject(new Error(`Unable to parse CSV: ${criticalError.message}`));
          return;
        }

        if (columns.length === 0) {
          reject(new Error('The CSV file does not contain a valid header row.'));
          return;
        }

        if (columns.some((column) => column.length === 0)) {
          reject(new Error('The CSV contains an empty column header.'));
          return;
        }

        if (results.data.length === 0) {
          reject(new Error('The CSV file does not contain any data rows.'));
          return;
        }

        resolve({
          dataset: {
            fileName: file.name,
            columns,
            rows: results.data,
          },
          errors: results.errors,
        });
      },

      error: (error) => {
        reject(error);
      },
    });
  });
}
