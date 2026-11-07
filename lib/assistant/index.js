import {
  TOPIC_DEFINITIONS,
  assistantStatus,
  canUseTopic,
  parseQuestion,
  topicSuggestions
} from './intents.js';
import {
  auditSnapshot,
  attendanceSnapshot,
  clientSnapshot,
  financeSnapshot,
  landSnapshot,
  pipelineSnapshot,
  serviceSnapshot,
  staffSnapshot,
  surveySnapshot,
  visitorSnapshot
} from './data.js';
import {
  auditAnswer,
  attendanceAnswer,
  clientAnswer,
  financeAnswer,
  formatMoney,
  helpAnswer,
  landAnswer,
  overviewAnswer,
  pipelineAnswer,
  restrictedAnswer,
  serviceAnswer,
  staffAnswer,
  surveyAnswer,
  visitorAnswer
} from './answers.js';

function suggestionsFor(user, topic) {
  const def = TOPIC_DEFINITIONS[topic];
  if (def && canUseTopic(user, topic)) return def.suggestions;
  return topicSuggestions(user).slice(0, 3);
}

async function overviewResult(db, user, now) {
  const sections = [];
  const jobs = [];

  if (canUseTopic(user, 'visitors')) {
    jobs.push(visitorSnapshot(db, 'today', now).then((snapshot) => {
      sections.push({
        label: 'Visitors',
        text: snapshot.insideCount + ' on site, ' + snapshot.awaitingCount + ' awaiting approval, ' + snapshot.rangeTotal + ' visits today.'
      });
    }));
  }
  if (canUseTopic(user, 'staff')) {
    jobs.push(staffSnapshot(db, now).then((snapshot) => {
      sections.push({ label: 'Staff', text: snapshot.active + ' active of ' + snapshot.total + '.' });
    }));
  }
  if (canUseTopic(user, 'attendance')) {
    jobs.push(attendanceSnapshot(db, 'today', user, now).then((snapshot) => {
      sections.push({
        label: 'Attendance',
        text: snapshot.canViewAll
          ? snapshot.summary.present + ' in today, ' + snapshot.summary.late + ' late.'
          : snapshot.myRecord ? 'Your attendance is recorded today.' : 'No attendance record for you today.'
      });
    }));
  }
  if (canUseTopic(user, 'finance')) {
    jobs.push(financeSnapshot(db, 'month', now).then((snapshot) => {
      sections.push({
        label: 'Finance',
        text: formatMoney(snapshot.outstanding, snapshot.currency) + ' outstanding; '
          + formatMoney(snapshot.collected, snapshot.currency) + ' collected this month.'
      });
    }));
  }
  if (canUseTopic(user, 'survey')) {
    jobs.push(surveySnapshot(db, user, now).then((snapshot) => {
      sections.push({ label: 'Surveying', text: snapshot.activeProjects + ' active projects, ' + snapshot.overdue + ' tasks overdue.' });
    }));
  }
  if (canUseTopic(user, 'audit')) {
    jobs.push(auditSnapshot(db, 'week', now).then((snapshot) => {
      sections.push({ label: 'Audit', text: snapshot.total + ' events this week.' });
    }));
  }
  if (canUseTopic(user, 'clients')) {
    jobs.push(clientSnapshot(db, 'month', now).then((snapshot) => {
      sections.push({ label: 'Clients', text: snapshot.total + ' on record, ' + snapshot.newClients + ' new this month.' });
    }));
  }
  if (canUseTopic(user, 'pipeline')) {
    jobs.push(pipelineSnapshot(db, 'week', now).then((snapshot) => {
      sections.push({ label: 'Storefront', text: (snapshot.reservations.PENDING || 0) + ' reservations awaiting payment, ' + snapshot.newReservations + ' new this week.' });
    }));
  }
  if (canUseTopic(user, 'land')) {
    jobs.push(landSnapshot(db, 'all', now).then((snapshot) => {
      sections.push({ label: 'Land', text: snapshot.totalListings + ' listings (' + snapshot.publishedListings + ' published), ' + snapshot.totalHoldings + ' holdings.' });
    }));
  }
  if (canUseTopic(user, 'service')) {
    jobs.push(serviceSnapshot(db, user, now).then((snapshot) => {
      sections.push({ label: 'Service', text: snapshot.openRequests + ' open, ' + snapshot.pendingRequests + ' pending, ' + snapshot.unassigned + ' unassigned.' });
    }));
  }

  await Promise.all(jobs);
  const order = ['Visitors', 'Staff', 'Attendance', 'Finance', 'Surveying', 'Audit', 'Clients', 'Storefront', 'Land', 'Service'];
  sections.sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label));
  return {
    answer: overviewAnswer(sections),
    topic: 'overview',
    generatedBy: 'local',
    data: { sections },
    suggestions: topicSuggestions(user)
  };
}

