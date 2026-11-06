'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

let modules;

async function load() {
  if (!modules) {
    modules = {
      intents: await import('../lib/assistant/intents.js'),
      data: await import('../lib/assistant/data.js'),
      answers: await import('../lib/assistant/answers.js'),
      engine: await import('../lib/assistant/index.js')
    };
  }
  return modules;
}

const NOW = new Date(2026, 10, 5, 14, 30);

test('parses topics and ranges from natural questions', async () => {
  const { parseQuestion } = await load().then((loaded) => loaded.intents);

  assert.deepEqual(pick(parseQuestion('Who is on site right now?')), { topic: 'visitors', range: 'today' });
  assert.deepEqual(pick(parseQuestion('How much did we collect this month?')), { topic: 'finance', range: 'month' });
  assert.deepEqual(pick(parseQuestion('Any overdue field tasks?')), { topic: 'survey', range: 'all' });
  assert.deepEqual(pick(parseQuestion('How many staff do we have?')), { topic: 'staff', range: 'all' });
  assert.deepEqual(pick(parseQuestion('What changed this week?')), { topic: 'audit', range: 'week' });
  assert.deepEqual(pick(parseQuestion('Am I clocked in?')), { topic: 'attendance', range: 'today' });
  assert.deepEqual(pick(parseQuestion('Who is in today?')), { topic: 'attendance', range: 'today' });
  assert.deepEqual(pick(parseQuestion('Give me a workspace overview')), { topic: 'overview', range: 'today' });
  assert.deepEqual(pick(parseQuestion('hello')), { topic: 'help', range: 'today' });
});

test('filters capabilities and suggestions by office permissions', async () => {
  const { canUseTopic, assistantStatus } = await load().then((loaded) => loaded.intents);
  const user = { name: 'Ama Boateng', permissions: ['visitors.view', 'attendance.view'] };

  assert.equal(canUseTopic(user, 'visitors'), true);
  assert.equal(canUseTopic(user, 'attendance'), true);
  assert.equal(canUseTopic(user, 'overview'), true);
  assert.equal(canUseTopic(user, 'finance'), false);
  assert.equal(canUseTopic(user, 'staff'), false);

  const status = assistantStatus(user);
  assert.match(status.greeting, /Hi Ama/);
  assert.deepEqual(status.capabilities.map((entry) => entry.key), ['visitors', 'attendance', 'overview']);
  assert.ok(status.suggestions.some((suggestion) => /on site/i.test(suggestion)));
  assert.ok(!status.suggestions.some((suggestion) => /outstanding/i.test(suggestion)));

  const limited = assistantStatus({ name: 'Kofi', permissions: [] });
  assert.deepEqual(limited.capabilities.map((entry) => entry.key), ['attendance', 'overview']);
});

test('builds calendar ranges from a fixed date', async () => {
  const { rangeBounds } = await load().then((loaded) => loaded.data);

  const today = rangeBounds('today', NOW);
  assert.equal(today.from.getDate(), 5);
  assert.equal(today.from.getHours(), 0);
  assert.equal(today.to.getDate(), 5);
  assert.equal(today.label, 'today');

  const week = rangeBounds('week', NOW);
  assert.equal(week.from.getDay(), 1);
  assert.equal(week.from.getDate(), 2);

  const month = rangeBounds('month', NOW);
  assert.equal(month.from.getDate(), 1);
  assert.equal(month.from.getMonth(), 10);

  const year = rangeBounds('year', NOW);
  assert.equal(year.from.getMonth(), 0);
  assert.equal(year.from.getDate(), 1);

  assert.equal(rangeBounds('all', NOW).from, null);
});

test('formats counts, money, and attendance answers', async () => {
  const { formatCount, formatMoney, attendanceAnswer } = await load().then((loaded) => loaded.answers);

  assert.equal(formatCount(1, 'visit'), '1 visit');
  assert.equal(formatCount(2, 'visit'), '2 visits');
  assert.equal(formatMoney(1234.5), 'GH₵ 1,234.50');

  const answer = attendanceAnswer({
    canViewAll: false,
    label: 'today',
    range: 'today',
    myRecord: { status: 'LATE', checkInAt: new Date(2026, 10, 5, 8, 5), checkOutAt: null }
  });
  assert.equal(answer, 'You are clocked in since 08:05 (late).');
});

