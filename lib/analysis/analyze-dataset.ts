import { detectDuplicates } from '@/lib/analysis/detect-duplicates';
import { detectMissingValues } from '@/lib/analysis/detect-missing-values';
import type { CsvDataset, DataIssue } from '@/types/data-quality';

export function analyzeDataset(dataset: CsvDataset): DataIssue[] {
  return [...detectMissingValues(dataset), ...detectDuplicates(dataset)];
}
