const path = require('path');
const { spawnSync } = require('child_process');

const env = {
  ...process.env,
  DATABASE_URL: 'file:./test.db',
  SESSION_SECRET: 'test-secret',
};

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

run('node', [path.join('scripts', 'ensure-sqlite-db.js')]);
run('npx', ['prisma', 'migrate', 'deploy', '--schema', 'prisma/schema.prisma']);
run('node', [path.join('prisma', 'seed.js')]);
