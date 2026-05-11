import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PrefillPanel } from './PrefillPanel'
import type { ActionBlueprintGraph } from '../types/actionBlueprintGraph'

const tinyGraph: ActionBlueprintGraph = {
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
  ],
  edges: [],
  forms: [],
}

describe('PrefillPanel', () => {
  it('lets users request mapping for an empty field', async () => {
    const user = userEvent.setup()
    const onRequestMapField = vi.fn()

    render(
      <PrefillPanel
        graph={tinyGraph}
        fieldKeys={['email']}
        enabled
        fieldMappings={{}}
        onToggleEnabled={() => {}}
        onClearField={() => {}}
        onRequestMapField={onRequestMapField}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'email' }))
    expect(onRequestMapField).toHaveBeenCalledWith('email')
  })

  it('clears an existing mapping', async () => {
    const user = userEvent.setup()
    const onClearField = vi.fn()

    render(
      <PrefillPanel
        graph={tinyGraph}
        fieldKeys={['email']}
        enabled
        fieldMappings={{
          email: { kind: 'form-field', formComponentKey: 'form-a', fieldKey: 'name' },
        }}
        onToggleEnabled={() => {}}
        onClearField={onClearField}
        onRequestMapField={() => {}}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Clear mapping for email' }))
    expect(onClearField).toHaveBeenCalledWith('email')
  })
})
