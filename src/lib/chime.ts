// A short, gentle two-note "new lead" chime, synthesized with the Web Audio
// API so there's no external audio file to fetch/host or license.

let audioCtx: AudioContext | null = null

function getContext(): AudioContext | null {
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctx) return null
  audioCtx ??= new Ctx()
  return audioCtx
}

/** Call once on first user interaction — browsers block audio until then. */
export function primeAudio() {
  const ctx = getContext()
  if (ctx?.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
}

export async function playNewLeadChime() {
  try {
    const ctx = getContext()
    if (!ctx) return

    // Browsers (Chrome in particular) auto-suspend an idle AudioContext
    // after a while to save power — priming it once on first click isn't
    // enough. If we schedule sound against a suspended context, the events
    // sit stuck at a stale `currentTime` and only fire once something else
    // happens to resume the context later, which sounds like a random,
    // badly-delayed chime. So: resume first, every time, and read
    // `currentTime` fresh afterwards.
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }

    const now = ctx.currentTime
    const notes = [880, 1318.51] // A5 then E6 — a soft, bright little "ding-ding"

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq

      const start = now + i * 0.1
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.16, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.4)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.42)
    })
  } catch {
    // Web Audio unavailable/blocked — sound is a nice-to-have, fail silently.
  }
}
