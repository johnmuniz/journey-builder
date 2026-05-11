import type { ActionBlueprintGraph } from '../types/actionBlueprintGraph'
import { isFormNode } from '../types/actionBlueprintGraph'
import { buildFormGraphIndexes } from '../domain/formGraph'
import type { PrefillElementRef } from '../data-sources/types'

export function formatPrefillElementLabel(
  graph: ActionBlueprintGraph,
  ref: PrefillElementRef,
): string {
  if (ref.kind === 'form-field') {
    const indexes = buildFormGraphIndexes(graph)
    const node = indexes.nodeById.get(ref.formComponentKey)
    const formName = node && isFormNode(node) ? node.data.name : ref.formComponentKey
    return `${formName}.${ref.fieldKey}`
  }

  const scopeLabel = ref.scope === 'action' ? 'Action' : 'Client Org'
  return `${scopeLabel}.${ref.key}`
}