const TOPIC_DATA_FN = {
  visitors: (db, range, now) => visitorSnapshot(db, range, now),
  staff: (db, range, now) => staffSnapshot(db, now),
  attendance: (db, range, user, now) => attendanceSnapshot(db, range, user, now),
  finance: (db, range, now) => financeSnapshot(db, range, now),
  survey: (db, range, user, now) => surveySnapshot(db, user, now),
  clients: (db, range, now) => clientSnapshot(db, range, now),
  pipeline: (db, range, now) => pipelineSnapshot(db, range, now),
  land: (db, range, now) => landSnapshot(db, range, now),
  service: (db, range, user, now) => serviceSnapshot(db, user, now),
  audit: (db, range, now) => auditSnapshot(db, range, now)
};

const TOPIC_ANSWER_FN = {
  visitors: visitorAnswer,
  staff: staffAnswer,
  attendance: attendanceAnswer,
  finance: financeAnswer,
  survey: surveyAnswer,
  clients: clientAnswer,
  pipeline: pipelineAnswer,
  land: landAnswer,
  service: serviceAnswer,
  audit: auditAnswer
};

export const localAdapter = {
  id: 'local',
  async answer({ question, user, db, now = new Date() }) {
    const start = Date.now();
    const { topic, range } = parseQuestion(question);

    if (topic === 'help') {
      return {
        answer: helpAnswer(user),
        topic: 'help',
        generatedBy: 'local',
        data: {},
        suggestions: topicSuggestions(user),
        tables: [],
        elapsedMs: Date.now() - start
      };
    }

    if (!canUseTopic(user, topic)) {
      return {
        answer: restrictedAnswer(topic),
        topic,
        generatedBy: 'local',
        data: { restricted: true },
        suggestions: topicSuggestions(user),
        tables: [],
        elapsedMs: Date.now() - start
      };
    }

    if (topic === 'overview') {
      const result = await overviewResult(db, user, now);
      result.elapsedMs = Date.now() - start;
      result.tables = [];
      return result;
    }

    let answer;
    let data;
    let tables = [];
    if (topic === 'visitors') {
      data = await visitorSnapshot(db, range, now);
      answer = visitorAnswer(data);
      tables = ['Visit', 'Visitor'];
    } else if (topic === 'staff') {
      data = await staffSnapshot(db, now);
      answer = staffAnswer(data);
      tables = ['User', 'Department'];
    } else if (topic === 'attendance') {
      data = await attendanceSnapshot(db, range, user, now);
      answer = attendanceAnswer(data);
      tables = ['Attendance', 'User'];
    } else if (topic === 'finance') {
      data = await financeSnapshot(db, range, now);
      answer = financeAnswer(data);
      tables = ['Invoice', 'Payment', 'Expense'];
    } else if (topic === 'survey') {
      data = await surveySnapshot(db, user, now);
      answer = surveyAnswer(data);
      tables = ['Project', 'LandParcel', 'SurveyTask', 'FieldReport'];
    } else if (topic === 'clients') {
      data = await clientSnapshot(db, range, now);
      answer = clientAnswer(data);
      tables = ['ClientProfile', 'LandHolding', 'LandReservation'];
    } else if (topic === 'pipeline') {
      data = await pipelineSnapshot(db, range, now);
      answer = pipelineAnswer(data);
      tables = ['LandReservation', 'LandInquiry', 'LandListing'];
    } else if (topic === 'land') {
      data = await landSnapshot(db, range, now);
      answer = landAnswer(data);
      tables = ['LandListing', 'LandHolding', 'LandInquiry', 'LandReservation'];
    } else if (topic === 'service') {
      data = await serviceSnapshot(db, user, now);
      answer = serviceAnswer(data);
      tables = ['ServiceRequest', 'SurveyTask'];
    } else {
      data = await auditSnapshot(db, range, now);
      answer = auditAnswer(data, now);
      tables = ['AuditEvent'];
    }

    return {
      answer,
      topic,
      generatedBy: 'local',
      data,
      suggestions: suggestionsFor(user, topic),
      tables,
      elapsedMs: Date.now() - start
    };
  }
};

export async function answerQuestion(input, { adapter = localAdapter } = {}) {
  if (!adapter || typeof adapter.answer !== 'function') {
    throw new Error('Assistant adapter must provide an answer function.');
  }
  return adapter.answer(input);
}

/**
 * Adapter seam for a future LLM. `buildContext({ user, db, now })` must return a
 * permission-filtered snapshot only; the completion function receives that JSON
 * and must not be trusted to enforce permissions on its own.
 */
export function createLlmAdapter({ complete, buildContext, model = 'assistant' } = {}) {
  if (typeof complete !== 'function' || typeof buildContext !== 'function') {
    throw new Error('createLlmAdapter requires complete and buildContext functions.');
  }
  return {
    id: 'llm',
    async answer({ question, user, db, now = new Date() }) {
      const start = Date.now();
      const context = await buildContext({ user, db, now });
      const text = await complete({
        model,
        system: 'You are LandLedger Assistant. Answer only from the supplied JSON context. If the answer is not present, say so. Never invent names, amounts, or counts. Keep answers short.',
        prompt: JSON.stringify({ question, context })
      });
      return {
        answer: String(text || '').trim() || 'I could not find that in the live office data.',
        topic: 'llm',
        generatedBy: model,
        data: { context },
        suggestions: topicSuggestions(user),
        tables: Object.keys(context || {}),
        elapsedMs: Date.now() - start
      };
    }
  };
}

