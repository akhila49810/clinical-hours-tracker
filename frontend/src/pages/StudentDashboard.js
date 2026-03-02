import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { getStudentDashboard } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

const COLORS = ['#0ea5e9', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6'];

function StatCard({ icon, label, value, sub, accent = false }) {
  return (
    <div className={`card flex items-center gap-4 ${accent ? 'border-medical-200 bg-medical-50' : ''}`}>
      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl flex-shrink-0">{icon}</div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm font-medium text-slate-600">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user }   = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentDashboard()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-medical-200 border-t-medical-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Loading dashboard…</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Good day, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-slate-500 mt-1 text-sm">Here's a summary of your clinical progress</p>
        </div>
        <Link to="/logs/new" className="btn-primary flex items-center gap-2 w-fit">+ Log Clinical Hours</Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="⏱️" label="Total Hours Logged"  value={data?.stats.totalHours    || 0} sub="All submissions" />
        <StatCard icon="✅" label="Approved Hours"       value={data?.stats.approvedHours  || 0} sub="Verified by supervisor" accent />
        <StatCard icon="🔄" label="Pending Review"       value={data?.stats.pendingLogs    || 0} sub="Awaiting approval" />
        <StatCard icon="🩺" label="Patient Encounters"   value={data?.stats.totalEncounters|| 0} sub="Total encounters" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="font-semibold text-slate-700 mb-4">Monthly Hours (Last 6 Months)</h3>
          {data?.monthlyData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.monthlyData}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [`${v} hrs`, 'Hours']} />
                <Bar dataKey="hours" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty text="Log hours to see trends" />}
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-700 mb-4">Hours by Department</h3>
          {data?.byDepartment?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data.byDepartment} dataKey="hours" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {data.byDepartment.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => [`${v} hrs`]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <Empty text="No department data yet" />}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="font-semibold text-slate-700 mb-4">Log Status Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: 'Approved', count: data?.stats.approvedLogs || 0, color: 'bg-green-400' },
              { label: 'Pending',  count: data?.stats.pendingLogs  || 0, color: 'bg-amber-400' },
              { label: 'Rejected', count: data?.stats.rejectedLogs || 0, color: 'bg-red-400' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm text-slate-600">{item.label}</span>
                </div>
                <span className="text-sm font-semibold text-slate-800">{item.count}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-slate-100 flex justify-between text-sm">
              <span className="text-slate-500">Total</span>
              <span className="font-bold text-slate-800">{data?.stats.totalLogs || 0}</span>
            </div>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700">Recent Submissions</h3>
            <Link to="/logs" className="text-sm text-medical-600 hover:underline">View all →</Link>
          </div>
          {data?.recentLogs?.length > 0 ? (
            <div className="space-y-3">
              {data.recentLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-700 text-sm">{log.department}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {log.hoursLogged} hrs
                    </p>
                  </div>
                  <StatusBadge status={log.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 text-slate-400">
              <span className="text-4xl mb-2">📋</span>
              <p className="text-sm">No logs yet. Start tracking your hours!</p>
              <Link to="/logs/new" className="mt-3 btn-primary text-sm px-4 py-2">Log First Hours</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Empty({ text }) {
  return <div className="h-48 flex items-center justify-center text-slate-400 text-sm">{text}</div>;
}
