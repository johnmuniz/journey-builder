/**
 * Extensible prefill picker model.
 *
 * Add new sources by registering additional `PrefillDataSourceFactory` implementations
 * (see `src/data-sources/defaultFactories.ts`).
 */

export type PrefillElementRef =
  | {
      kind: 'form-field'
      formComponentKey: string
      fieldKey: string
    }
  | {
      kind: 'global-property'
      scope: 'action' | 'client_org'
      key: string
    }

export type PickerBranchNode = {
  nodeType: 'branch'
  id: string
  label: string
  children: PickerNode[]
}

export type PickerLeafNode = {
  nodeType: 'leaf'
  id: string
  label: string
  ref: PrefillElementRef
}

export type PickerNode = PickerBranchNode | PickerLeafNode

export type PrefillPickerContext = {
  graph: import('../types/actionBlueprintGraph').ActionBlueprintGraph
  targetFormComponentKey: string
}

export type PrefillDataSourceFactory = {
  id: string
  /**
   * Return `null` to skip contributing nodes for this graph/target pair.
   */
  build(context: PrefillPickerContext): PickerNode[] | null
}

export function isLeaf(node: PickerNode): node is PickerLeafNode {
  return node.nodeType === 'leaf'
}

export function filterPickerTree(nodes: PickerNode[], query: string): PickerNode[] {
  const q = query.trim().toLowerCase()
  if (!q) return nodes

  const filterNode = (node: PickerNode): PickerNode | null => {
    if (node.nodeType === 'leaf') {
      return node.label.toLowerCase().includes(q) ? node : null
    }
    const nextChildren = node.children.map(filterNode).filter(Boolean) as PickerNode[]
    const selfMatch = node.label.toLowerCase().includes(q)
    if (selfMatch) return node
    if (nextChildren.length === 0) return null
    return { ...node, children: nextChildren }
  }

  return nodes.map(filterNode).filter(Boolean) as PickerNode[]
}
