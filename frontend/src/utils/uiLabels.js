export const UNKNOWN_YEAR_LABEL = '未标注年份';

export function getMediaTypeLabel(type) {
  if (type === 'image') return '照片';
  if (type === 'video') return '视频';
  return type;
}

export function getRoleLabel(role) {
  if (role === 'admin') return '管理员';
  if (role === 'user') return '普通用户';
  return role;
}
