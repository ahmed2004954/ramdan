process.loadEnvFile?.();

const fs = require('fs');
const path = require('path');

function resolveSqlitePath(databaseUrl) {
  if (!databaseUrl || !databaseUrl.startsWith('file:')) {
    throw new Error('DATABASE_URL يجب أن يكون من نوع SQLite.');
  }

  const rawPath = databaseUrl.replace('file:', '');

  if (path.isAbsolute(rawPath)) {
    return rawPath;
  }

  if (rawPath.startsWith('./')) {
    return path.join(process.cwd(), 'prisma', rawPath.replace('./', ''));
  }

  return path.join(process.cwd(), rawPath);
}

const databasePath = resolveSqlitePath(process.env.DATABASE_URL || 'file:./dev.db');
const directory = path.dirname(databasePath);

if (!fs.existsSync(directory)) {
  fs.mkdirSync(directory, { recursive: true });
}

if (!fs.existsSync(databasePath)) {
  fs.closeSync(fs.openSync(databasePath, 'w'));
}
