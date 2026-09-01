import type { DataIssue } from '@/types/data-quality';

export function isActionableIssue(issue: DataIssue): boolean {
  return issue.type === 'duplicate' || issue.suggestedValue !== undefined;
}
