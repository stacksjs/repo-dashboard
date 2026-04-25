import type { DashboardData, RepoStatus } from './types'

const GITHUB_API = 'https://api.github.com'
const ORGS = ['stacksjs', 'home-lang', 'mail-os', 'pickier', 'cwcss']

function getToken(): string {
  const token = process.env.GITHUB_TOKEN
  if (!token) throw new Error('GITHUB_TOKEN environment variable is required')
  return token
}

function headers(): Record<string, string> {
  return {
    'Authorization': `Bearer ${getToken()}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

async function fetchAllRepos(): Promise<Array<{ name: string, owner: string, full_name: string, html_url: string, default_branch: string, archived: boolean }>> {
  const allRepos: Array<{ name: string, owner: string, full_name: string, html_url: string, default_branch: string, archived: boolean }> = []

  for (const org of ORGS) {
    let page = 1
    while (true) {
      const res = await fetch(`${GITHUB_API}/orgs/${org}/repos?per_page=100&page=${page}&type=public`, { headers: headers() })
      if (!res.ok) break

      const repos = await res.json() as Array<{ name: string, owner: { login: string }, full_name: string, html_url: string, default_branch: string, archived: boolean }>
      if (repos.length === 0) break

      for (const repo of repos) {
        allRepos.push({
          name: repo.name,
          owner: repo.owner.login,
          full_name: repo.full_name,
          html_url: repo.html_url,
          default_branch: repo.default_branch,
          archived: repo.archived,
        })
      }

      page++
    }
  }

  const IGNORED = new Set(['.github'])
  return allRepos.filter(r => !r.archived && !IGNORED.has(r.name))
}

async function fillLatestCommit(base: RepoStatus, owner: string, name: string, branch: string): Promise<void> {
  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${owner}/${name}/commits?sha=${branch}&per_page=1`,
      { headers: headers() },
    )
    if (!res.ok) return

    const commits = await res.json() as Array<{ sha: string, commit: { message: string, author: { name: string, date: string } | null }, author: { login: string } | null }>
    if (commits.length === 0) return

    const c = commits[0]
    base.commitSha = c.sha.slice(0, 7)
    base.commitMessage = c.commit.message.split('\n')[0]
    base.commitUrl = `https://github.com/${owner}/${name}/commit/${c.sha}`
    base.commitAuthor = c.commit.author?.name ?? c.author?.login ?? null
    base.updatedAt = c.commit.author?.date ?? null
  }
  catch {
    // ignore — commit info is optional
  }
}

async function fetchFailedJobs(owner: string, name: string, runId: number): Promise<Array<{ name: string, conclusion: string, url: string }>> {
  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${owner}/${name}/actions/runs/${runId}/jobs?filter=latest`,
      { headers: headers() },
    )
    if (!res.ok) return []

    const data = await res.json() as { jobs: Array<{ name: string, conclusion: string | null, html_url: string }> }
    return data.jobs
      .filter(j => j.conclusion && j.conclusion !== 'success' && j.conclusion !== 'skipped')
      .map(j => ({ name: j.name, conclusion: j.conclusion!, url: j.html_url }))
  }
  catch {
    return []
  }
}

async function fetchRepoStatus(owner: string, name: string, defaultBranch: string): Promise<RepoStatus> {
  const base: RepoStatus = {
    name,
    owner,
    fullName: `${owner}/${name}`,
    url: `https://github.com/${owner}/${name}`,
    defaultBranch,
    status: 'no_runs',
    conclusion: null,
    workflowName: null,
    commitSha: null,
    commitMessage: null,
    commitUrl: null,
    commitAuthor: null,
    commitCount: null,
    updatedAt: null,
    runUrl: null,
    failedJobs: [],
    renovatePRs: 0,
    renovatePRsUrl: null,
    actionsPRs: 0,
    actionsPRsUrl: null,
  }

  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${owner}/${name}/actions/runs?branch=${defaultBranch}&per_page=1`,
      { headers: headers() },
    )

    if (!res.ok) {
      base.status = 'error'
      await fillLatestCommit(base, owner, name, defaultBranch)
      return base
    }

    const data = await res.json() as { workflow_runs: Array<{ id: number, status: string, conclusion: string | null, name: string, head_sha: string, head_commit: { message: string, author: { name: string } | null } | null, updated_at: string, html_url: string, actor: { login: string } | null }> }

    if (!data.workflow_runs || data.workflow_runs.length === 0) {
      await fillLatestCommit(base, owner, name, defaultBranch)
      return base
    }

    const run = data.workflow_runs[0]
    base.workflowName = run.name
    base.commitSha = run.head_sha.slice(0, 7)
    base.commitMessage = run.head_commit?.message.split('\n')[0] ?? null
    base.commitUrl = `https://github.com/${owner}/${name}/commit/${run.head_sha}`
    base.commitAuthor = run.head_commit?.author?.name ?? run.actor?.login ?? null
    base.updatedAt = run.updated_at
    base.runUrl = run.html_url

    if (run.status === 'completed') {
      base.status = run.conclusion === 'success' ? 'success' : 'failure'
      base.conclusion = run.conclusion

      if (base.status === 'failure') {
        base.failedJobs = await fetchFailedJobs(owner, name, run.id)
      }
    }
    else {
      base.status = 'pending'
      base.conclusion = run.status
    }
  }
  catch {
    base.status = 'error'
  }

  return base
}

