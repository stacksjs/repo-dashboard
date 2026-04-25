const WATCHED_PORTS = [5173, 3000, 3001, 3333, 6700]

export interface PortInfo {
  port: number
  active: boolean
  pid: number | null
  command: string | null
}

export async function getPortStatuses(): Promise<PortInfo[]> {
  const results: PortInfo[] = []

  for (const port of WATCHED_PORTS) {
    try {
      const proc = Bun.spawn(['lsof', '-ti', `:${port}`, '-P'], {
        stdout: 'pipe',
        stderr: 'pipe',
      })
      const output = await new Response(proc.stdout).text()
      await proc.exited

      const pids = output.trim().split('\n').filter(Boolean)
      if (pids.length > 0) {
        const pid = Number(pids[0])
        const cmd = await getProcessCommand(pid)
        results.push({ port, active: true, pid, command: cmd })
      }
      else {
        results.push({ port, active: false, pid: null, command: null })
      }
    }
    catch {
      results.push({ port, active: false, pid: null, command: null })
    }
  }

  return results
}

async function getProcessCommand(pid: number): Promise<string | null> {
  try {
    const proc = Bun.spawn(['ps', '-p', String(pid), '-o', 'command='], {
      stdout: 'pipe',
      stderr: 'pipe',
    })
    const output = await new Response(proc.stdout).text()
    await proc.exited
    const cmd = output.trim().split('\n')[0]
    return cmd || null
  }
  catch {
    return null
  }
}

export async function killPort(port: number): Promise<{ success: boolean, message: string }> {
  if (!WATCHED_PORTS.includes(port)) {
    return { success: false, message: `Port ${port} is not in the watched list` }
  }

  try {
    const proc = Bun.spawn(['lsof', '-ti', `:${port}`, '-P'], {
      stdout: 'pipe',
      stderr: 'pipe',
    })
    const output = await new Response(proc.stdout).text()
    await proc.exited

    const pids = output.trim().split('\n').filter(Boolean)
    if (pids.length === 0) {
      return { success: false, message: `Nothing running on port ${port}` }
    }

    for (const pidStr of pids) {
      const pid = Number(pidStr)
      if (pid > 0) {
        process.kill(pid, 'SIGKILL')
      }
    }

    return { success: true, message: `Killed ${pids.length} process(es) on port ${port}` }
  }
  catch (err) {
    return { success: false, message: String(err) }
  }
}
