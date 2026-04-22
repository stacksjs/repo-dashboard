import { createApiRoutes } from './functions/api'

export default {
  app: {
    head: {
      title: 'Repo Dashboard',
      lang: 'en',
      meta: [
        { name: 'theme-color', content: '#0a0a0a' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap' },
      ],
      bodyClass: 'bg-zinc-950 text-zinc-100 font-sans antialiased',
    },
  },

  css: './crosswind.config.ts',
  ssr: true,
  apiRoutes: createApiRoutes(),
}