async function fetchBotPRCounts(org: string, authorSlug: string): Promise<Map<string, number>> {
  const counts = new Map<string, number>()
  let page = 1

  while (true) {
    const q = `is:pr is:open org:${org} author:app/${authorSlug}`
    const res = await fetch(
      `${GITHUB_API}/search/issues?q=${encodeURIComponent(q)}&per_page=100&page=${page}`,
      { headers: headers() },
    )
    if (!res.ok) break

    const data = await res.json() as { items: Array<{ repository_url: string }>, total_count: number }
    if (!data.items || data.items.length === 0) break

    for (const item of data.items) {
      const fullName = item.repository_url.replace(`${GITHUB_API}/repos/`, '')
      counts.set(fullName, (counts.get(fullName) ?? 0) + 1)
    }

    if (data.items.length < 100) break
    page++
  }

  return counts
}

// Simple in-memory cache (refreshes every 2 minutes)
let cache: DashboardData | null = null
let cacheTime = 0
const CACHE_TTL = 2 * 60 * 1000

export async function getDashboardData(): Promise<DashboardData> {
  const now = Date.now()
  if (cache && now - cacheTime < CACHE_TTL) {
    return cache
  }

  const repos = await fetchAllRepos()
  const statuses = await Promise.all(
    repos.map(r => fetchRepoStatus(r.owner, r.name, r.default_branch)),
  )

  const prCountMaps = await Promise.all(
    ORGS.flatMap(org => [
      fetchBotPRCounts(org, 'renovate').then(m => ({ type: 'renovate' as const, map: m })),
      fetchBotPRCounts(org, 'github-actions').then(m => ({ type: 'actions' as const, map: m })),
    ]),
  )
  const renovateCounts = new Map<string, number>()
  const actionsCounts = new Map<string, number>()
  for (const { type, map } of prCountMaps) {
    const target = type === 'renovate' ? renovateCounts : actionsCounts
    for (const [k, v] of map) target.set(k, (target.get(k) ?? 0) + v)
  }

  for (const s of statuses) {
    const rCount = renovateCounts.get(s.fullName) ?? 0
    const aCount = actionsCounts.get(s.fullName) ?? 0
    s.renovatePRs = rCount
    s.actionsPRs = aCount
    if (rCount > 0)
      s.renovatePRsUrl = `https://github.com/${s.fullName}/pulls?q=${encodeURIComponent('is:pr is:open author:app/renovate')}`
    if (aCount > 0)
      s.actionsPRsUrl = `https://github.com/${s.fullName}/pulls?q=${encodeURIComponent('is:pr is:open author:app/github-actions')}`
  }

  // Sort: failures first, then pending, then success, then no_runs
  const order: Record<string, number> = { failure: 0, error: 1, pending: 2, success: 3, no_runs: 4 }
  statuses.sort((a, b) => (order[a.status] ?? 5) - (order[b.status] ?? 5))

  const data: DashboardData = {
    repos: statuses,
    fetchedAt: new Date().toISOString(),
    total: statuses.length,
    passing: statuses.filter(r => r.status === 'success').length,
    failing: statuses.filter(r => r.status === 'failure' || r.status === 'error').length,
    pending: statuses.filter(r => r.status === 'pending').length,
    noRuns: statuses.filter(r => r.status === 'no_runs').length,
  }

  cache = data
  cacheTime = now
  return data
}
