import BASE_URL from '../config';
import { getUserDisplayName } from '../utils/userDisplay';

function getInitial(user) {
  const name = getUserDisplayName(user).trim();
  return name ? name[0].toUpperCase() : '?';
}

function UserAvatar({ user, size = 'sm' }) {
  const avatarUrl = user?.avatar ? `${BASE_URL}${user.avatar}` : '';
  const displayName = getUserDisplayName(user);

  return (
    <span className={`user-avatar user-avatar-${size}`} aria-label={displayName}>
      {avatarUrl ? (
        <img src={avatarUrl} alt="" />
      ) : (
        <span>{getInitial(user)}</span>
      )}
    </span>
  );
}

export default UserAvatar;
