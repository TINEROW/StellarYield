import { resolveFallbackTree, type FallbackContext, type FallbackResult, type FallbackTreeNode } from './fallbackTreeService';

export interface ProtocolProvider {
  id: string;
  priority: number;
  check: (context: FallbackContext) => Promise<FallbackResult | boolean> | FallbackResult | boolean;
}

export function createProtocolFailoverService(providers: ProtocolProvider[]) {
  const root: FallbackTreeNode = {
    id: 'protocol-root',
    priority: 0,
    children: providers.map((p) => ({
      id: p.id,
      priority: p.priority,
      check: p.check,
    })),
  };

  return {
    resolve: (context: FallbackContext) => resolveFallbackTree(root, context),
  };
}
