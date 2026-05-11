import type { ActionBlueprintGraph, ActionFormDescription, GraphNode } from '../types/actionBlueprintGraph'
import { isFormNode } from '../types/actionBlueprintGraph'

export type FormGraphIndexes = {
  nodeById: Map<string, GraphNode>
  formDefinitionById: Map<string, ActionFormDescription>
}

export function buildFormGraphIndexes(graph: ActionBlueprintGraph): FormGraphIndexes {
  const nodeById = new Map(graph.nodes.map((n) => [n.id, n]))
  const formDefinitionById = new Map((graph.forms ?? []).map((f) => [f.id, f]))
  return { nodeById, formDefinitionById }
}

export function getFormDefinitionForNode(
  indexes: FormGraphIndexes,
  formComponentKey: string,
): ActionFormDescription | undefined {
  const node = indexes.nodeById.get(formComponentKey)
  if (!node || !isFormNode(node)) return undefined
  return indexes.formDefinitionById.get(node.data.component_id)
}

/**
 * Returns prerequisite form component keys for `targetFormComponentKey` (direct only).
 */
export function getDirectPrerequisiteFormKeys(
  indexes: FormGraphIndexes,
  targetFormComponentKey: string,
): string[] {
  const node = indexes.nodeById.get(targetFormComponentKey)
  if (!node || !isFormNode(node)) return []
  return (node.data.prerequisites ?? []).filter((key) => {
    const prereq = indexes.nodeById.get(key)
    return Boolean(prereq && isFormNode(prereq))
  })
}

/**
 * Collects all upstream form component keys reachable via prerequisites (direct and transitive).
 */
export function collectUpstreamFormComponentKeys(
  indexes: FormGraphIndexes,
  targetFormComponentKey: string,
): { direct: string[]; allOrdered: string[] } {
  const direct = getDirectPrerequisiteFormKeys(indexes, targetFormComponentKey)
  const visited = new Set<string>()
  const ordered: string[] = []

  const visit = (key: string) => {
    if (visited.has(key)) return
    visited.add(key)
    ordered.push(key)
    const node = indexes.nodeById.get(key)
    if (!node || !isFormNode(node)) return
    for (const p of node.data.prerequisites ?? []) {
      const prereqNode = indexes.nodeById.get(p)
      if (prereqNode && isFormNode(prereqNode)) visit(p)
    }
  }

  for (const d of direct) visit(d)

  return { direct, allOrdered: ordered }
}

export function listFieldKeysFromFieldSchema(form: ActionFormDescription | undefined): string[] {
  const props = form?.field_schema?.properties
  if (!props || typeof props !== 'object') return []
  return Object.keys(props)
}
