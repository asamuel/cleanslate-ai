import type { AiAnalysis } from '@/lib/ai/schema';
import type { DataIssue } from '@/types/data-quality';

export function mapAiIssues(analysis: AiAnalysis): DataIssue[] {
  return analysis.issues.map((issue, index) => ({
    ...issue,
    id: `ai-${issue.rowIndex}-${issue.column}-${index}`,
    source: 'ai',
    status: 'pending',
    suggestedValue: issue.suggestedValue ?? undefined,
  }));
}
