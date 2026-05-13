import { useState } from 'react';
import {
  deleteAdminUser,
  updateAdminUser,
} from '../api/admin';
import getErrorMessage from '../utils/apiError';

export default function useAdminUserMutations(onUsersChanged) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function refreshUsers() {
    await onUsersChanged?.();
  }

  async function saveUser(userId, fields) {
    setMessage('');
    setError('');
    try {
      const updated = await updateAdminUser(userId, fields);
      await refreshUsers();
      setMessage('成员信息已更新');
      return updated;
    } catch (mutationError) {
      setError(getErrorMessage(mutationError, '更新成员失败'));
      throw mutationError;
    }
  }

  async function removeUser(userId) {
    setMessage('');
    setError('');
    try {
      await deleteAdminUser(userId);
      await refreshUsers();
      setMessage('成员已删除');
      return { ok: true };
    } catch (mutationError) {
      const nextError = getErrorMessage(mutationError, '删除成员失败');
      setError(nextError);
      return { ok: false, error: nextError };
    }
  }

  return {
    message,
    error,
    saveUser,
    removeUser,
  };
}
