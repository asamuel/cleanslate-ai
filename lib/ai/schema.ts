import { z } from 'zod';
import { MAX_AI_COLUMNS, MAX_AI_ROWS } from '@/lib/ai/constants';


export const aiIssueSchema = z.object({
  rowIndex: z.number().int().nonnegative(),

  column: z.string().min(1),

  type: z.enum(['inconsistent', 'suspicious']),

  currentValue: z.string(),

  suggestedValue: z.string().nullable(),

  reason: z.string().min(1),

  confidence: z.number().min(0).max(1),
});

export const aiAnalysisSchema = z.object({
  issues: z.array(aiIssueSchema),
});

export const aiAnalysisRequestSchema = z.object({
  columns: z.array(z.string().min(1)).min(1).max(MAX_AI_COLUMNS),

  rows: z.array(z.record(z.string(), z.string())).min(1).max(MAX_AI_ROWS),
});

export type AiIssue = z.infer<typeof aiIssueSchema>;
export type AiAnalysis = z.infer<typeof aiAnalysisSchema>;
export type AiAnalysisRequest = z.infer<typeof aiAnalysisRequestSchema>;
