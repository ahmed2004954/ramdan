const { spawnSync } = require('child_process');

const env = {
  ...process.env,
  NODE_ENV: 'production',
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

run('npm', ['run', 'build:css']);
run('npx', ['prisma', 'generate', '--schema', 'prisma/postgres/schema.prisma']);
run('npx', ['prisma', 'migrate', 'deploy', '--schema', 'prisma/postgres/schema.prisma']);
