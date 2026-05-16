"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/utils/api';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';

export default function AdminWorkers() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/workers`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (res.ok) {
        setWorkers(await res.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast(`Worker marked as ${status}`, 'success');
        fetchWorkers();
      } else {
        const data = await res.json();
        showToast(data.message || 'Failed to update', 'error');
      }
    } catch (error) {
      showToast('Network error', 'error');
    }
  };

  if (loading) return <div>Loading workers...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Workers</h1>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-4 font-semibold text-sm">ID</th>
              <th className="p-4 font-semibold text-sm">Name</th>
              <th className="p-4 font-semibold text-sm">Email</th>
              <th className="p-4 font-semibold text-sm">Status</th>
              <th className="p-4 font-semibold text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {workers.map((w: any) => (
              <tr key={w.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="p-4 text-sm">{w.id}</td>
                <td className="p-4 font-medium">{w.name}</td>
                <td className="p-4 text-sm text-slate-500">{w.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-md ${w.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : w.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {w.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <Link href={`/messages?userId=${w.id}`} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs font-semibold">Message</Link>
                  {w.status === 'pending' && (
                    <>
                      <button onClick={() => handleUpdateStatus(w.id, 'approved')} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs font-semibold">Approve</button>
                      <button onClick={() => handleUpdateStatus(w.id, 'rejected')} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs font-semibold">Reject</button>
                    </>
                  )}
                  {w.status === 'approved' && (
                    <button onClick={() => handleUpdateStatus(w.id, 'suspended')} className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-xs font-semibold">Suspend</button>
                  )}
                  {w.status === 'suspended' && (
                    <button onClick={() => handleUpdateStatus(w.id, 'approved')} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs font-semibold">Reactivate</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {workers.length === 0 && <div className="p-8 text-center text-slate-500">No workers found.</div>}
      </div>
    </div>
  );
}
