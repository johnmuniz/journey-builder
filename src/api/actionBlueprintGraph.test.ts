import { describe, expect, it } from 'vitest'
import { buildActionBlueprintGraphUrl } from './actionBlueprintGraph'

describe('buildActionBlueprintGraphUrl', () => {
  it('builds the mock-server compatible URL when version is omitted', () => {
    expect(
      buildActionBlueprintGraphUrl({
        baseUrl: 'http://localhost:3000',
        tenantId: '1',
        actionBlueprintId: 'bp_456',
      }),
    ).toBe('http://localhost:3000/api/v1/1/actions/blueprints/bp_456/graph')
  })

  it('builds the documented versioned URL when version is provided', () => {
    expect(
      buildActionBlueprintGraphUrl({
        baseUrl: 'https://example.com/',
        tenantId: 't_1',
        actionBlueprintId: 'bp_456',
        blueprintVersionId: 'bpv_123',
      }),
    ).toBe('https://example.com/api/v1/t_1/actions/blueprints/bp_456/bpv_123/graph')
  })
})
