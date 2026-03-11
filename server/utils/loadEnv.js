function loadEnvIfExists() {
  if (typeof process.loadEnvFile !== 'function') {
    return;
  }

  try {
    process.loadEnvFile();
  } catch (error) {
    if (error && error.code !== 'ENOENT') {
      throw error;
    }
  }
}

module.exports = {
  loadEnvIfExists,
};
