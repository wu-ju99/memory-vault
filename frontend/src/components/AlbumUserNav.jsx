function AlbumUserNav({
  users,
  totalCount,
  activeUser,
  allUsersValue,
  onSelectUser,
}) {
  if (!users.length) return null;

  return (
    <nav className="album-user-nav" aria-label="按用户浏览相册">
      <button
        className={activeUser === allUsersValue ? 'active' : ''}
        onClick={() => onSelectUser(allUsersValue)}
        type="button"
      >
        <span>全部用户</span>
        <strong>{totalCount}</strong>
      </button>
      {users.map((user) => (
        <button
          key={user.userKey}
          className={activeUser === user.userKey ? 'active' : ''}
          onClick={() => onSelectUser(user.userKey)}
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
