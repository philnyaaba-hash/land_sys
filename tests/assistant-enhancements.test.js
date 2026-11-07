'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

test('land topic is detected from land-related questions', async () => {
  const { parseQuestion } = await import('../lib/assistant/intents.js');
  assert.deepEqual(pick(parseQuestion('How many land holdings are there?')), { topic: 'land', range: 'all' });
  assert.deepEqual(pick(parseQuestion('Which regions have the most listings?')), { topic: 'land', range: 'all' });
  assert.deepEqual(pick(parseQuestion('Show me land by region')), { topic: 'land', range: 'all' });
});

test('service topic is detected from service-related questions', async () => {
  const { parseQuestion } = await import('../lib/assistant/intents.js');
  assert.deepEqual(pick(parseQuestion('How many service requests are open?')), { topic: 'service', range: 'all' });
  assert.deepEqual(pick(parseQuestion('Which service requests are unassigned?')), { topic: 'service', range: 'all' });
});

test('land snapshot returns expected fields', async () => {
  const { landSnapshot } = await import('../lib/assistant/data.js');
  const db = {
    landListing: {
      count: async (arg) => {
        if (arg && arg.where && arg.where.status === 'PUBLISHED') return 8;
        if (arg && arg.where && arg.where.status === 'DRAFT') return 4;
        return 12;
      },
      groupBy: async () => [
        { region: 'Greater Accra', _count: { _all: 5 } },
        { region: 'Ashanti', _count: { _all: 3 } }
      ]
    },
    landHolding: { count: async () => 20 },
    landInquiry: { count: async () => 3 },
    landReservation: { count: async () => 2 }
  };
  const result = await landSnapshot(db, 'all', new Date(2026, 10, 5));
  assert.equal(result.totalListings, 12);
  assert.equal(result.publishedListings, 8);
  assert.equal(result.draftListings, 4);
  assert.equal(result.totalHoldings, 20);
  assert.equal(result.regions.length, 2);
  assert.equal(result.newInquiries, 3);
  assert.equal(result.newReservations, 2);
});

test('service snapshot returns expected fields', async () => {
  const { serviceSnapshot } = await import('../lib/assistant/data.js');
  const db = {
    serviceRequest: {
      count: async (arg) => {
        const w = arg && arg.where ? arg.where : {};
        if (w.status === 'SUBMITTED' && w.assignedToId === null) return 2;
        if (w.status === 'SUBMITTED') return 3;
        if (w.status === 'COMPLETED') return 5;
        if (w.status && w.status.in) return 7;
        if (w.assignedToId === null) return 2;
        return 10;
      },
      findMany: async () => [{ reference: 'SR-001', title: 'Survey plot A', status: 'SUBMITTED' }]
    },
    surveyTask: {
      count: async () => 1
    }
  };
  const user = { permissions: ['field.view'] };
  const result = await serviceSnapshot(db, user, new Date(2026, 10, 5));
  assert.equal(result.totalRequests, 10);
  assert.equal(result.openRequests, 3);
  assert.equal(result.completedRequests, 5);
  assert.equal(result.unassigned, 2);
  assert.equal(result.scoped, false);
});

test('land answer formats correctly', async () => {
  const { landAnswer } = await import('../lib/assistant/answers.js');
  const result = landAnswer({
    label: 'all time',
    totalListings: 12,
    publishedListings: 8,
    draftListings: 4,
    totalHoldings: 20,
    regions: [{ name: 'Greater Accra', count: 5 }, { name: 'Ashanti', count: 3 }],
    types: [{ name: 'RESIDENTIAL', count: 6 }, { name: 'COMMERCIAL', count: 4 }],
    newInquiries: 3,
    newReservations: 2
  });
  assert.ok(result.includes('12 land listings on record'));
  assert.ok(result.includes('8 published listings · 4 draft listings'));;
  assert.ok(result.includes('20 land holding'));
  assert.ok(result.includes('Greater Accra 5'));
});

test('service answer formats correctly', async () => {
  const { serviceAnswer } = await import('../lib/assistant/answers.js');
  const result = serviceAnswer({
    label: 'all time',
    totalRequests: 10,
    openRequests: 3,
    completedRequests: 5,
    pendingRequests: 7,
    unassigned: 2,
    overdueTasks: 1,
    dueSoon: 2,
    scoped: false,
    recentRequests: [{ reference: 'SR-001', title: 'Survey plot A', status: 'SUBMITTED' }]
  });
  assert.ok(result.includes('10 service requests on record'));
  assert.ok(result.includes('3 open'));
  assert.ok(result.includes('5 completed'));
  assert.ok(result.includes('7 pending requests'));
  assert.ok(result.includes('2 unassigned requests'));
});

test('canUseTopic allows land and service with correct permissions', async () => {
  const { canUseTopic } = await import('../lib/assistant/intents.js');
  const userWithLand = { permissions: ['land.view'] };
  const userWithField = { permissions: ['field.view'] };
  const userNoPerms = { permissions: [] };
  assert.equal(canUseTopic(userWithLand, 'land'), true);
  assert.equal(canUseTopic(userWithField, 'service'), true);
  assert.equal(canUseTopic(userNoPerms, 'land'), false);
  assert.equal(canUseTopic(userNoPerms, 'service'), false);
});

test('localAdapter handles land topic', async () => {
  const { localAdapter } = await import('../lib/assistant/index.js');
  const db = {
    landListing: {
      count: async (arg) => {
        if (arg && arg.where && arg.where.status === 'PUBLISHED') return 5;
        return 10;
      },
      groupBy: async () => []
    },
    landHolding: { count: async () => 15 },
    landInquiry: { count: async () => 0 },
    landReservation: { count: async () => 0 }
  };
  const user = { id: 'u1', name: 'Test', permissions: ['land.view'] };
  const result = await localAdapter.answer({ question: 'How many land holdings?', user, db });
  assert.equal(result.topic, 'land');
  assert.equal(result.generatedBy, 'local');
  assert.ok(result.answer.includes('10 land listings'));
  assert.ok(Array.isArray(result.tables));
  assert.ok(result.tables.includes('LandListing'));
  assert.ok(typeof result.elapsedMs === 'number' && result.elapsedMs >= 0);
});

function pick(parsed) {
  return { topic: parsed.topic, range: parsed.range };
}
