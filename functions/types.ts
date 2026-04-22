export interface FailedJob {
  name: string
  conclusion: string
  url: string
}

export interface RepoStatus {
  name: string
  owner: string
  fullName: string
  url: string
  defaultBranch: string
  status: 'success' | 'failure' | 'pending' | 'no_runs' | 'error'
  conclusion: string | null
  workflowName: string | null
  commitSha: string | null
  commitMessage: string | null
  commitUrl: string | null
  commitAuthor: string | null
  commitCount: number | null
  updatedAt: string | null
  runUrl: string | null
  failedJobs: FailedJob[]
}

export interface DashboardData {
  repos: RepoStatus[]
  fetchedAt: string
  total: number
  passing: number
  failing: number
  pending: number
  noRuns: number
}
