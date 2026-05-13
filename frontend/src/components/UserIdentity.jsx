import { getUserDisplayName } from '../utils/userDisplay';
import UserAvatar from './UserAvatar';

function UserIdentity({
  user,
  avatarSize = 'sm',
  className = '',
  showRole = true,
  meta,
}) {
  const displayName = getUserDisplayName(user);
  const classes = ['user-identity', className].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      <UserAvatar user={user} size={avatarSize} />
      <span className="user-identity-text">
        <span className="user-identity-name">
          {displayName}
          {showRole && user?.role === 'admin' && <span className="admin-badge">管理员</span>}
        </span>
        {meta && <span className="user-identity-meta">{meta}</span>}
      </span>
    </span>
  );
}

export default UserIdentity;
