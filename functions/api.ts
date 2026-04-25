import { getDashboardData } from './github'
import { getPortStatuses, killPort } from './ports'

export function createApiRoutes(): Record<string, (req: Request) => Response | Promise<Response>> {
  return {
    '/api/status': async () => {
      try {
        const data = await getDashboardData()
        return Response.json(data)
      }
      catch (err) {
        return Response.json({ error: String(err) }, { status: 500 })
      }
    },

    '/api/ports': async () => {
      try {
        const ports = await getPortStatuses()
        return Response.json({ ports })
      }
      catch (err) {
        return Response.json({ error: String(err) }, { status: 500 })
      }
    },

    '/api/ports/kill': async (req: Request) => {
      if (req.method !== 'POST') {
        return Response.json({ error: 'Method not allowed' }, { status: 405 })
      }
      try {
        const body = await req.json() as { port: number }
        const result = await killPort(body.port)
        return Response.json(result)
      }
      catch (err) {
        return Response.json({ error: String(err) }, { status: 500 })
      }
    },
  }
}
