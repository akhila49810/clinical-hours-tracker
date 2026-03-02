import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyLogs, deleteLog } from '../hooks/useApi';
import StatusBadge from '../components/StatusBadge';

const STATUSES = ['all','pending','approved','rejected','revision_requested'];

export default function MyLogsPage() {
  const [logs,   setLogs]    = useState([]);
  const [total,  setTotal]   = useState(0);
  const [page,   setPage]    = useState(1);
  const [pages,  setPages]   = useState(1);
  const [filter, setFilter]  = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filter !== 'all') params.status = filter;
      const res = await getMyLogs(params);
      setLogs(res.data.logs);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, [page, filter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this log?')) return;
    try { await deleteLog(id); fetchLogs(); }
    catch (err) { alert(err.response?.data?.message || 'Failed to delete'); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Clinical Logs</h1>
          <p className="text-slate-500 text-sm mt-1">{total} submission{total !== 1 ? 's' : ''} total</p>
        </div>
        <Link to="/logs/new" className="btn-primary w-fit">+ Log New Hours</Link>
      </div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUSES.map(s => (
          <button key={s} onClick={() => { setFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${filter === s ? 'bg-medical-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {s === 'revision_requested' ? 'Revision' : s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-medical-200 border-t-medical-600 rounded-full animate-spin" /></div>
      ) : logs.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-slate-400">
          <span className="text-5xl mb-3">📋</span>
          <p className="text-lg font-medium text-slate-600">No logs found</p>
          <Link to="/logs/new" className="btn-primary mt-4">Log Hours Now</Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {logs.map(log => (
              <div key={log.id} className="card hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-slate-800">{log.department}</h3>
                      <StatusBadge status={log.status} />
                    </div>
                    <p className="text-sm text-slate-500">
                      📅 {new Date(log.date).toLocaleDateString('en-US', { weekday:'short', month:'long', day:'numeric', year:'numeric' })}
                      &nbsp;•&nbsp; ⏱ {log.hoursLogged} hrs
                      &nbsp;•&nbsp; 📍 {log.location}
                    </p>
                    {log.procedures?.length > 0 && (
                      <p className="text-xs text-slate-400 mt-1">🩺 {log.procedures.length} procedure{log.procedures.length !== 1 ? 's' : ''} logged</p>
                    )}
                    {log.supervisorFeedback && (
                      <p className="text-xs text-purple-600 mt-1 italic">💬 "{log.supervisorFeedback}"</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => navigate(`/logs/${log.id}`)} className="btn-secondary text-sm px-3 py-1.5">View</button>
                    {log.status !== 'approved' && (
                      <button onClick={() => handleDelete(log.id)} className="btn-danger text-sm px-3 py-1.5">Delete</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium ${p === page ? 'bg-medical-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
