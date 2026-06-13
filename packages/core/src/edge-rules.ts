import type { EdgeType, NodeType } from './types.js';

/**
 * The legality table for edges. An edge is only allowed when its type makes
 * semantic sense for the (from-type → to-type) pair. This is a core integrity
 * guarantee: the graph can never encode a nonsensical relationship like
 * "a goal depends_on a goal".
 */
export function isLegalEdge(edge: EdgeType, from: NodeType, to: NodeType): boolean {
  switch (edge) {
    case 'refines':
      return from === 'requirement' && (to === 'goal' || to === 'requirement');
    case 'depends_on':
      return from === 'component' && to === 'component';
    case 'decided_by':
      return (
        (from === 'goal' ||
          from === 'requirement' ||
          from === 'component' ||
          from === 'constraint') &&
        to === 'decision'
      );
    case 'implements':
      return (
        (from === 'artifact' && (to === 'component' || to === 'requirement')) ||
        (from === 'component' && to === 'requirement')
      );
    case 'tests':
      return from === 'test' && (to === 'component' || to === 'requirement' || to === 'artifact');
    case 'blocks':
      return (
        (from === 'risk' || from === 'question' || from === 'constraint') &&
        (to === 'goal' || to === 'requirement' || to === 'component')
      );
    case 'supersedes':
      return (
        from === to &&
        (from === 'goal' ||
          from === 'requirement' ||
          from === 'decision' ||
          from === 'component' ||
          from === 'constraint')
      );
    case 'derived_from':
      return true;
  }
}
