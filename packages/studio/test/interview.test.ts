import { describe, expect, it } from 'vitest';
import {
  type Interview,
  type Question,
  isAnswerValid,
  validateInterview,
} from '../src/interview.js';

function baseInterview(questions: Question[]): Interview {
  return { sessionId: 's1', title: 'Test', questions };
}

describe('validateInterview', () => {
  it('accepts a well-formed interview', () => {
    const interview = baseInterview([
      { id: 'q1', kind: 'text', prompt: 'Name?' },
      { id: 'q2', kind: 'single', prompt: 'Pick', choices: [{ value: 'a', label: 'A' }] },
    ]);
    expect(() => validateInterview(interview)).not.toThrow();
  });

  it('rejects an interview with no questions', () => {
    expect(() => validateInterview(baseInterview([]))).toThrow(/no questions/i);
  });

  it('rejects duplicate question ids', () => {
    const interview = baseInterview([
      { id: 'dup', kind: 'text', prompt: 'A' },
      { id: 'dup', kind: 'text', prompt: 'B' },
    ]);
    expect(() => validateInterview(interview)).toThrow(/duplicate/i);
  });

  it('rejects single/multi questions without choices', () => {
    const interview = baseInterview([{ id: 'q', kind: 'single', prompt: 'Pick' }]);
    expect(() => validateInterview(interview)).toThrow(/choices/i);
  });

  it('rejects scale questions without a valid numeric range', () => {
    const interview = baseInterview([{ id: 'q', kind: 'scale', prompt: 'Rate', min: 5, max: 1 }]);
    expect(() => validateInterview(interview)).toThrow(/range/i);
  });
});

describe('isAnswerValid', () => {
  it('validates required text', () => {
    const q: Question = { id: 'q', kind: 'text', prompt: 'Name?', required: true };
    expect(isAnswerValid(q, 'Ada')).toBe(true);
    expect(isAnswerValid(q, '   ')).toBe(false);
    expect(isAnswerValid(q, 42)).toBe(false);
  });

  it('validates single choice membership', () => {
    const q: Question = {
      id: 'q',
      kind: 'single',
      prompt: 'Pick',
      choices: [{ value: 'a', label: 'A' }],
    };
    expect(isAnswerValid(q, 'a')).toBe(true);
    expect(isAnswerValid(q, 'z')).toBe(false);
  });

  it('validates multi choice membership', () => {
    const q: Question = {
      id: 'q',
      kind: 'multi',
      prompt: 'Pick',
      choices: [
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B' },
      ],
    };
    expect(isAnswerValid(q, ['a', 'b'])).toBe(true);
    expect(isAnswerValid(q, ['a', 'z'])).toBe(false);
  });

  it('validates scale bounds', () => {
    const q: Question = { id: 'q', kind: 'scale', prompt: 'Rate', min: 1, max: 5 };
    expect(isAnswerValid(q, 3)).toBe(true);
    expect(isAnswerValid(q, 9)).toBe(false);
  });

  it('validates boolean', () => {
    const q: Question = { id: 'q', kind: 'boolean', prompt: 'Yes?' };
    expect(isAnswerValid(q, true)).toBe(true);
    expect(isAnswerValid(q, 'true')).toBe(false);
  });
});
