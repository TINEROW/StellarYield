import { resolveFallbackTree, type FallbackContext, type FallbackResult, type FallbackTreeNode } from './fallbackTreeService';

export interface ProtocolProvider {
  id: string;
  priority: number;
  check: (context: FallbackContext) => Promise<FallbackResult | boolean> | FallbackResult | boolean;
}

const enrich = (r: FallbackResult, id: string, reason?: string): FallbackResult => {
  const x = r as any;
  return { ...x, providerId: x.providerId ?? id, reason: reason ?? x.reason ?? `Provider '${id}'` } as FallbackResult;
};

const normalize = (p: ProtocolProvider): FallbackTreeNode['check'] => async (context: FallbackContext) => {
  try {
    const res = await p.check(context);
    if (res === true) return enrich({ accepted: true }, p.id, `Provider '${p.id}' accepted`);
    if (res === false) return enrich({ accepted: false }, p.id, `Provider '${p.id}' rejected`);
    return enrich(res, p.id);
  } catch (e) {
    return enrich({ accepted: false }, p.id, `Provider '${p.id}' threw: ${
      (e as Error).message ?? String(e)
}`);
  }
};

export function createProtocolFailoverService(providers: ProtocolProvider[]) {
  const sorted = [...providers].sort((a, b) => a.priority - b.priority || a.id.localeCompare(b));
  return {
    resolve: (context: FallbackContext) => resolveFallbackTree({
      id: 'protocol-root',
      priority: 0,
      children: sorted.map(p => ({ id: p.id, priority: p.priority, check: normalize(p) })),
    }, context),
  };
}
