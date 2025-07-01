'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  document_type: string;
  document_number: string;
  email: string;
  password: string;
  type: number;
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { loading, error, get, put } = useApi<User[]>();

  // Sanitizar datos para evitar valores null/undefined
  const sanitizeUser = (user: User): User => ({
    id: user.id || 0,
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    document_type: user.document_type || '1',
    document_number: user.document_number || '',
    email: user.email || '',
    password: user.password || '',
    type: user.type || 2,
  });

  const fetchUsers = useCallback(async () => {
    const response = await get('/user/list');
    if (response) {
      const data = Array.isArray(response) ? response : [];
      const sanitizedData = data.map(sanitizeUser);
      setUsers(sanitizedData);
    } else {
      setUsers([]);
    }
  }, [get]);

  const addUser = useCallback((newUser: Omit<User, 'id'>) => {
    const userWithId = {
      ...newUser,
      id: users.length + 1, // Temporal, en producción sería generado por la API
    };
    setUsers(prev => [...prev, userWithId]);
  }, [users.length]);

  const updateUser = useCallback((updatedUser: User) => {
    setUsers(prev =>
      prev.map(user => user.id === updatedUser.id ? updatedUser : user)
    );
  }, []);

  const deleteUser = useCallback(async (id: number): Promise<boolean> => {
    try {
      await put(`/user/update/${id}`, { active: false });
      setUsers(prev => prev.filter(user => user.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting user:', err);
      return false;
    }
  }, [put]);

  const handleUserSubmit = useCallback((user: Omit<User, 'id'>, editingUser?: User | null) => {
    if (editingUser) {
      const updatedUser = { ...editingUser, ...user, id: editingUser.id };
      updateUser(updatedUser);
    } else {
      addUser(user);
    }
  }, [addUser, updateUser]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
    handleUserSubmit
  };
};
