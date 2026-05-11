import { useCallback, useEffect, useState } from 'react';
import {
  deleteAdminUser,
  fetchAdminUsers,
  updateAdminUser,
} from '../api/admin';

function getErrorMessage(error, fallback) {
  return error.response?.data?.message || fallback;
}

export default function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadUsers = useCallback(() => {
    setLoading(true);
    fetchAdminUsers()
      .then(setUsers)
      .catch((err) => setError(getErrorMessage(err, '加载成员失败')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function saveUser(userId, fields) {
    setMessage('');
    setError('');
    try {
      const updated = await updateAdminUser(userId, fields);
      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, ...updated } : user)));
      setMessage('成员信息已更新');
    } catch (err) {
      setError(getErrorMessage(err, '更新成员失败'));
    }
  }

  async function removeUser(userId) {
    setMessage('');
    setError('');
    try {
      await deleteAdminUser(userId);
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      setMessage('成员已删除');
    } catch (err) {
      setError(getErrorMessage(err, '删除成员失败'));
    }
  }

  return {
    users,
    loading,
    message,
    error,
    saveUser,
    removeUser,
    reloadUsers: loadUsers,
  };
}
