import type { ActionBlueprintGraph } from '../types/actionBlueprintGraph'
import { isFormNode } from '../types/actionBlueprintGraph'
import { buildFormGraphIndexes, collectUpstreamFormComponentKeys } from '../domain/formGraph'
import type { PrefillDataSourceFactory, PickerNode, PrefillPickerContext } from './types'

function upstreamFormFieldSources(context: PrefillPickerContext): PickerNode[] {
  const indexes = buildFormGraphIndexes(context.graph)
  const { allOrdered } = collectUpstreamFormComponentKeys(indexes, context.targetFormComponentKey)

  const groups: PickerNode[] = []
  const keysSortedByLabel = [...allOrdered].sort((a, b) => {
    const na = indexes.nodeById.get(a)
    const nb = indexes.nodeById.get(b)
    const la = na && isFormNode(na) ? na.data.name : a
    const lb = nb && isFormNode(nb) ? nb.data.name : b
    return la.localeCompare(lb)
  })

  for (const componentKey of keysSortedByLabel) {
    const node = indexes.nodeById.get(componentKey)
    if (!node || !isFormNode(node)) continue

    const formDef = indexes.formDefinitionById.get(node.data.component_id)
    const props = formDef?.field_schema?.properties
    const fieldKeys =
      props && typeof props === 'object' ? Object.keys(props as Record<string, unknown>) : []

    const children: PickerNode[] = fieldKeys.map((fieldKey) => ({
      nodeType: 'leaf' as const,
      id: `form-field:${componentKey}:${fieldKey}`,
      label: fieldKey,
      ref: { kind: 'form-field', formComponentKey: componentKey, fieldKey },
    }))

    groups.push({
      nodeType: 'branch',
      id: `form:${componentKey}`,
      label: node.data.name,
      children,
    })
  }

  return groups
}

export const upstreamFormFieldsFactory: PrefillDataSourceFactory = {
  id: 'upstream-form-fields',
  build(context) {
    return upstreamFormFieldSources(context)
  },
}

function globalPropertyLeaves(
  scope: 'action' | 'client_org',
  keys: readonly string[],
): PickerNode[] {
  return keys.map((key) => ({
    nodeType: 'leaf' as const,
    id: `global:${scope}:${key}`,
    label: key,
    ref: { kind: 'global-property', scope, key },
  }))
}

/**
 * Placeholder global namespaces (challenge allows arbitrary global data here).
 */
export const globalPropertiesFactory: PrefillDataSourceFactory = {
  id: 'global-properties',
  build(context: PrefillPickerContext) {
    void context
    return [
      {
        nodeType: 'branch',
        id: 'global-action-props',
        label: 'Action Properties',
        children: globalPropertyLeaves('action', ['run_id', 'initiated_by', 'status']),
      },
      {
        nodeType: 'branch',
        id: 'global-client-org-props',
        label: 'Client Organisation Properties',
        children: globalPropertyLeaves('client_org', ['org_id', 'org_name', 'region']),
      },
    ]
  },
}

export function buildDefaultPickerTree(
  graph: ActionBlueprintGraph,
  targetFormComponentKey: string,
  factories: readonly PrefillDataSourceFactory[],
): PickerNode[] {
  const context: PrefillPickerContext = { graph, targetFormComponentKey }
  const roots: PickerNode[] = []
  for (const factory of factories) {
    const nodes = factory.build(context)
    if (!nodes) continue
    roots.push(...nodes)
  }
  return roots
}
