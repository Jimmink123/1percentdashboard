import { useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from './supabaseClient'
import type { Lead } from './types'
import SummaryCards from './components/SummaryCards'
import Filters from './components/Filters'
import CampaignChart from './components/CampaignChart'
import LeadsTable from './components/LeadsTable'
import { downloadCsv, leadsToCsv } from './lib/csv'

export default function App() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLive, setIsLive] = useState(false)

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [campaign, setCampaign] = useState('')

  // Initial load.
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    let cancelled = false

    async function loadLeads() {
      setLoading(true)
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (cancelled) return

      if (error) {
        setError(error.message)
      } else {
        setLeads((data as Lead[]) ?? [])
        setError(null)
      }
      setLoading(false)
    }

    loadLeads()
    return () => {
      cancelled = true
    }
  }, [])

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

  return (
    <div className="min-h-full">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold">T Marz — Leads Dashboard</h1>
            <p className="text-sm text-black/50">Telegram joins by ad source</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-black/50">
            <span
              className={`inline-block h-2 w-2 rounded-full ${isLive ? 'bg-green-500' : 'bg-black/20'}`}
            />
            {!isSupabaseConfigured ? 'Not configured' : isLive ? 'Live' : 'Connecting…'}
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-6">
        {!isSupabaseConfigured && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Supabase isn't configured yet. Set <code>VITE_SUPABASE_URL</code> and{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env.local</code> (or in the Cloudflare
            Pages project's environment variables) and reload.
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Couldn't load leads: {error}
          </div>
        )}

        <SummaryCards totalAllTime={totalAllTime} totalThisMonth={totalThisMonth} />

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

        <CampaignChart data={chartData} />

        <div className="flex items-center justify-between">
          <div className="text-sm text-black/50">
            {loading ? 'Loading…' : `${filteredLeads.length} lead${filteredLeads.length === 1 ? '' : 's'}`}
          </div>
          <button
            onClick={handleExport}
            disabled={filteredLeads.length === 0}
            className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            Export CSV
          </button>
        </div>

        <LeadsTable leads={filteredLeads} />
      </main>
    </div>
  )
}
