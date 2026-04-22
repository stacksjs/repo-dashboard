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
      domain: 'status.stacksjs.com',
    },
  },

  sites: {
    production: {
      domain: 'status.stacksjs.com',
      root: 'dist',
      build: 'bun run build',
    },
  },

  infrastructure: {
    dns: {
      provider: 'route53',
      domain: 'status.stacksjs.com',
    },
  },
}

export default config
