import { useCallback, useEffect, useState } from 'react'
import { fetchActionBlueprintGraph, type FetchGraphParams } from '../api/actionBlueprintGraph'
import type { ActionBlueprintGraph } from '../types/actionBlueprintGraph'

export type UseActionBlueprintGraphResult = {
  data: ActionBlueprintGraph | undefined
  error: Error | undefined
  isLoading: boolean
  reload: () => void
}

/**
 * Loads the blueprint graph from the configured API base URL.
 * Keep fetch logic out of UI components: this hook owns request lifecycle + state.
 */
export function useActionBlueprintGraph(params: FetchGraphParams): UseActionBlueprintGraphResult {
  const { baseUrl, tenantId, actionBlueprintId, blueprintVersionId } = params

  const [data, setData] = useState<ActionBlueprintGraph | undefined>(undefined)
  const [error, setError] = useState<Error | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)

  const reload = useCallback(() => setReloadToken((t) => t + 1), [])

  useEffect(() => {
    let cancelled = false
    const requestParams: FetchGraphParams = {
      baseUrl,
      tenantId,
      actionBlueprintId,
      blueprintVersionId,
    }

    queueMicrotask(() => {
      if (cancelled) return
      setIsLoading(true)
      setError(undefined)
    })

    fetchActionBlueprintGraph(requestParams)
      .then((json) => {
        if (cancelled) return
        setData(json)
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setError(e instanceof Error ? e : new Error(String(e)))
      })
      .finally(() => {
        if (cancelled) return
        setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [baseUrl, tenantId, actionBlueprintId, blueprintVersionId, reloadToken])

  return { data, error, isLoading, reload }
}
