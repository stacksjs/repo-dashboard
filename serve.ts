#!/usr/bin/env bun
import { serve } from 'bun-plugin-stx/serve'
import { createApiRoutes } from './src/api'

const args = process.argv.slice(2)
const portIdx = args.indexOf('--port')
const port = portIdx >= 0 && args[portIdx + 1] ? Number(args[portIdx + 1]) : 3333

const apiRoutes = createApiRoutes()

await serve({
  patterns: ['pages/'],
  port,
  routes: apiRoutes,
})
