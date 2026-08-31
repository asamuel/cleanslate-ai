export type CsvRow = Record<string, string>;

export type IssueType = 'duplicate' | 'missing' | 'inconsistent' | 'suspicious';

export type IssueSource = 'deterministic' | 'ai';

export type IssueStatus = 'pending' | 'accepted' | 'rejected';

export interface DataIssue {
  id: string;
  type: IssueType;
  source: IssueSource;

  rowIndex: number;
  column?: string;

  currentValue?: string;
  suggestedValue?: string;

  reason: string;
  confidence?: number;

  status: IssueStatus;
}

export interface CsvDataset {
  fileName: string;
  columns: string[];
  rows: CsvRow[];
}
