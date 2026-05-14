const httpError = require('./httpError');

function parseId(value, label = 'ID') {
  const id = parseInt(value, 10);
  if (!Number.isInteger(id) || id <= 0) {
    throw httpError(400, `${label} 无效`);
  }
  return id;
}

module.exports = parseId;
