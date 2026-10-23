import { CheckCircle2, Info, TriangleAlert, XCircle } from 'lucide-react'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react'

type ToastVariant = 'success' | 'error' | 'info' | 'warning'

type ToastMessage = {
  id: number
  title: string
  message?: string
  variant: ToastVariant
}

type ToastInput = {
  title: string
  message?: string
  variant?: ToastVariant
}

type ToastContextValue = {
  showToast: (input: ToastInput) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const TOAST_DURATION_MS = 3400

function getIcon(variant: ToastVariant) {
  switch (variant) {
    case 'success':
      return <CheckCircle2 size={18} />
    case 'error':
      return <XCircle size={18} />
    case 'warning':
      return <TriangleAlert size={18} />
    default:
      return <Info size={18} />
  }
}

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const nextIdRef = useRef(1)

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (input: ToastInput) => {
      const toast: ToastMessage = {
        id: nextIdRef.current++,
        title: input.title,
        message: input.message,
        variant: input.variant ?? 'info',
      }

      setToasts((current) => [...current, toast])

      window.setTimeout(() => {
        removeToast(toast.id)
      }, TOAST_DURATION_MS)
    },
    [removeToast],
  )

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast,
      success: (title, message) => showToast({ title, message, variant: 'success' }),
      error: (title, message) => showToast({ title, message, variant: 'error' }),
      info: (title, message) => showToast({ title, message, variant: 'info' }),
      warning: (title, message) => showToast({ title, message, variant: 'warning' }),
    }),
    [showToast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="toast-stack" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <article className={`toast toast-${toast.variant}`} key={toast.id} role="status">
            <div className="toast-icon">{getIcon(toast.variant)}</div>
            <div className="toast-content">
              <strong>{toast.title}</strong>
              {toast.message ? <p>{toast.message}</p> : null}
            </div>
            <button
              aria-label="Dismiss notification"
              className="toast-dismiss"
              onClick={() => removeToast(toast.id)}
              type="button"
            >
              ×
            </button>
          </article>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within ToastProvider.')
  }

  return context
}
