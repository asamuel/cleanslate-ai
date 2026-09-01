import type { DataIssue } from '@/types/data-quality';

export function deduplicateAiIssues(issues: DataIssue[]): DataIssue[] {
  const uniqueIssues = new Map<string, DataIssue>();

  issues.forEach((issue) => {
    const key = [issue.rowIndex, issue.column ?? '', issue.type].join(':');

    const existingIssue = uniqueIssues.get(key);

    if (!existingIssue) {
      uniqueIssues.set(key, issue);
      return;
    }

    const existingConfidence = existingIssue.confidence ?? 0;

    const nextConfidence = issue.confidence ?? 0;

    if (nextConfidence > existingConfidence) {
      uniqueIssues.set(key, issue);
    }
  });

  return Array.from(uniqueIssues.values());
}
