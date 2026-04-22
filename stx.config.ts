import { createApiRoutes } from './src/api'

const apiRoutes = createApiRoutes()

export default {
  componentsDir: 'components',
  layoutsDir: 'layouts',
  partialsDir: 'partials',
  pagesDir: 'pages',
  publicDir: 'public',
  storesDir: 'stores',

  app: {
    head: {
      title: 'Repo Dashboard — Stacks CI Status',
      lang: 'en',
      meta: [
        { name: 'description', content: 'Monitor CI status across all Stacks codebases.' },
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

  router: {
    container: 'main',
    viewTransitions: true,
    prefetch: true,
  },

  apiRoutes,
}
