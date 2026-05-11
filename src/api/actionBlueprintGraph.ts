import type { ActionBlueprintGraph } from '../types/actionBlueprintGraph'

export type FetchGraphParams = {
  baseUrl: string
  tenantId: string
  actionBlueprintId: string
  /** When set, matches the documented path segment before `/graph`. The reference mock server omits this segment. */
  blueprintVersionId?: string
}

export function buildActionBlueprintGraphUrl(params: FetchGraphParams): string {
  const root = params.baseUrl.replace(/\/$/, '')
  const path =
    params.blueprintVersionId === undefined || params.blueprintVersionId === ''
      ? `/api/v1/${encodeURIComponent(params.tenantId)}/actions/blueprints/${encodeURIComponent(params.actionBlueprintId)}/graph`
      : `/api/v1/${encodeURIComponent(params.tenantId)}/actions/blueprints/${encodeURIComponent(params.actionBlueprintId)}/${encodeURIComponent(params.blueprintVersionId)}/graph`
  return `${root}${path}`
}

export async function fetchActionBlueprintGraph(
  params: FetchGraphParams,
  init?: RequestInit,
): Promise<ActionBlueprintGraph> {
  const url = buildActionBlueprintGraphUrl(params)
  const response = await fetch(url, init)
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Failed to load blueprint graph (${response.status}): ${text || url}`)
  }
  return (await response.json()) as ActionBlueprintGraph
}
