import { mapAiIssues } from '@/lib/ai/map-ai-issues';
import { buildAnalysisPrompt } from '@/lib/ai/prompt';
import { aiAnalysisRequestSchema, aiAnalysisSchema } from '@/lib/ai/schema';
import { validateAiAnalysis } from '@/lib/ai/validate-ai-analysis';
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const model = process.env.OPENAI_MODEL ?? 'gpt-5.6-luna';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const requestResult = aiAnalysisRequestSchema.safeParse(body);

    if (!requestResult.success) {
      return Response.json(
        {
          error: 'Invalid analysis request.',
        },
        {
          status: 400,
        }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        {
          error: 'AI analysis is not configured.',
        },
        {
          status: 503,
        }
      );
    }

    const { columns, rows } = requestResult.data;

    const response = await openai.responses.parse({
      model,
      input: [
        {
          role: 'system',
          content:
            'You are a conservative data-quality analyst. Only report findings that are clearly supported by the provided dataset.',
        },
        {
          role: 'user',
          content: buildAnalysisPrompt({
            columns,
            rows,
          }),
        },
      ],
      text: {
        format: zodTextFormat(aiAnalysisSchema, 'csv_data_quality_analysis'),
      },
    });

    const analysis = response.output_parsed;

    if (!analysis) {
      return Response.json(
        {
          error: 'The AI provider did not return a valid analysis.',
        },
        {
          status: 502,
        }
      );
    }

    const validatedAnalysis = validateAiAnalysis({
      analysis,
      columns,
      rows,
    });

    return Response.json({
      issues: mapAiIssues(validatedAnalysis),
    });
  } catch (error) {
    console.error('AI analysis failed:', error);

    return Response.json(
      {
        error: 'AI analysis failed. Please try again.',
      },
      {
        status: 502,
      }
    );
  }
}