test('formats a visitor snapshot with names and counts', async () => {
  const { visitorAnswer } = await load().then((loaded) => loaded.answers);
  const answer = visitorAnswer({
    label: 'today',
    insideCount: 2,
    inside: [{ visitor: { fullName: 'Ama Mensah' }, host: { name: 'Kofi Boateng' }, checkedInAt: new Date(2026, 10, 5, 9, 12) }],
    awaitingCount: 1,
    awaiting: [{ visitor: { fullName: 'Yaw Owusu' }, host: null }],
    overdueCount: 0,
    rangeTotal: 5,
    statuses: { CHECKED_IN: 2, CHECKED_OUT: 3 }
  });

  assert.match(answer, /2 visitors on site right now/);
  assert.match(answer, /Ama Mensah — host Kofi Boateng, in since 09:12/);
  assert.match(answer, /…and 1 more\./);
  assert.match(answer, /1 visit awaiting approval/);
  assert.match(answer, /5 visits recorded today/);
});

test('restricted topics never touch the database', async () => {
  const { answerQuestion } = await load().then((loaded) => loaded.engine);
  const explodingDb = new Proxy({}, { get() { throw new Error('database should not be queried'); } });
  const result = await answerQuestion({
    question: 'What is outstanding?',
    user: { id: 'u1', name: 'Ama', permissions: ['attendance.view'] },
    db: explodingDb,
    now: NOW
  });

  assert.equal(result.data.restricted, true);
  assert.match(result.answer, /does not include access to finance desk/i);
});

test('answers visitor questions from a stubbed database', async () => {
  const { answerQuestion } = await load().then((loaded) => loaded.engine);
  const db = {
    visit: {
      count: async ({ where }) => {
        if (where.expectedCheckout) return 0;
        if (where.status === 'CHECKED_IN') return 2;
        if (where.status === 'AWAITING_APPROVAL') return 1;
        return 5;
      },
      findMany: async ({ where }) => where.status === 'CHECKED_IN'
        ? [{ visitor: { fullName: 'Ama Mensah' }, host: { name: 'Kofi Boateng' }, checkedInAt: new Date(2026, 10, 5, 9, 12) }]
        : [{ visitor: { fullName: 'Yaw Owusu' }, host: null, createdAt: new Date(2026, 10, 5, 10, 0) }],
      groupBy: async () => [{ status: 'CHECKED_IN', _count: { _all: 2 } }, { status: 'CHECKED_OUT', _count: { _all: 3 } }]
    }
  };

  const result = await answerQuestion({
    question: 'Who is on site?',
    user: { id: 'u1', name: 'Ama', permissions: ['visitors.view'] },
    db,
    now: NOW
  });

  assert.equal(result.topic, 'visitors');
  assert.equal(result.generatedBy, 'local');
  assert.match(result.answer, /2 visitors on site right now/);
  assert.match(result.answer, /1 visit awaiting approval/);
  assert.deepEqual(result.suggestions.slice(0, 1), ['Who is on site right now?']);
});

test('LLM adapter keeps the same answer contract', async () => {
  const { createLlmAdapter } = await load().then((loaded) => loaded.engine);
  const adapter = createLlmAdapter({
    model: 'test-model',
    buildContext: async () => ({ visitsToday: 5 }),
    complete: async ({ prompt }) => {
      assert.match(prompt, /visitsToday/);
      return 'There were 5 visits today.';
    }
  });

  const result = await adapter.answer({ question: 'How many visits today?', user: { permissions: [] }, db: {}, now: NOW });
  assert.equal(result.answer, 'There were 5 visits today.');
  assert.equal(result.generatedBy, 'test-model');
});

function pick(parsed) {
  return { topic: parsed.topic, range: parsed.range };
}
