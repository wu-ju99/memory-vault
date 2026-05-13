const mediaManagementService = require('./mediaManagementService');

async function deleteMedia(mediaId, adminUser) {
  return mediaManagementService.deleteMedia(mediaId, adminUser);
}

module.exports = {
  deleteMedia,
};
