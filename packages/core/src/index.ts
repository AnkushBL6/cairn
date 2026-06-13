/**
 * @cairn/core — the knowledge-graph engine behind Cairn.
 *
 * Pure, deterministic, dependency-free. Everything that persists, renders, or
 * reasons about a Cairn project's "brain" lives here.
 */

export * from './types.js';
export { CairnGraph } from './graph.js';
export { makeEdgeId, makeNodeId, slugify } from './ids.js';
export { isLegalEdge } from './edge-rules.js';
export { renderDesignDoc, renderMermaid } from './render.js';
export { summarizeForResume } from './resume.js';
export {
  classifyTestFailure,
  type FailureClassification,
  type FailureKind,
} from './classify-failure.js';
