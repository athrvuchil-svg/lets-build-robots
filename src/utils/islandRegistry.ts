export type IslandDestroyer = () => void;

declare global {
  interface Window {
    __LBR_ACTIVE_TOOL__?: IslandDestroyer;
    __LBR_ACTIVE_TOOL_NAME__?: string;
  }
}

/** Destroy the currently mounted simulator/playground, if one exists. */
export function clearActiveIsland(): void {
  if (typeof window === 'undefined') return;

  const destroy = window.__LBR_ACTIVE_TOOL__;
  window.__LBR_ACTIVE_TOOL__ = undefined;
  window.__LBR_ACTIVE_TOOL_NAME__ = undefined;
  destroy?.();
}

/** Register one island and tear down any previous island first. */
export function registerActiveIsland(name: string, destroy: IslandDestroyer): void {
  if (typeof window === 'undefined') return;

  clearActiveIsland();
  window.__LBR_ACTIVE_TOOL_NAME__ = name;
  window.__LBR_ACTIVE_TOOL__ = destroy;
}
