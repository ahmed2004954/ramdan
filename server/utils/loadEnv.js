function ensureLocalSqliteDatabaseUrl() {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('file:')) {
    return;
  }

  process.env.DATABASE_URL = process.env.SQLITE_DATABASE_URL || 'file:./dev.db';
}

function loadEnvIfExists() {
  if (typeof process.loadEnvFile !== 'function') {
    ensureLocalSqliteDatabaseUrl();
    return;
  }

  try {
    process.loadEnvFile();
  } catch (error) {
    if (error && error.code !== 'ENOENT') {
      throw error;
    }
  }

  ensureLocalSqliteDatabaseUrl();
}

module.exports = {
  loadEnvIfExists,
};
