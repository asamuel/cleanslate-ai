import type { AiAnalysis } from '@/lib/ai/schema';
import type { CsvRow } from '@/types/data-quality';

interface ValidateAiAnalysisOptions {
  analysis: AiAnalysis;
  columns: string[];
  rows: CsvRow[];
}

export function validateAiAnalysis({
  analysis,
  columns,
  rows,
}: ValidateAiAnalysisOptions): AiAnalysis {
  const validColumns = new Set(columns);

  return {
    issues: analysis.issues.filter((issue) => {
      const validRow = issue.rowIndex >= 0 && issue.rowIndex < rows.length;

      const validColumn = validColumns.has(issue.column);

      if (!validRow || !validColumn) {
        console.warn('Discarding invalid AI issue:', issue);
        return false;
      }

      return true;
    }),
  };
}
