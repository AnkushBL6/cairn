import http from 'node:http';
import {
  type Answer,
  type Interview,
  isAnswerValid,
  type Question,
  type Transcript,
} from './interview.js';
import { renderWizard } from './wizard.js';

export interface StudioServerOptions {
  host?: string;
  port?: number;
}

interface AnswerBody {
  questionId?: unknown;
  value?: unknown;
}

/**
 * The live studio server: serves the wizard, records answers, streams follow-up
 * questions to the browser over SSE, and resolves a transcript when the user
 * finishes. The agent drives it; the server is a pretty, well-behaved conduit.
 */
export class StudioServer {
  private readonly interview: Interview;
  private readonly host: string;
  private readonly desiredPort: number;
  private readonly answers = new Map<string, Answer>();
  private readonly sseClients = new Set<http.ServerResponse>();
  private readonly finishWaiters: Array<(transcript: Transcript) => void> = [];
  private server: http.Server | undefined;
  private boundPort = 0;
  private finalTranscript: Transcript | undefined;

  constructor(interview: Interview, options: StudioServerOptions = {}) {
    this.interview = { ...interview, questions: [...interview.questions] };
    this.host = options.host ?? '127.0.0.1';
    this.desiredPort = options.port ?? 0;
  }

  get url(): string {
    return `http://${this.host}:${this.boundPort}`;
  }

  start(): Promise<{ url: string; port: number }> {
    const server = http.createServer((req, res) => {
      this.handle(req, res).catch(() => sendJson(res, 500, { error: 'internal error' }));
    });
    this.server = server;
    return new Promise((resolve, reject) => {
      server.on('error', reject);
      server.listen(this.desiredPort, this.host, () => {
        const address = server.address();
        this.boundPort = typeof address === 'object' && address ? address.port : this.desiredPort;
        resolve({ url: this.url, port: this.boundPort });
      });
    });
  }

  stop(): Promise<void> {
    const server = this.server;
    this.server = undefined;
    for (const client of this.sseClients) {
      try {
        client.end();
      } catch {
        /* client already gone */
      }
    }
    this.sseClients.clear();
    if (!server) return Promise.resolve();
    return new Promise((resolve) => {
      server.close(() => resolve());
      server.closeAllConnections();
    });
  }

  /** Answers recorded so far, in question order. */
  getAnswers(): Answer[] {
    const out: Answer[] = [];
    for (const question of this.interview.questions) {
      const answer = this.answers.get(question.id);
      if (answer) out.push(answer);
    }
    return out;
  }

  /** Append adaptive follow-up questions and notify the open browser over SSE. */
  pushQuestions(questions: Question[]): void {
    const added: Question[] = [];
    for (const question of questions) {
      if (!this.interview.questions.some((existing) => existing.id === question.id)) {
        this.interview.questions.push(question);
        added.push(question);
      }
    }
    if (added.length > 0) {
      this.broadcast('question', JSON.stringify(added));
    }
  }

  /** Resolves with the transcript when the user finishes the interview. */
  waitForFinish(): Promise<Transcript> {
    if (this.finalTranscript) return Promise.resolve(this.finalTranscript);
    return new Promise((resolve) => {
      this.finishWaiters.push(resolve);
    });
  }

  private async handle(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const { pathname } = new URL(req.url ?? '/', 'http://localhost');
    const method = req.method ?? 'GET';

    if (method === 'GET' && pathname === '/') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      res.end(renderWizard(this.interview, { mode: 'live' }));
      return;
    }
    if (method === 'GET' && pathname === '/api/health') {
      sendJson(res, 200, { ok: true });
      return;
    }
    if (method === 'GET' && pathname === '/api/interview') {
      sendJson(res, 200, this.interview);
      return;
    }
    if (method === 'GET' && pathname === '/api/events') {
      this.openSse(req, res);
      return;
    }
    if (method === 'POST' && pathname === '/api/answer') {
      await this.handleAnswer(req, res);
      return;
    }
    if (method === 'POST' && pathname === '/api/finish') {
      await this.handleFinish(req, res);
      return;
    }
    sendJson(res, 404, { error: 'not found' });
  }

  private async handleAnswer(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    let body: AnswerBody;
    try {
      body = (await readJson(req)) as AnswerBody;
    } catch {
      sendJson(res, 400, { error: 'invalid json' });
      return;
    }
    const question = this.interview.questions.find((q) => q.id === body.questionId);
    if (!question) {
      sendJson(res, 400, { error: 'unknown question' });
      return;
    }
    if (!isAnswerValid(question, body.value)) {
      sendJson(res, 400, { error: 'invalid answer' });
      return;
    }
    this.answers.set(question.id, {
      questionId: question.id,
      value: body.value as Answer['value'],
    });
    sendJson(res, 200, {
      ok: true,
      answered: this.answers.size,
      total: this.interview.questions.length,
    });
  }

  private async handleFinish(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    let body: Partial<Transcript> | undefined;
    try {
      body = (await readJson(req)) as Partial<Transcript>;
    } catch {
      body = undefined;
    }
    const transcript: Transcript =
      body && Array.isArray(body.answers)
        ? {
            sessionId: body.sessionId ?? this.interview.sessionId,
            title: body.title ?? this.interview.title,
            answers: body.answers,
            ...(body.finishedAt !== undefined ? { finishedAt: body.finishedAt } : {}),
          }
        : {
            sessionId: this.interview.sessionId,
            title: this.interview.title,
            answers: this.getAnswers(),
          };

    this.finalTranscript = transcript;
    for (const resolve of this.finishWaiters.splice(0)) {
      resolve(transcript);
    }
    this.broadcast('finish', '{}');
    sendJson(res, 200, { ok: true });
  }

  private openSse(req: http.IncomingMessage, res: http.ServerResponse): void {
    res.writeHead(200, {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      connection: 'keep-alive',
    });
    res.write(': cairn studio connected\n\n');
    this.sseClients.add(res);
    req.on('close', () => {
      this.sseClients.delete(res);
    });
  }

  private broadcast(event: string, data: string): void {
    for (const client of this.sseClients) {
      try {
        client.write(`event: ${event}\ndata: ${data}\n\n`);
      } catch {
        this.sseClients.delete(client);
      }
    }
  }
}

function sendJson(res: http.ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        req.destroy();
        reject(new Error('payload too large'));
      }
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

async function readJson(req: http.IncomingMessage): Promise<unknown> {
  const raw = await readBody(req);
  return raw ? JSON.parse(raw) : {};
}
