import { resolveFallbackTree } from './fallbackTreeService';

export interface ProtocolProvider {
  id: string;
  priority: number;
  check: (context: any) => Promise<any> | any;
}

export function createProtocolFailoverService(providers: ProtocolProvider[]) {
  const root = {
    id: 'protocol-root',
    priority: 0,
    children: providers.map((p) => ({
      id: p.id,
      priority: p.priority,
      check: p.check,
    })),
  };

  return {
    resolve: (context: any) => resolveFallbackTree(root, context),
  };
}
