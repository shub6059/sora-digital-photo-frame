const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB

const SIZE_UNITS = {
  b: 1,
  kb: 1024,
  mb: 1024 * 1024,
  gb: 1024 * 1024 * 1024,
  tb: 1024 * 1024 * 1024 * 1024
};

function parseFileSize(value) {
  if (typeof value === 'number') {
    return value;
  }

  if (!value || typeof value !== 'string') {
    return NaN;
  }

  const match = value.trim().toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb|tb)?$/);
  if (!match) {
    return NaN;
  }

  const amount = Number.parseFloat(match[1]);
  const unit = match[2] || 'b';

  return amount * SIZE_UNITS[unit];
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, unitIndex);
  const precision = value >= 10 || unitIndex === 0 ? 0 : 1;

  return `${value.toFixed(precision)} ${units[unitIndex]}`;
}

function getMaxFileSize() {
  const configuredLimit = parseFileSize(process.env.MAX_FILE_SIZE);
  return Number.isFinite(configuredLimit) && configuredLimit > 0
    ? configuredLimit
    : DEFAULT_MAX_FILE_SIZE;
}

module.exports = {
  DEFAULT_MAX_FILE_SIZE,
  parseFileSize,
  formatBytes,
  getMaxFileSize
};
