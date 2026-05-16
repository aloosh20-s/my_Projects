"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/utils/api';
import { useToast } from '@/context/ToastContext';

export default function AdminServices() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/services`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (res.ok) setServices(await res.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (res.ok) {
        showToast('Service deleted', 'success');
        fetchServices();
      }
    } catch (error) {
      showToast('Network error', 'error');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Services</h1>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr><th className="p-4">ID</th><th className="p-4">Title</th><th className="p-4">Worker ID</th><th className="p-4">Price</th><th className="p-4">Actions</th></tr>
          </thead>
          <tbody>
            {services.map((s: any) => (
              <tr key={s.id} className="border-b last:border-0">
                <td className="p-4">{s.id}</td>
                <td className="p-4 max-w-xs truncate">{s.title}</td>
                <td className="p-4">{s.workerId}</td>
                <td className="p-4">${s.price}</td>
                <td className="p-4">
                  <button onClick={() => handleDelete(s.id)} className="px-3 py-1 bg-red-500 text-white rounded text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {services.length === 0 && <div className="p-8 text-center text-slate-500">No services found.</div>}
      </div>
    </div>
  );
}
