const httpError = require('./httpError');

function normalizeTextFilter(value, maxLength = 100) {
  if (value === undefined || value === null) return '';
  return String(value).trim().slice(0, maxLength);
}

function normalizeOptionalId(value, label = 'ID') {
  if (value === undefined || value === null || value === '') return null;
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw httpError(400, `${label} 无效`);
  }
  return id;
}

function normalizeOptionalYear(value, label = '年份') {
  if (value === undefined || value === null || value === '') return null;
  const year = Number(value);
  const maxYear = new Date().getFullYear() + 1;
  if (!Number.isInteger(year) || year < 1900 || year > maxYear) {
    throw httpError(400, `${label} 必须在 1900 到 ${maxYear} 之间`);
  }
  return year;
}

function normalizeOptionalEnum(value, allowedValues, label = '参数') {
  if (value === undefined || value === null || value === '') return null;
  if (!allowedValues.includes(value)) {
    throw httpError(400, `${label} 无效`);
  }
  return value;
}

function escapeLike(value) {
  return value.replace(/[\\%_]/g, '\\$&');
}

function buildContainsPattern(value) {
  return `%${escapeLike(value)}%`;
}

const LIKE_ESCAPE_SQL = " ESCAPE '\\\\'";

module.exports = {
  normalizeTextFilter,
  normalizeOptionalId,
  normalizeOptionalYear,
  normalizeOptionalEnum,
  buildContainsPattern,
  LIKE_ESCAPE_SQL,
};
