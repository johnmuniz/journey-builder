import type { ActionBlueprintGraph } from '../types/actionBlueprintGraph'
import type { PrefillElementRef } from '../data-sources/types'
import { formatPrefillElementLabel } from '../domain/prefillLabels'

type Props = {
  graph: ActionBlueprintGraph
  fieldKeys: string[]
  enabled: boolean
  fieldMappings: Record<string, PrefillElementRef | undefined>
  onToggleEnabled: (enabled: boolean) => void
  onClearField: (fieldKey: string) => void
  onRequestMapField: (fieldKey: string) => void
}

function DbIcon() {
  return (
    <span aria-hidden="true" style={{ opacity: 0.55, fontSize: 14 }}>
      🗄
    </span>
  )
}

export function PrefillPanel(props: Props) {
  return (
    <section style={{ border: '1px solid #e6e6e6', borderRadius: 10, padding: 12 }}>
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Prefill</div>
          <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>Prefill fields for this form</div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <input
            type="checkbox"
            checked={props.enabled}
            onChange={(e) => props.onToggleEnabled(e.target.checked)}
          />
          Enabled
        </label>
      </header>

      <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
        {props.fieldKeys.map((fieldKey) => {
          const mapping = props.fieldMappings[fieldKey]
          const disabled = !props.enabled

          if (!mapping) {
            return (
              <button
                key={fieldKey}
                type="button"
                disabled={disabled}
                onClick={() => props.onRequestMapField(fieldKey)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px dashed #bcd7ff',
                  background: '#fbfdff',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                }}
              >
                <DbIcon />
                <span style={{ color: '#666', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                  {fieldKey}
                </span>
              </button>
            )
          }

          const sourceLabel = formatPrefillElementLabel(props.graph, mapping)

          return (
            <div
              key={fieldKey}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #e6e6e6',
                background: '#fafafa',
                opacity: disabled ? 0.55 : 1,
              }}
            >
              <div style={{ fontSize: 13 }}>
                <span style={{ fontWeight: 600 }}>{fieldKey}</span>
                <span style={{ color: '#666' }}>: </span>
                <span>{sourceLabel}</span>
              </div>
              <button
                type="button"
                disabled={disabled}
                aria-label={`Clear mapping for ${fieldKey}`}
                onClick={() => props.onClearField(fieldKey)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  border: '1px solid #ddd',
                  background: 'white',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                }}
              >
                ×
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
