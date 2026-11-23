import { useCallback, useEffect, useState } from 'react'
import { getErrorMessage } from '@/lib/api'

// Runs an async loader whenever `deps` change. Previous data is kept while
// reloading so screens don't flash back to skeletons after every edit.
export function useAsync(loader, deps) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let active = true
    setState((prev) => ({ ...prev, loading: true, error: null }))
    loader()
      .then((data) => active && setState({ data, error: null, loading: false }))
      .catch((err) => active && setState((prev) => ({ ...prev, error: getErrorMessage(err), loading: false })))
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])

  return { ...state, reload }
}
