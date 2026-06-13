/**
 * The interview model: a structured set of questions the agent composes and the
 * studio renders. Pure data + validation, so it can be reasoned about and tested
 * without any server or browser.
 */

export type QuestionKind = 'text' | 'longtext' | 'single' | 'multi' | 'scale' | 'boolean';

export interface Choice {
  value: string;
  label: string;
  description?: string;
}

export interface Question {
  id: string;
  kind: QuestionKind;
  prompt: string;
  help?: string;
  required?: boolean;
  choices?: Choice[];
  min?: number;
  max?: number;
  placeholder?: string;
}

export interface Interview {
  sessionId: string;
  title: string;
  intro?: string;
  questions: Question[];
}

export type AnswerValue = string | string[] | number | boolean;

export interface Answer {
  questionId: string;
  value: AnswerValue;
  answeredAt?: string;
}

export interface Transcript {
  sessionId: string;
  title: string;
  answers: Answer[];
  finishedAt?: string;
}

/** Throw if the interview is malformed in a way the wizard couldn't render. */
export function validateInterview(interview: Interview): void {
  if (!interview.questions || interview.questions.length === 0) {
    throw new Error('Cairn interview has no questions.');
  }
  const seen = new Set<string>();
  for (const question of interview.questions) {
    if (seen.has(question.id)) {
      throw new Error(`Cairn interview has a duplicate question id: "${question.id}".`);
    }
    seen.add(question.id);

    if ((question.kind === 'single' || question.kind === 'multi') && !hasChoices(question)) {
      throw new Error(`Question "${question.id}" is ${question.kind} but has no choices.`);
    }
    if (question.kind === 'scale' && !hasValidRange(question)) {
      throw new Error(`Question "${question.id}" is a scale but has an invalid numeric range.`);
    }
  }
}

function hasChoices(question: Question): boolean {
  return Array.isArray(question.choices) && question.choices.length > 0;
}

function hasValidRange(question: Question): boolean {
  return (
    typeof question.min === 'number' &&
    typeof question.max === 'number' &&
    question.min < question.max
  );
}

/** Whether a submitted value is acceptable for a question. Used to reject bad answers server-side. */
export function isAnswerValid(question: Question, value: unknown): boolean {
  switch (question.kind) {
    case 'text':
    case 'longtext': {
      if (typeof value !== 'string') return false;
      return question.required ? value.trim().length > 0 : true;
    }
    case 'single': {
      if (typeof value !== 'string') return false;
      return (question.choices ?? []).some((choice) => choice.value === value);
    }
    case 'multi': {
      if (!Array.isArray(value)) return false;
      const allowed = new Set((question.choices ?? []).map((choice) => choice.value));
      const allKnown = value.every((item) => typeof item === 'string' && allowed.has(item));
      return question.required ? allKnown && value.length > 0 : allKnown;
    }
    case 'scale': {
      if (typeof value !== 'number' || Number.isNaN(value)) return false;
      const min = question.min ?? Number.NEGATIVE_INFINITY;
      const max = question.max ?? Number.POSITIVE_INFINITY;
      return value >= min && value <= max;
    }
    case 'boolean':
      return typeof value === 'boolean';
  }
}
