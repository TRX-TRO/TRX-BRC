module.exports = {
  apps: [
    {
      name: 'troxzymd',
      script: 'npm',
      args: 'start',
      cwd: '/workspaces/TRXASDH',
      env: {
        NODE_ENV: 'production'
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '500M'
    }
  ]
};
