import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext({
  showToast: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
})

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(({ message, type = 'info', duration = 3500 }) => {
    const id = Date.now() + Math.random().toString(36).slice(2, 6)
    setToasts((prev) => [...prev, { id, message, type }])

    setTimeout(() => {
      removeToast(id)
    }, duration)
  }, [removeToast])

  const success = useCallback((message, duration) => {
    showToast({ message, type: 'success', duration })
  }, [showToast])

  const error = useCallback((message, duration) => {
    showToast({ message, type: 'error', duration })
  }, [showToast])

  const info = useCallback((message, duration) => {
    showToast({ message, type: 'info', duration })
  }, [showToast])

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      {/* Floating Toasts Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in ${
              toast.type === 'success'
                ? 'bg-slate-900/95 dark:bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
                : toast.type === 'error'
                ? 'bg-slate-900/95 dark:bg-red-950/90 text-red-300 border-red-500/40'
                : 'bg-slate-900/95 dark:bg-base-900/90 text-slate-100 border-base-700'
            }`}
          >
            <div className="shrink-0 text-base">
              {toast.type === 'success' && (
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">✓</span>
              )}
              {toast.type === 'error' && (
                <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xs font-bold">✕</span>
              )}
              {toast.type === 'info' && (
                <span className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold">ℹ</span>
              )}
            </div>
            <div className="flex-1 text-xs font-semibold leading-snug">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors text-sm shrink-0 px-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
