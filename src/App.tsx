import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { isSupabaseConfigured, supabase } from './supabaseClient'
import type { Lead } from './types'
import SummaryCards from './components/SummaryCards'
import Filters from './components/Filters'
import CampaignChart from './components/CampaignChart'
import LeadsTable from './components/LeadsTable'
import LeadToastStack, { type ToastItem } from './components/LeadToast'
import { downloadCsv, leadsToCsv } from './lib/csv'
import { playNewLeadChime, primeAudio } from './lib/chime'
import {
  AlertIcon,
  DownloadIcon,
  SettingsIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from './components/icons'
import Reveal from './components/Reveal'

const MUTE_STORAGE_KEY = 'tmarz-dashboard-muted'
const TOAST_VISIBLE_MS = 10000
const TOAST_EXIT_MS = 250
// Cap how many toasts stack on screen at once — if leads come in faster than
// that, the oldest one retires early (with its normal exit animation) to
// make room, instead of piling up into an ever-growing, annoying wall.
const MAX_VISIBLE_TOASTS = 3

export default function App() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLive, setIsLive] = useState(false)
  const [justArrivedId, setJustArrivedId] = useState<Lead['id'] | null>(null)
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [muted, setMuted] = useState(() => {
    try {
      return localStorage.getItem(MUTE_STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })
  const mutedRef = useRef(muted)

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [campaign, setCampaign] = useState('')

  useEffect(() => {
    mutedRef.current = muted
    try {
      localStorage.setItem(MUTE_STORAGE_KEY, String(muted))
    } catch {
      // localStorage unavailable (private mode, etc.) — mute preference just
      // won't persist across reloads, which is fine.
    }
  }, [muted])

  // Browsers block audio until the user has interacted with the page at
  // least once — warm up the AudioContext on the first click/keypress so
  // the very first toast's chime has a chance to actually play.
  useEffect(() => {
    function warmUp() {
      primeAudio()
    }
    window.addEventListener('pointerdown', warmUp, { once: true })
    window.addEventListener('keydown', warmUp, { once: true })
    return () => {
      window.removeEventListener('pointerdown', warmUp)
      window.removeEventListener('keydown', warmUp)
    }
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)))
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, TOAST_EXIT_MS)
  }, [])

  const pushLeadToast = useCallback(
    (lead: Lead) => {
      const toastId = `${lead.id}-${Date.now()}`

      setToasts((prev) => {
        const active = prev.filter((t) => !t.leaving)
        let next = prev
        if (active.length >= MAX_VISIBLE_TOASTS) {
          // Retire the oldest active toast early to make room, rather than
          // letting the stack grow without bound.
          const oldest = active[0]
          next = prev.map((t) => (t.id === oldest.id ? { ...t, leaving: true } : t))
          setTimeout(() => {
            setToasts((p) => p.filter((t) => t.id !== oldest.id))
          }, TOAST_EXIT_MS)
        }
        return [
          ...next,
          { id: toastId, firstName: lead.first_name || 'Someone', source: lead.source, leaving: false },
        ]
      })

      if (!mutedRef.current) playNewLeadChime()
      setTimeout(() => dismissToast(toastId), TOAST_VISIBLE_MS)
    },
    [dismissToast],
  )

  const loadLeads = useCallback(async (opts: { showSpinner?: boolean } = {}) => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    if (opts.showSpinner) setLoading(true)
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setLeads((data as Lead[]) ?? [])
      setError(null)
    }
    if (opts.showSpinner) setLoading(false)
  }, [])

  // Initial load.
  useEffect(() => {
    loadLeads({ showSpinner: true })
  }, [loadLeads])

  // Belt-and-suspenders re-sync: the Realtime websocket can go stale after
  // the tab sits backgrounded for a while (laptop sleep, brief network
  // drop) without the client cleanly reconnecting. Re-fetching whenever the
  // tab regains focus (or the network comes back) means the dashboard never
  // shows more than a moment of staleness — no manual refresh required.
  useEffect(() => {
    if (!isSupabaseConfigured) return

    function handleVisible() {
      if (document.visibilityState === 'visible') {
        loadLeads()
      }
    }
    function handleOnline() {
      loadLeads()
    }

    document.addEventListener('visibilitychange', handleVisible)
    window.addEventListener('online', handleOnline)
    window.addEventListener('focus', handleVisible)
    return () => {
      document.removeEventListener('visibilitychange', handleVisible)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('focus', handleVisible)
    }
  }, [loadLeads])

  // Realtime subscription — new leads appear immediately, no refresh needed.
  useEffect(() => {
    if (!isSupabaseConfigured) return
    const channel = supabase
      .channel('leads-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'leads' },
        (payload) => {
          const newLead = payload.new as Lead
          setLeads((prev) =>
            prev.some((l) => l.id === newLead.id) ? prev : [newLead, ...prev],
          )
          setJustArrivedId(newLead.id)
          setTimeout(() => {
            setJustArrivedId((current) => (current === newLead.id ? null : current))
          }, 1800)

          pushLeadToast(newLead)
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'leads' },
        (payload) => {
          const updated = payload.new as Lead
          setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
        },
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'leads' },
        (payload) => {
          const oldLead = payload.old as Partial<Lead>
          setLeads((prev) => prev.filter((l) => l.id !== oldLead.id))
        },
      )
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const campaignOptions = useMemo(() => {
    const set = new Set<string>()
    leads.forEach((l) => {
      if (l.campaign) set.add(l.campaign)
    })
    return Array.from(set).sort()
  }, [leads])

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (campaign && lead.campaign !== campaign) return false
      const created = new Date(lead.created_at)
      if (dateFrom && created < new Date(`${dateFrom}T00:00:00`)) return false
      if (dateTo && created > new Date(`${dateTo}T23:59:59.999`)) return false
      return true
    })
  }, [leads, campaign, dateFrom, dateTo])

  const totalAllTime = leads.length

  const totalThisMonth = useMemo(() => {
    const now = new Date()
    return leads.filter((lead) => {
      const created = new Date(lead.created_at)
      return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth()
    }).length
  }, [leads])

  const chartData = useMemo(() => {
    const counts = new Map<string, number>()
    filteredLeads.forEach((lead) => {
      const key = lead.campaign || 'Unlabeled'
      counts.set(key, (counts.get(key) ?? 0) + 1)
    })
    return Array.from(counts.entries())
      .map(([campaign, count]) => ({ campaign, count }))
      .sort((a, b) => b.count - a.count)
  }, [filteredLeads])

  const filtersActive = Boolean(dateFrom || dateTo || campaign)

  function handleResetFilters() {
    setDateFrom('')
    setDateTo('')
    setCampaign('')
  }

  function handleExport() {
    const csv = leadsToCsv(filteredLeads)
    const stamp = new Date().toISOString().slice(0, 10)
    downloadCsv(`tmarz-leads-${stamp}.csv`, csv)
  }

  const statusLabel = !isSupabaseConfigured ? 'Not configured' : isLive ? 'Live' : 'Connecting…'
  const statusDotClasses = !isSupabaseConfigured
    ? 'bg-ink-300 dark:bg-ink-600'
    : isLive
      ? 'bg-emerald-500'
      : 'bg-amber-400 animate-pulse'

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-10 border-b border-ink-200 bg-white/80 backdrop-blur dark:border-white/5 dark:bg-ink-950/80">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
          <div>
            <h1 className="text-lg font-semibold text-ink-950 dark:text-white">
              T Marz — Leads Dashboard
            </h1>
            <p className="text-sm text-ink-500 dark:text-ink-400">Telegram joins by ad source</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-ink-500 dark:text-ink-400">
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              aria-pressed={muted}
              aria-label={muted ? 'Unmute new lead sound' : 'Mute new lead sound'}
              title={muted ? 'Unmute new lead sound' : 'Mute new lead sound'}
              className="cursor-pointer rounded-md p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700 dark:text-ink-500 dark:hover:bg-white/10 dark:hover:text-white"
            >
              {muted ? <SpeakerXMarkIcon className="h-4 w-4" /> : <SpeakerWaveIcon className="h-4 w-4" />}
            </button>
            <span className="flex items-center gap-2">
              <span className="relative inline-flex h-2 w-2">
                {isLive && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                )}
                <span className={`relative inline-flex h-2 w-2 rounded-full ${statusDotClasses}`} />
              </span>
              {statusLabel}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-6">
        {!isSupabaseConfigured && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
            <SettingsIcon className="mt-0.5 h-5 w-5 shrink-0" />
            <p>
              Supabase isn't configured yet. Set <code>VITE_SUPABASE_URL</code> and{' '}
              <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env.local</code> (or in the Cloudflare
              project's environment variables) and reload.
            </p>
          </div>
        )}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
            <p>Couldn't load leads: {error}</p>
          </div>
        )}

        <SummaryCards totalAllTime={totalAllTime} totalThisMonth={totalThisMonth} loading={loading} />

        <Reveal delay={120}>
          <CampaignChart data={chartData} loading={loading} />
        </Reveal>

        <Reveal delay={180}>
          <Filters
            campaigns={campaignOptions}
            campaign={campaign}
            onCampaignChange={setCampaign}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onReset={handleResetFilters}
          />
        </Reveal>

        <Reveal delay={240} className="flex items-center justify-between">
          <div className="tabular text-sm text-ink-500 dark:text-ink-400">
            {loading
              ? 'Loading…'
              : `${filteredLeads.length} lead${filteredLeads.length === 1 ? '' : 's'}`}
          </div>
          <button
            onClick={handleExport}
            disabled={filteredLeads.length === 0}
            className="flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary-light active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-primary disabled:active:scale-100 dark:bg-primary-dark dark:text-ink-950 dark:hover:brightness-110"
          >
            <DownloadIcon className="h-4 w-4" />
            Export CSV
          </button>
        </Reveal>

        <Reveal delay={300}>
          <LeadsTable
            leads={filteredLeads}
            loading={loading}
            filtersActive={filtersActive}
            onClearFilters={handleResetFilters}
            justArrivedId={justArrivedId}
          />
        </Reveal>
      </main>

      <LeadToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
