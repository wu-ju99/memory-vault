const fs = require('fs/promises');
const path = require('path');

const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

function toUploadUrl(filename) {
  return `/uploads/${filename}`;
}

async function removePath(filePath) {
  if (!filePath) return;
  try {
    await fs.unlink(path.resolve(filePath));
  } catch {}
}

async function removeUploadedFile(file) {
  await removePath(file?.path);
}

async function removeUploadByUrl(url) {
  if (!url) return;
  const filename = path.basename(url);
  await removePath(path.join(UPLOADS_DIR, filename));
}

module.exports = {
  UPLOADS_DIR,
  toUploadUrl,
  removeUploadedFile,
  removeUploadByUrl,
};
