import { CircleAlert } from 'lucide-react'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'

type ConfirmTone = 'default' | 'danger'

type ConfirmOptions = {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  tone?: ConfirmTone
}

type DialogState = ConfirmOptions & {
  isOpen: boolean
}

type ConfirmContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

const initialDialogState: DialogState = {
  isOpen: false,
  title: '',
  description: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  tone: 'default',
}

export function ConfirmDialogProvider({ children }: PropsWithChildren) {
  const [dialog, setDialog] = useState<DialogState>(initialDialogState)
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null)

  const closeDialog = useCallback(
    (result: boolean) => {
      resolver?.(result)
      setResolver(null)
      setDialog(initialDialogState)
    },
    [resolver],
  )

  const confirm = useCallback((options: ConfirmOptions) => {
    setDialog({
      isOpen: true,
      title: options.title,
      description: options.description,
      confirmText: options.confirmText ?? 'Confirm',
      cancelText: options.cancelText ?? 'Cancel',
      tone: options.tone ?? 'default',
    })

    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve)
    })
  }, [])

  const value = useMemo(
    () => ({
      confirm,
    }),
    [confirm],
  )

  return (
    <ConfirmContext.Provider value={value}>
      {children}

      {dialog.isOpen ? (
        <div className="dialog-backdrop" role="presentation">
          <div
            aria-describedby="confirm-dialog-description"
            aria-labelledby="confirm-dialog-title"
            aria-modal="true"
            className="dialog-card"
            role="dialog"
          >
            <div className="dialog-icon">
              <CircleAlert size={20} />
            </div>

            <h3 id="confirm-dialog-title">{dialog.title}</h3>
            {dialog.description ? (
              <p id="confirm-dialog-description">{dialog.description}</p>
            ) : null}

            <div className="dialog-actions">
              <button
                className="button button-ghost"
                onClick={() => closeDialog(false)}
                type="button"
              >
                {dialog.cancelText}
              </button>
              <button
                className={
                  dialog.tone === 'danger' ? 'button button-danger' : 'button button-primary'
                }
                onClick={() => closeDialog(true)}
                type="button"
              >
                {dialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ConfirmContext.Provider>
  )
}

export function useConfirmDialog() {
  const context = useContext(ConfirmContext)

  if (!context) {
    throw new Error('useConfirmDialog must be used within ConfirmDialogProvider.')
  }

  return context
}
