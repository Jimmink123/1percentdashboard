import { BellIcon, XMarkIcon } from './icons'

export interface ToastItem {
  id: string
  firstName: string
  source: string | null
  leaving: boolean
}

interface LeadToastStackProps {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}

export default function LeadToastStack({ toasts, onDismiss }: LeadToastStackProps) {
  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-xs flex-col gap-3 sm:right-6 sm:bottom-6">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={`pointer-events-auto relative flex items-start gap-3 rounded-xl border border-ink-200 bg-white/95 p-4 pr-8 shadow-lg backdrop-blur dark:border-white/10 dark:bg-ink-900/95 ${
            toast.leaving ? 'animate-toast-out' : 'animate-toast-in'
          }`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary-light/15 dark:text-primary-light">
            <BellIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="text-xs font-medium text-ink-500 dark:text-ink-400">New lead</div>
            <div className="truncate text-sm font-semibold text-ink-950 dark:text-white">
              {toast.firstName}
            </div>
            {toast.source && (
              <span className="mt-1 inline-block rounded-full bg-ink-100 px-2 py-0.5 text-xs text-ink-600 dark:bg-white/10 dark:text-ink-300">
                {toast.source}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
            className="absolute right-2 top-2 cursor-pointer rounded p-1 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <XMarkIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
