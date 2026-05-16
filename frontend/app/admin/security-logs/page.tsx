"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/utils/api';

export default function AdminSecurityLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/security-logs`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (res.ok) {
        setLogs(await res.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Security Logs</h1>
      <div className="bg-slate-900 text-green-400 p-6 rounded-xl shadow-sm border border-slate-800 overflow-x-auto font-mono text-sm h-[600px] overflow-y-auto">
        {logs.length === 0 ? (
          <p className="text-slate-500">No logs found.</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="whitespace-pre break-all mb-1 border-b border-slate-800/50 pb-1">
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
