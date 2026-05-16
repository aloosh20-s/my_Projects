"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/utils/api';
import { useToast } from '@/context/ToastContext';

export default function AdminReports() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/reports`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (res.ok) {
        setReports(await res.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/reports/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast(`Report marked as ${status}`, 'success');
        fetchReports();
      } else {
        const data = await res.json();
        showToast(data.message || 'Failed to update', 'error');
      }
    } catch (error) {
      showToast('Network error', 'error');
    }
  };

  if (loading) return <div>Loading reports...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Reports</h1>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-4 font-semibold text-sm">ID</th>
              <th className="p-4 font-semibold text-sm">Type</th>
              <th className="p-4 font-semibold text-sm">Target ID</th>
              <th className="p-4 font-semibold text-sm">Reason</th>
              <th className="p-4 font-semibold text-sm">Status</th>
              <th className="p-4 font-semibold text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r: any) => (
              <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="p-4 text-sm">{r.id}</td>
                <td className="p-4 font-medium capitalize">{r.targetType}</td>
                <td className="p-4 text-sm">{r.targetId}</td>
                <td className="p-4 text-sm text-slate-500 max-w-xs truncate" title={r.reason}>{r.reason}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-md ${r.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {r.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  {r.status === 'pending' && (
                    <>
                      <button onClick={() => handleUpdateStatus(r.id, 'reviewed')} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs font-semibold">Mark Reviewed</button>
                      <button onClick={() => handleUpdateStatus(r.id, 'resolved')} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs font-semibold">Mark Resolved</button>
                      <button onClick={() => handleUpdateStatus(r.id, 'dismissed')} className="px-3 py-1 bg-slate-500 text-white rounded hover:bg-slate-600 text-xs font-semibold">Dismiss</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reports.length === 0 && <div className="p-8 text-center text-slate-500">No reports found.</div>}
      </div>
    </div>
  );
}
