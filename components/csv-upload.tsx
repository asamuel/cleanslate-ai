'use client';

import { ChangeEvent, useState } from 'react';
import { FileSpreadsheet, Upload } from 'lucide-react';

import { parseCsv } from '@/lib/csv/parse-csv';
import type { CsvDataset } from '@/types/data-quality';

interface CsvUploadProps {
  onDatasetLoaded: (dataset: CsvDataset) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function CsvUpload({ onDatasetLoaded }: CsvUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError(null);

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a CSV file.');
      event.target.value = '';
      return;
    }

    if (file.size === 0) {
      setError('The selected file is empty.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('The CSV file must be smaller than 5 MB.');
      event.target.value = '';
      return;
    }

    try {
      setIsParsing(true);

      const { dataset } = await parseCsv(file);

      onDatasetLoaded(dataset);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to parse the CSV file.');
    } finally {
      setIsParsing(false);
      event.target.value = '';
    }
  }

  return (
    <section>
      <div className="mb-3">
        <p className="text-sm font-medium">Upload</p>
      </div>

      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed p-6 transition hover:bg-zinc-50">
        <div className="flex items-center gap-4">
          <div className="rounded-lg border p-3">
            <FileSpreadsheet className="size-5" />
          </div>

          <div>
            <p className="font-medium">{isParsing ? 'Parsing CSV...' : 'Choose a CSV file'}</p>

            <p className="mt-1 text-sm text-zinc-500">CSV files up to 5 MB</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
          <Upload className="size-4" />
          Browse
        </div>

        <input
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          disabled={isParsing}
          onChange={handleFileChange}
        />
      </label>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </section>
  );
}
