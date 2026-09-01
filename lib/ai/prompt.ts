import type { CsvRow } from '@/types/data-quality';

interface BuildAnalysisPromptOptions {
  columns: string[];
  rows: CsvRow[];
}

export function buildAnalysisPrompt({ columns, rows }: BuildAnalysisPromptOptions) {
  const indexedRows = rows.map((row, rowIndex) => ({
    rowIndex,
    data: row,
  }));

  return `
    You are reviewing tabular CSV data for data-quality problems.

    The application already detects exact duplicate rows and missing values
    deterministically. Do NOT report duplicates or missing-value issues.

    Focus only on:

    1. inconsistent values
      - inconsistent capitalization
      - inconsistent naming conventions
      - semantically equivalent values represented differently
      - obvious normalization opportunities

    2. suspicious values
      - values that appear implausible for the surrounding column
      - obvious malformed values
      - likely data-entry mistakes

    Rules:

    - Do not invent information.
    - Do not suggest a replacement unless there is strong evidence.
    - Use the provided zero-based rowIndex exactly.
    - Only reference existing columns.
    - Preserve legitimate variation.
    - Be conservative.
    - Omit weak or speculative findings.
    - Never modify the source data.
    - Every suggestion will be reviewed by a human.

    Columns:
    ${JSON.stringify(columns)}

    Rows:
    ${JSON.stringify(indexedRows, null, 2)}
    `.trim();
}
