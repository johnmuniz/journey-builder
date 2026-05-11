/**
 * Partial types for the action blueprint graph payload.
 * @see https://admin-ui.dev-sandbox.workload.avantos-ai.net/docs#/operations/action-blueprint-graph-get
 */

export type JsonSchemaProperties = Record<string, unknown>

export type ActionFormFieldSchema = {
  type?: string
  properties?: JsonSchemaProperties
}

export type ActionFormDescription = {
  id: string
  name: string
  description?: string
  field_schema: ActionFormFieldSchema
}

export type FormNodeData = {
  id: string
  component_key: string
  component_type: string
  component_id: string
  name: string
  prerequisites: string[]
}

export type GraphNode = {
  id: string
  type: string
  data: FormNodeData | Record<string, unknown>
}

export type GraphEdge = {
  source: string
  target: string
}

export type ActionBlueprintGraph = {
  id: string
  tenant_id: string
  name: string
  nodes: GraphNode[]
  edges: GraphEdge[]
  forms: ActionFormDescription[]
}

export function isFormNode(node: GraphNode): node is GraphNode & { data: FormNodeData } {
  return node.type === 'form' && typeof (node.data as FormNodeData).component_id === 'string'
}
