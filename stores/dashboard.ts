import { defineStore } from 'stx'

export const useDashboard = defineStore('useDashboard', () => {
  const allRepos = state([])
  const loading = state(true)
  const error = state('')
  const total = state(0)
  const passing = state(0)
  const failing = state(0)
  const runners = state({}) // { [org]: { running, queued, cap } }

  async function load() {
    try {
      const res = await fetch('/api/status')
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const data = await res.json()
      allRepos.set(data.repos)
      total.set(data.total)
      passing.set(data.passing)
      failing.set(data.failing)
      runners.set(data.runners || {})
    }
    catch (e) {
      error.set(String(e))
    }
    finally {
      loading.set(false)
    }
  }

  return { allRepos, loading, error, total, passing, failing, runners, load }
})
