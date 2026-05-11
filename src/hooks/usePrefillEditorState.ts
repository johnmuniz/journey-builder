import { useCallback, useMemo, useState } from 'react'
import type { PrefillElementRef } from '../data-sources/types'

export type PrefillFieldMappings = Record<string, PrefillElementRef | undefined>

export type FormPrefillState = {
  enabled: boolean
  fieldMappings: PrefillFieldMappings
}

export type PrefillEditorState = Record<string, FormPrefillState>

function emptyFormState(): FormPrefillState {
  return { enabled: true, fieldMappings: {} }
}

/**
 * Local editor state for prefill toggles + per-field mappings, keyed by form component key.
 */
export function usePrefillEditorState() {
  const [byForm, setByForm] = useState<PrefillEditorState>({})

  const ensureForm = useCallback((formComponentKey: string): FormPrefillState => {
    return byForm[formComponentKey] ?? emptyFormState()
  }, [byForm])

  const setEnabled = useCallback((formComponentKey: string, enabled: boolean) => {
    setByForm((prev) => {
      const current = prev[formComponentKey] ?? emptyFormState()
      return { ...prev, [formComponentKey]: { ...current, enabled } }
    })
  }, [])

  const setMapping = useCallback((formComponentKey: string, fieldKey: string, ref: PrefillElementRef) => {
    setByForm((prev) => {
      const current = prev[formComponentKey] ?? emptyFormState()
      return {
        ...prev,
        [formComponentKey]: {
          ...current,
          fieldMappings: { ...current.fieldMappings, [fieldKey]: ref },
        },
      }
    })
  }, [])

  const clearMapping = useCallback((formComponentKey: string, fieldKey: string) => {
    setByForm((prev) => {
      const current = prev[formComponentKey] ?? emptyFormState()
      const nextMappings = { ...current.fieldMappings }
      delete nextMappings[fieldKey]
      return { ...prev, [formComponentKey]: { ...current, fieldMappings: nextMappings } }
    })
  }, [])

  return useMemo(
    () => ({
      byForm,
      ensureForm,
      setEnabled,
      setMapping,
      clearMapping,
    }),
    [byForm, ensureForm, setEnabled, setMapping, clearMapping],
  )
}
