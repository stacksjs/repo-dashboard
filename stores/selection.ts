import { defineStore } from 'stx'

export const useSelection = defineStore('useSelection', () => {
  const selected = state([])
  const copyState = state('idle') // 'idle' | 'copied' | 'empty'

  const count = derived(() => selected().length)

  function toggle(fullName) {
    const cur = selected()
    if (cur.includes(fullName)) selected.set(cur.filter(n => n !== fullName))
    else selected.set([...cur, fullName])
  }

  function has(fullName) {
    return selected().includes(fullName)
  }

  function clear() {
    selected.set([])
  }

  function flash(value) {
    copyState.set(value)
    setTimeout(() => copyState.set('idle'), 1500)
  }

  async function generatePrompt(allRepos) {
    const sel = selected()
    const repos = allRepos
      .filter(r => sel.includes(r.fullName) && r.failedJobs && r.failedJobs.length > 0)

    if (repos.length === 0) {
      flash('empty')
      return
    }

    const text = repos
      .map(r => r.fullName + '\n' + r.failedJobs.map(j => '- ' + j.name).join('\n'))
      .join('\n\n')

    try {
      await navigator.clipboard.writeText(text)
      flash('copied')
    }
    catch {
      flash('empty')
    }
  }

  return { selected, count, copyState, toggle, has, clear, generatePrompt }
})
