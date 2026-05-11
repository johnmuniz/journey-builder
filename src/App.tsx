import { useMemo, useState } from 'react'
import './App.css'
import { useActionBlueprintGraph } from './hooks/useActionBlueprintGraph'
import { usePrefillEditorState } from './hooks/usePrefillEditorState'
import { buildFormGraphIndexes, getFormDefinitionForNode, listFieldKeysFromFieldSchema } from './domain/formGraph'
import { isFormNode } from './types/actionBlueprintGraph'
import { PrefillPanel } from './components/PrefillPanel'
import { DataElementPickerModal } from './components/DataElementPickerModal'
import {
  buildDefaultPickerTree,
  globalPropertiesFactory,
  upstreamFormFieldsFactory,
} from './data-sources/defaultFactories'
import type { PrefillDataSourceFactory } from './data-sources/types'

const defaultFactories: readonly PrefillDataSourceFactory[] = [
  globalPropertiesFactory,
  upstreamFormFieldsFactory,
]

function readOptionalEnv(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

export default function App() {
  const fetchParams = useMemo(() => {
    const version = readOptionalEnv(import.meta.env.VITE_BLUEPRINT_VERSION_ID)
    return {
      baseUrl: readOptionalEnv(import.meta.env.VITE_API_BASE_URL) ?? 'http://localhost:3000',
      tenantId: readOptionalEnv(import.meta.env.VITE_TENANT_ID) ?? '1',
      actionBlueprintId: readOptionalEnv(import.meta.env.VITE_ACTION_BLUEPRINT_ID) ?? 'bp_456',
      blueprintVersionId: version,
    }
  }, [])

  const { data, error, isLoading, reload } = useActionBlueprintGraph(fetchParams)
  const prefill = usePrefillEditorState()

  const [selectedFormKey, setSelectedFormKey] = useState<string | undefined>(undefined)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pendingFieldKey, setPendingFieldKey] = useState<string | undefined>(undefined)

  const formNodes = useMemo(() => {
    if (!data) return []
    return data.nodes.filter(isFormNode).sort((a, b) => a.data.name.localeCompare(b.data.name))
  }, [data])

  const selectedNode = useMemo(() => {
    if (!data || !selectedFormKey) return undefined
    return formNodes.find((n) => n.id === selectedFormKey)
  }, [data, formNodes, selectedFormKey])

  const fieldKeys = useMemo(() => {
    if (!data || !selectedFormKey) return []
    const indexes = buildFormGraphIndexes(data)
    const formDef = getFormDefinitionForNode(indexes, selectedFormKey)
    return listFieldKeysFromFieldSchema(formDef)
  }, [data, selectedFormKey])

  const pickerRoots = useMemo(() => {
    if (!data || !selectedFormKey) return []
    return buildDefaultPickerTree(data, selectedFormKey, defaultFactories)
  }, [data, selectedFormKey])

  const selectedState = selectedFormKey ? prefill.ensureForm(selectedFormKey) : undefined

  return (
    <div className="appShell">
      <header className="appHeader">
        <div>
          <div className="appTitle">Journey builder (prefill challenge)</div>
          <div className="appSubtitle">
            Graph: <code>{fetchParams.baseUrl}</code> · tenant <code>{fetchParams.tenantId}</code> · blueprint{' '}
            <code>{fetchParams.actionBlueprintId}</code>
            {fetchParams.blueprintVersionId ? (
              <>
                {' '}
                · version <code>{fetchParams.blueprintVersionId}</code>
              </>
            ) : null}
          </div>
        </div>
        <button type="button" className="btn" onClick={reload} disabled={isLoading}>
          Reload graph
        </button>
      </header>

      {isLoading ? <div className="banner">Loading blueprint graph…</div> : null}
      {error ? (
        <div className="banner error">
          <div style={{ fontWeight: 700 }}>Could not load graph</div>
          <div style={{ marginTop: 6 }}>{error.message}</div>
          <div style={{ marginTop: 8, fontSize: 13 }}>
            Start the mock server: <code>npm start</code> in{' '}
            <a href="https://github.com/mosaic-avantos/frontendchallengeserver" target="_blank" rel="noreferrer">
              mosaic-avantos/frontendchallengeserver
            </a>{' '}
            (defaults to port 3000).
          </div>
        </div>
      ) : null}

      <div className="layout">
        <aside className="sidebar">
          <div className="sidebarTitle">Forms</div>
          <div className="muted" style={{ fontSize: 13, marginBottom: 10 }}>
            {data ? `${formNodes.length} forms` : '—'}
          </div>
          <ul className="formList">
            {formNodes.map((node) => {
              const active = node.id === selectedFormKey
              return (
                <li key={node.id}>
                  <button
                    type="button"
                    className={`formListButton ${active ? 'active' : ''}`}
                    onClick={() => setSelectedFormKey(node.id)}
                  >
                    <div style={{ fontWeight: 650 }}>{node.data.name}</div>
                    <div className="mono muted" style={{ fontSize: 12, marginTop: 4 }}>
                      {node.id}
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </aside>

        <main className="main">
          {!selectedNode ? (
            <div className="muted">Select a form to edit prefill mappings.</div>
          ) : (
            <>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 18, fontWeight: 750 }}>{selectedNode.data.name}</div>
                <div className="mono muted" style={{ fontSize: 12, marginTop: 4 }}>
                  component_key: {selectedNode.data.component_key}
                </div>
              </div>

              <PrefillPanel
                graph={data!}
                fieldKeys={fieldKeys}
                enabled={selectedState?.enabled ?? true}
                fieldMappings={selectedState?.fieldMappings ?? {}}
                onToggleEnabled={(enabled) => prefill.setEnabled(selectedNode.id, enabled)}
                onClearField={(fieldKey) => prefill.clearMapping(selectedNode.id, fieldKey)}
                onRequestMapField={(fieldKey) => {
                  setPendingFieldKey(fieldKey)
                  setPickerOpen(true)
                }}
              />
            </>
          )}
        </main>
      </div>

      <DataElementPickerModal
        open={pickerOpen}
        remountKey={`${selectedFormKey ?? ''}:${pendingFieldKey ?? ''}`}
        roots={pickerRoots}
        onClose={() => {
          setPickerOpen(false)
          setPendingFieldKey(undefined)
        }}
        onConfirm={(leaf) => {
          if (!selectedNode || !pendingFieldKey) return
          prefill.setMapping(selectedNode.id, pendingFieldKey, leaf.ref)
          setPickerOpen(false)
          setPendingFieldKey(undefined)
        }}
      />
    </div>
  )
}
