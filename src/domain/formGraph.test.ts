import { describe, expect, it } from 'vitest'
import type { ActionBlueprintGraph } from '../types/actionBlueprintGraph'
import {
  buildFormGraphIndexes,
  collectUpstreamFormComponentKeys,
  getDirectPrerequisiteFormKeys,
  listFieldKeysFromFieldSchema,
} from './formGraph'

const sampleGraph: ActionBlueprintGraph = {
  id: 'bp',
  tenant_id: '1',
  name: 'Test',
  nodes: [
    {
      id: 'form-a',
      type: 'form',
      data: {
        id: 'c-a',
        component_key: 'form-a',
        component_type: 'form',
        component_id: 'f_a',
        name: 'Form A',
        prerequisites: [],
      },
    },
    {
      id: 'form-b',
      type: 'form',
      data: {
        id: 'c-b',
        component_key: 'form-b',
        component_type: 'form',
        component_id: 'f_b',
        name: 'Form B',
        prerequisites: ['form-a'],
      },
    },
    {
      id: 'form-d',
      type: 'form',
      data: {
        id: 'c-d',
        component_key: 'form-d',
        component_type: 'form',
        component_id: 'f_d',
        name: 'Form D',
        prerequisites: ['form-b'],
      },
    },
  ],
  edges: [],
  forms: [
    {
      id: 'f_d',
      name: 'Form def D',
      field_schema: {
        type: 'object',
        properties: {
          email: { type: 'string' },
          name: { type: 'string' },
        },
      },
    },
  ],
}

describe('formGraph', () => {
  it('collects direct prerequisites', () => {
    const indexes = buildFormGraphIndexes(sampleGraph)
    expect(getDirectPrerequisiteFormKeys(indexes, 'form-d')).toEqual(['form-b'])
  })

  it('collects transitive upstream forms in stable traversal order', () => {
    const indexes = buildFormGraphIndexes(sampleGraph)
    expect(collectUpstreamFormComponentKeys(indexes, 'form-d').allOrdered).toEqual(['form-b', 'form-a'])
  })

  it('lists field keys from jsonforms-style field_schema.properties', () => {
    expect(listFieldKeysFromFieldSchema(sampleGraph.forms[0])).toEqual(['email', 'name'])
  })
})
