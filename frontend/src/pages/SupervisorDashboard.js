import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getSupervisorDashboard } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

const COLORS = ['#0ea5e9','#14b8a6','#f59e0b','#ef4444'];

export default function SupervisorDashboard() {
  const { user } = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSupervisorDashboard()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-medical-200 border-t-medical-600 rounded-full animate-spin" />
    </div>
  );

  const statusData = data?.statusBreakdown?.map(s => ({ name: s._id, value: s.count })) || [];
  const deptData   = data?.topDepartments?.map(d  => ({ name: d._id, hours: d.totalHours })) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Supervisor Dashboard</h1>
        <p className="text-slate-500 mt-1 text-sm">Welcome, {user?.name}. Here's an overview of student submissions.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: '👥', label: 'Total Students',  value: data?.stats.totalStudents  || 0 },
          { icon: '📋', label: 'Total Logs',       value: data?.stats.totalLogs      || 0 },
          { icon: '🔄', label: 'Pending Review',   value: data?.stats.pendingReview  || 0, hi: true },
          { icon: '✅', label: 'Approved Today',   value: data?.stats.approvedToday  || 0 },
        ].map(s => (
          <div key={s.label} className={`card ${s.hi && s.value > 0 ? 'border-amber-200 bg-amber-50' : ''}`}>
            <p className="text-3xl mb-1">{s.icon}</p>
            <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            <p className="text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="font-semibold text-slate-700 mb-4">Top Departments by Hours</h3>
          {deptData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deptData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v} hrs`]} />
                <Bar dataKey="hours" fill="#0ea5e9" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data yet</div>}
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-700 mb-4">Submission Status Breakdown</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No submissions yet</div>}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-700">Latest Pending Reviews</h3>
          <Link to="/supervisor/logs" className="text-sm text-medical-600 hover:underline">View all →</Link>
        </div>
        {data?.recentSubmissions?.length > 0 ? (
          <div className="space-y-3">
            {data.recentSubmissions.map(log => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <div>
                  <p className="font-medium text-slate-700 text-sm">
                    {log.student?.name} <span className="text-slate-400">({log.student?.studentId})</span>
                  </p>
                  <p className="text-xs text-slate-500">{log.department} • {log.hoursLogged} hrs • {new Date(log.createdAt).toLocaleDateString()}</p>
                </div>
                <Link to="/supervisor/logs" className="btn-primary text-xs px-3 py-1.5">Review</Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 text-slate-400">
            <span className="text-4xl mb-2">✅</span>
            <p className="text-sm">All caught up! No pending reviews.</p>
          </div>
        )}
      </div>
    </div>
  );
}
