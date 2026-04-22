import type { CloudConfig } from '@stacksjs/ts-cloud-types'

const config: CloudConfig = {
  project: {
    name: 'Repo Dashboard',
    slug: 'repo-dashboard',
    region: 'us-east-1',
  },

  environments: {
    production: {
      type: 'production',
      domain: 'repos.stacksjs.com',
    },
  },

  sites: {
    production: {
      domain: 'repos.stacksjs.com',
      root: 'dist',
      build: 'bun run build',
    },
  },

  infrastructure: {
    dns: {
      provider: 'route53',
      domain: 'repos.stacksjs.com',
    },
  },
}

export default config
