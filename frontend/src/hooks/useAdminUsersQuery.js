import { useCallback, useEffect, useState } from 'react';
import { fetchAdminUsers } from '../api/admin';
import getErrorMessage from '../utils/apiError';

export default function useAdminUsersQuery(filters) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await fetchAdminUsers({
        q: filters.q,
        role: filters.role,
      });
      setUsers(rows);
      return rows;
    } catch (loadError) {
      setUsers([]);
      setError(getErrorMessage(loadError, '加载成员失败'));
      return [];
    } finally {
      setLoading(false);
    }
  }, [filters.q, filters.role]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    users,
    loading,
    error,
    reload: loadUsers,
  };
}
