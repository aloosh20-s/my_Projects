"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/utils/api';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';

export default function AdminUsers() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (res.ok) setUsers(await res.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` },
        body: JSON.stringify({ status: 'suspended' })
      });
      if (res.ok) {
        showToast('User suspended', 'success');
        fetchUsers();
      }
    } catch (error) {
      showToast('Network error', 'error');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Users</h1>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr><th className="p-4">ID</th><th className="p-4">Name</th><th className="p-4">Role</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="p-4">{u.id}</td>
                <td className="p-4">{u.name}</td>
                <td className="p-4">{u.role}</td>
                <td className="p-4">{u.status}</td>
                <td className="p-4 space-x-2">
                  <Link href={`/messages?userId=${u.id}`} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs font-semibold">Message</Link>
                  {u.status !== 'suspended' && <button onClick={() => handleSuspend(u.id)} className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-xs font-semibold">Suspend</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
