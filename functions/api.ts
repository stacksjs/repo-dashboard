import { getDashboardData } from './github'

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
  }
}
