export function getUserDisplayName(item) {
  return item?.nickname || item?.username || '未知用户';
}

export function getUserGroupKey(item) {
  if (item?.user_id) return `user-${item.user_id}`;
  return 'unknown-user';
}
