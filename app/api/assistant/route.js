import { NextResponse } from 'next/server';
import { answerQuestion, assistantStatus, createOpenAIAdapter, createGrokAdapter } from '../../../lib/assistant';
import { currentUser, requireSameOrigin } from '../../../lib/office-auth';
import { prisma } from '../../../lib/prisma';
import { checkRateLimit } from '../../../lib/rate-limit.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'cache-control': 'no-store' };

// Choose adapter based on .env config:
//   ASSISTANT_ADAPTER=openai  + OPENAI_API_KEY   -> OpenAI
//   ASSISTANT_ADAPTER=grok    + GROK_API_KEY     -> Grok (x.ai)
//   otherwise -> localAdapter (database-only, no LLM)
function buildAdapter() {
  const adapter = process.env.ASSISTANT_ADAPTER;
  if (adapter === 'openai' && process.env.OPENAI_API_KEY) {
    return createOpenAIAdapter({ apiKey: process.env.OPENAI_API_KEY, model: process.env.OPENAI_MODEL || 'gpt-4o-mini' });
  }
  if (adapter === 'grok' && process.env.GROK_API_KEY) {
    return createGrokAdapter({ apiKey: process.env.GROK_API_KEY, model: process.env.GROK_MODEL || 'grok-2-latest' });
  }
  return undefined; // uses localAdapter (database-only)
}

export async function GET() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json(
      { authenticated: false, signInUrl: '/' },
      { headers: NO_STORE }
    );
  }
  return NextResponse.json(
    {
      authenticated: true,
      user: {
        name: user.name,
        jobTitle: user.jobTitle,
        roles: user.roles.map((role) => role.name)
      },
      ...assistantStatus(user)
    },
    { headers: NO_STORE }
  );
}

export async function POST(request) {
  if (!requireSameOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403, headers: NO_STORE });
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Sign in to the workspace to query live data.', signInUrl: '/' },
      { status: 401, headers: NO_STORE }
    );
  }

  const limit = checkRateLimit('assistant:' + user.id, { limit: 30, windowMs: 60_000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many questions. Try again in ' + limit.retryAfter + ' seconds.' },
      { status: 429, headers: { ...NO_STORE, 'retry-after': String(limit.retryAfter) } }
    );
  }

  const length = Number(request.headers.get('content-length') || 0);
  if (length > 4096) {
    return NextResponse.json({ error: 'That question is too long.' }, { status: 413, headers: NO_STORE });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request must contain valid JSON.' }, { status: 400, headers: NO_STORE });
  }

  const question = typeof body?.question === 'string' ? body.question.trim().slice(0, 400) : '';
  if (question.length < 2) {
    return NextResponse.json({ error: 'Ask a question about the live office data.' }, { status: 400, headers: NO_STORE });
  }

  try {
    const adapter = buildAdapter();
    const result = await answerQuestion({ question, user, db: prisma }, { adapter });
    const headers = {
      ...NO_STORE,
      'x-assistant-topic': result.topic || '',
      'x-assistant-generated-by': result.generatedBy || 'local',
      'x-assistant-elapsed-ms': String(result.elapsedMs || 0)
    };
    return NextResponse.json(result, { headers });
  } catch (error) {
    console.error('Assistant query failed:', error);
    return NextResponse.json(
      { error: 'Live data is temporarily unavailable. Please try again.' },
      { status: 503, headers: NO_STORE }
    );
  }
}

/* ---------------- Feedback endpoint ---------------- */

export async function PUT(request) {
  if (!requireSameOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403, headers: NO_STORE });
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in to submit feedback.' }, { status: 401, headers: NO_STORE });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request must contain valid JSON.' }, { status: 400, headers: NO_STORE });
  }

  const messageId = typeof body?.messageId === 'string' ? body.messageId.trim() : '';
  const rating = typeof body?.rating === 'string' ? body.rating : null;
  if (!messageId || !rating || !['helpful', 'not_helpful'].includes(rating)) {
    return NextResponse.json({ error: 'messageId and rating (helpful|not_helpful) are required.' }, { status: 400, headers: NO_STORE });
  }

  try {
    await prisma.assistantFeedback.create({
      data: {
        userId: user.id,
        messageId,
        rating,
        createdAt: new Date()
      }
    });
    return NextResponse.json({ ok: true }, { headers: NO_STORE });
  } catch (error) {
    // Feedback table may not exist yet; degrade gracefully
    console.error('Assistant feedback failed:', error);
    return NextResponse.json({ ok: false, error: 'Feedback could not be saved.' }, { status: 500, headers: NO_STORE });
  }
}
