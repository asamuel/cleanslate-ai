'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { FileSpreadsheet, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { parseCsv } from '@/lib/csv/parse-csv';

import type { CsvDataset } from '@/types/data-quality';

interface CsvUploadProps {
  onDatasetLoaded: (dataset: CsvDataset) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function CsvUpload({ onDatasetLoaded }: CsvUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  async function processFile(file: File) {
    setError(null);

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a CSV file.');
      return;
    }

    if (file.size === 0) {
      setError('The selected file is empty.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('The CSV file must be smaller than 5 MB.');
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
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    await processFile(file);

    event.target.value = '';
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        disabled={isParsing}
        onChange={handleFileChange}
      />

      <button
        type="button"
        disabled={isParsing}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);

          const file = event.dataTransfer.files[0];

          if (file) {
            void processFile(file);
          }
        }}
        className={`flex w-full flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center transition-colors ${
          isDragging
            ? 'border-primary bg-accent'
            : 'border-border bg-card hover:border-primary/60 hover:bg-muted/40'
        }`}
      >
        <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-accent text-primary">
          {isParsing ? (
            <FileSpreadsheet className="size-5 animate-pulse" />
          ) : (
            <Upload className="size-5" />
          )}
        </div>

        <span className="font-medium">
          {isParsing ? 'Reading dataset...' : 'Drop your CSV here'}
        </span>

        <span className="mt-1 text-sm text-muted-foreground">
          or <span className="font-medium text-primary">browse files</span> from your computer
        </span>
      </button>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </div>
  );
}
