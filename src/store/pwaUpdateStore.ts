import { create } from 'zustand'

interface PwaUpdateState {
  needRefresh: boolean
  checking: boolean
  lastCheckedAt: Date | null
  registration: ServiceWorkerRegistration | null
  reload: (() => void) | null
  setNeedRefresh: (v: boolean) => void
  setRegistration: (r: ServiceWorkerRegistration | null) => void
  setReload: (fn: (() => void) | null) => void
  checkNow: () => Promise<void>
}

/**
 * Bridges vite-plugin-pwa's useRegisterSW (called once, in App.tsx) to any page
 * that wants to show update status or let someone check manually.
 *
 * Why this exists: the update toast in App.tsx only appears once, briefly, when
 * the app happens to detect a new version. A home screen PWA left open for days
 * means the moment is easy to miss entirely, with no other way to find out an
 * update exists or to ask for one. This store gives Settings a persistent,
 * always-reachable "Check for updates" control backed by the same registration.
 */
export const usePwaUpdateStore = create<PwaUpdateState>((set, get) => ({
  needRefresh: false,
  checking: false,
  lastCheckedAt: null,
  registration: null,
  reload: null,
  setNeedRefresh: v => set({ needRefresh: v }),
  setRegistration: r => set({ registration: r }),
  setReload: fn => set({ reload: fn }),
  checkNow: async () => {
    const { registration, checking } = get()
    if (!registration || checking) return
    set({ checking: true })
    try {
      await registration.update()
    } catch {
      // A failed check (offline, flaky connection) is not an error worth
      // surfacing. The person can just try again.
    } finally {
      set({ checking: false, lastCheckedAt: new Date() })
    }
  },
}))
