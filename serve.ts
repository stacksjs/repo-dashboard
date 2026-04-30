#!/usr/bin/env bun
import { serve } from 'bun-plugin-stx/serve'
import { createApiRoutes } from './functions/api'
import { getDashboardData } from './functions/github'

const args = process.argv.slice(2)
const portIdx = args.indexOf('--port')
const port = portIdx >= 0 && args[portIdx + 1] ? Number(args[portIdx + 1]) : 3333

const apiRoutes = createApiRoutes()

// pre-warm cache so the first browser request is instant
getDashboardData().catch(err => console.warn('[warmup] failed:', err))

await serve({
  patterns: ['pages/'],
  port,
  routes: apiRoutes,
})
