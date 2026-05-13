import UserIdentity from './UserIdentity';

function AlbumUserNav({
  users,
  onSelectUser,
}) {
  if (!users.length) return null;

  return (
    <nav className="album-user-nav" aria-label="当前年份用户">
      <p className="album-user-nav-title">用户</p>
      {users.map((user) => (
        <button
          key={user.userKey}
          onClick={() => onSelectUser(user)}
          type="button"
        >
          <UserIdentity user={user} avatarSize="sm" />
          <strong>{user.count}</strong>
        </button>
      ))}
    </nav>
  );
}

export default AlbumUserNav;
