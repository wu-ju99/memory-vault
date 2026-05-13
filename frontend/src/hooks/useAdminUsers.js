import useAdminUsersQuery from './useAdminUsersQuery';
import useAdminUserMutations from './useAdminUserMutations';

export default function useAdminUsers(filters = { q: '', role: '' }) {
  const query = useAdminUsersQuery(filters);
  const mutations = useAdminUserMutations(query.reload);

  return {
    users: query.users,
    loading: query.loading,
    message: mutations.message,
    error: mutations.error || query.error,
    saveUser: mutations.saveUser,
    removeUser: mutations.removeUser,
    reloadUsers: query.reload,
  };
}
