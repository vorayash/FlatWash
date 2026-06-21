import { useState, useCallback } from 'react'
import ConfirmDialog from '../components/ConfirmDialog'

export function useConfirm() {
  const [state, setState] = useState(null)

  const confirm = useCallback((message, options = {}) => {
    return new Promise(resolve => {
      setState({ message, options, resolve })
    })
  }, [])

  const dialog = state ? (
    <ConfirmDialog
      message={state.message}
      confirmLabel={state.options.confirmLabel}
      danger={state.options.danger}
      onConfirm={() => { state.resolve(true);  setState(null) }}
      onCancel={() =>  { state.resolve(false); setState(null) }}
    />
  ) : null

  return { confirm, dialog }
}
