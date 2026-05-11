import { useMemo, useState } from 'react'
import type { PickerLeafNode, PickerNode } from '../data-sources/types'
import { filterPickerTree, isLeaf } from '../data-sources/types'

export type DataElementPickerModalProps = {
  open: boolean
  /** Forces a fresh picker state when the mapping session changes while staying mounted. */
  remountKey: string
  title?: string
  roots: PickerNode[]
  onClose: () => void
  onConfirm: (selection: PickerLeafNode) => void
}

function collectBranchIds(nodes: PickerNode[]): string[] {
  const ids: string[] = []
  const walk = (n: PickerNode) => {
    if (n.nodeType === 'branch') {
      ids.push(n.id)
      n.children.forEach(walk)
    }
  }
  nodes.forEach(walk)
  return ids
}

function PickerTree(props: {
  nodes: PickerNode[]
  depth: number
  expanded: Set<string>
  onToggle: (id: string) => void
  selectedLeafId?: string
  onSelectLeaf: (leaf: PickerLeafNode) => void
}) {
  return (
    <ul style={{ listStyle: 'none', paddingLeft: props.depth === 0 ? 0 : 14, margin: 0 }}>
      {props.nodes.map((node) => {
        if (isLeaf(node)) {
          const selected = node.id === props.selectedLeafId
          return (
            <li key={node.id} style={{ margin: '4px 0' }}>
              <button
                type="button"
                onClick={() => props.onSelectLeaf(node)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  border: '1px solid transparent',
                  background: selected ? '#e8f2ff' : 'transparent',
                  cursor: 'pointer',
                  padding: '6px 8px',
                  borderRadius: 6,
                }}
              >
                {node.label}
              </button>
            </li>
          )
        }

        const expanded = props.expanded.has(node.id)
        return (
          <li key={node.id} style={{ margin: '6px 0' }}>
            <button
              type="button"
              onClick={() => props.onToggle(node.id)}
              style={{
                width: '100%',
                textAlign: 'left',
                background: '#fafafa',
                border: '1px solid #e6e6e6',
                padding: '6px 8px',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              <span style={{ display: 'inline-block', width: 16 }}>{expanded ? '▾' : '▸'}</span>
              {node.label}
            </button>
            {expanded ? (
              <PickerTree
                nodes={node.children}
                depth={props.depth + 1}
                expanded={props.expanded}
                onToggle={props.onToggle}
                selectedLeafId={props.selectedLeafId}
                onSelectLeaf={props.onSelectLeaf}
              />
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

function DataElementPickerModalSession(props: Omit<DataElementPickerModalProps, 'open' | 'remountKey'>) {
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(collectBranchIds(props.roots)))
  const [selectedLeaf, setSelectedLeaf] = useState<PickerLeafNode | undefined>(undefined)

  const visibleRoots = useMemo(() => filterPickerTree(props.roots, query), [props.roots, query])

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.35)',
        display: 'grid',
        placeItems: 'center',
        padding: 16,
        zIndex: 50,
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) props.onClose()
      }}
    >
      <div
        style={{
          width: 'min(920px, 100%)',
          maxHeight: 'min(720px, 100%)',
          background: 'white',
          borderRadius: 10,
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          display: 'grid',
          gridTemplateRows: 'auto 1fr auto',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #eee' }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{props.title ?? 'Select data element to map'}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: 12, minHeight: 360 }}>
          <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 10, overflow: 'auto' }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Available data</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
              <span aria-hidden="true">🔎</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd' }}
              />
            </div>
            <PickerTree
              nodes={visibleRoots}
              depth={0}
              expanded={expanded}
              onToggle={toggle}
              selectedLeafId={selectedLeaf?.id}
              onSelectLeaf={setSelectedLeaf}
            />
          </div>

          <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 10, overflow: 'auto' }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Selection</div>
            {!selectedLeaf ? (
              <div style={{ color: '#777', fontSize: 13 }}>Pick a field to preview the mapping target.</div>
            ) : (
              <pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(selectedLeaf.ref, null, 2)}
              </pre>
            )}
          </div>
        </div>

        <div style={{ padding: '12px 16px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" onClick={props.onClose} style={{ padding: '8px 12px' }}>
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedLeaf}
            onClick={() => {
              if (!selectedLeaf) return
              props.onConfirm(selectedLeaf)
            }}
            style={{ padding: '8px 12px' }}
          >
            Select
          </button>
        </div>
      </div>
    </div>
  )
}

export function DataElementPickerModal(props: DataElementPickerModalProps) {
  if (!props.open) return null

  const { remountKey, roots, title, onClose, onConfirm } = props

  return (
    <DataElementPickerModalSession
      key={remountKey}
      roots={roots}
      title={title}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  )
}
