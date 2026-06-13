import type { CairnGraph } from './graph.js';
import type { ComponentBrief, ResumeBrief } from './types.js';

/**
 * Distil the graph into the brief a fresh, context-free session reads to
 * "remember" the project. This is the heart of Cairn's continuity: an agent
 * with zero conversation history reads this and knows exactly where things stand.
 */
export function summarizeForResume(graph: CairnGraph): ResumeBrief {
  const goals = graph.query({ type: 'goal' });
  const acceptedDecisions = graph.query({ type: 'decision', status: 'accepted' });
  const openQuestions = graph.openQuestions();
  const risks = graph.query({ type: 'risk' });

  const components: ComponentBrief[] = graph.query({ type: 'component' }).map((node) => ({
    node,
    status: node.status,
    dependsOn: graph.neighbors(node.id, { edge: 'depends_on', direction: 'out' }).map((n) => n.id),
  }));

  const nextActions: string[] = [];
  for (const question of openQuestions) {
    nextActions.push(`Answer open question: ${question.title}`);
  }
  for (const component of components) {
    if (component.status !== 'done' && component.status !== 'superseded') {
      nextActions.push(`Implement component: ${component.node.title}`);
    }
  }
  for (const risk of risks) {
    nextActions.push(`Mitigate risk: ${risk.title}`);
  }

  return { goals, acceptedDecisions, openQuestions, components, risks, nextActions };
}
