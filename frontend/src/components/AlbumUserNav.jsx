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
          <span>
            {user.displayName}
            {user.role === 'admin' && <em>管理员</em>}
          </span>
          <strong>{user.count}</strong>
        </button>
      ))}
    </nav>
  );
}

export default AlbumUserNav;