/**
 * Example OpenAI-compatible adapter. Configure with your API key in .env.
 * Usage in route.js: adapter = createOpenAIAdapter({ apiKey: process.env.OPENAI_API_KEY })
 */
export function createOpenAIAdapter({ apiKey, model = 'gpt-4o-mini', baseUrl = 'https://api.openai.com/v1' } = {}) {
  if (!apiKey) throw new Error('OpenAI adapter requires an apiKey.');
  return {
    id: 'openai',
    async answer({ question, user, db, now = new Date() }) {
      const start = Date.now();
      const { topic, range } = parseQuestion(question);
      if (!canUseTopic(user, topic)) {
        return { answer: restrictedAnswer(topic), topic, generatedBy: 'openai', data: { restricted: true }, suggestions: topicSuggestions(user), tables: [], elapsedMs: Date.now() - start };
      }
      let data;
      if (topic === 'visitors') data = await visitorSnapshot(db, range, now);
      else if (topic === 'staff') data = await staffSnapshot(db, now);
      else if (topic === 'attendance') data = await attendanceSnapshot(db, range, user, now);
      else if (topic === 'finance') data = await financeSnapshot(db, range, now);
      else if (topic === 'survey') data = await surveySnapshot(db, user, now);
      else if (topic === 'clients') data = await clientSnapshot(db, range, now);
      else if (topic === 'pipeline') data = await pipelineSnapshot(db, range, now);
      else if (topic === 'land') data = await landSnapshot(db, range, now);
      else if (topic === 'service') data = await serviceSnapshot(db, user, now);
      else data = await auditSnapshot(db, range, now);

      const resp = await fetch(baseUrl + '/chat/completions', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'authorization': 'Bearer ' + apiKey },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          messages: [
            { role: 'system', content: 'You are LandLedger Assistant. Answer only from the supplied JSON context. Never invent data.' },
            { role: 'user', content: JSON.stringify({ question, context: data }) }
          ]
        })
      });
      const json = await resp.json();
      const text = json.choices?.[0]?.message?.content || '';
      return {
        answer: text.trim() || 'I could not find that in the live office data.',
        topic,
        generatedBy: 'openai',
        data,
        suggestions: suggestionsFor(user, topic),
        tables: Object.keys(data || {}),
        elapsedMs: Date.now() - start
      };
    }
  };
}

export { assistantStatus, canUseTopic, parseQuestion };
/**
 * Grok (x.ai) API adapter. Configure with your API key in .env.
 * Usage in route.js: adapter = createGrokAdapter({ apiKey: process.env.GROK_API_KEY })
 * Grok uses OpenAI-compatible chat completions at https://api.x.ai/v1
 */
export function createGrokAdapter({ apiKey, model = 'grok-2-latest', baseUrl = 'https://api.x.ai/v1' } = {}) {
  if (!apiKey) throw new Error('Grok adapter requires an apiKey.');
  return {
    id: 'grok',
    async answer({ question, user, db, now = new Date() }) {
      const start = Date.now();
      const { topic, range } = parseQuestion(question);
      if (!canUseTopic(user, topic)) {
        return { answer: restrictedAnswer(topic), topic, generatedBy: 'grok', data: { restricted: true }, suggestions: topicSuggestions(user), tables: [], elapsedMs: Date.now() - start };
      }
      let data;
      if (topic === 'visitors') data = await visitorSnapshot(db, range, now);
      else if (topic === 'staff') data = await staffSnapshot(db, now);
      else if (topic === 'attendance') data = await attendanceSnapshot(db, range, user, now);
      else if (topic === 'finance') data = await financeSnapshot(db, range, now);
      else if (topic === 'survey') data = await surveySnapshot(db, user, now);
      else if (topic === 'clients') data = await clientSnapshot(db, range, now);
      else if (topic === 'pipeline') data = await pipelineSnapshot(db, range, now);
      else if (topic === 'land') data = await landSnapshot(db, range, now);
      else if (topic === 'service') data = await serviceSnapshot(db, user, now);
      else data = await auditSnapshot(db, range, now);

      const resp = await fetch(baseUrl + '/chat/completions', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'authorization': 'Bearer ' + apiKey },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          messages: [
            { role: 'system', content: 'You are LandLedger Assistant. Answer only from the supplied JSON context. Never invent data.' },
            { role: 'user', content: JSON.stringify({ question, context: data }) }
          ]
        })
      });
      const json = await resp.json();
      const text = json.choices?.[0]?.message?.content || '';
      return {
        answer: text.trim() || 'I could not find that in the live office data.',
        topic,
        generatedBy: 'grok',
        data,
        suggestions: suggestionsFor(user, topic),
        tables: Object.keys(data || {}),
        elapsedMs: Date.now() - start
      };
    }
  };
}
