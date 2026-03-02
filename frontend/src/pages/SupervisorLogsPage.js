import React, { useEffect, useState } from 'react';
import { getAllLogs, reviewLog } from '../hooks/useApi';
import StatusBadge from '../components/StatusBadge';

const STATUSES = ['all','pending','approved','rejected','revision_requested'];

export default function SupervisorLogsPage() {
  const [logs,    setLogs]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);
  const [filter,  setFilter]  = useState('pending');
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);  
  const [feedback,setFeedback]= useState('');
  const [saving,  setSaving]  = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filter !== 'all') params.status = filter;
      const res = await getAllLogs(params);
      setLogs(res.data.logs);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, [page, filter]);

  const handleReview = async (status) => {
    setSaving(true);
    try {
      await reviewLog(modal.id, { status, supervisorFeedback: feedback });
      setModal(null);
      setFeedback('');
      fetchLogs();
    } catch (err) {
      alert(err.response?.data?.message || 'Review failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Review Clinical Logs</h1>
        <p className="text-slate-500 text-sm mt-1">{total} log{total !== 1 ? 's' : ''} found</p>
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
          <p className="text-slate-500">No logs in this category</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {logs.map(log => (
              <div key={log.id} className="card hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-slate-800">{log.student?.name}</h3>
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{log.student?.studentId}</span>
                      <StatusBadge status={log.status} />
                    </div>
                    <p className="text-sm text-slate-600 font-medium">{log.department} — {log.location}</p>
                    <p className="text-sm text-slate-500">
                      📅 {new Date(log.date).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })}
                      &nbsp;•&nbsp; ⏱ {log.hoursLogged} hrs
                      &nbsp;•&nbsp; 👤 {log.patientEncounters} encounters
                    </p>
                    {log.procedures?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {log.procedures.slice(0, 4).map((p, i) => (
                          <span key={i} className="text-xs bg-medical-50 text-medical-700 border border-medical-100 px-2 py-0.5 rounded-full">{p.name}</span>
                        ))}
                        {log.procedures.length > 4 && <span className="text-xs text-slate-400">+{log.procedures.length - 4} more</span>}
                      </div>
                    )}
                    {log.supervisorFeedback && (
                      <p className="text-xs text-purple-600 mt-1 italic">Previous feedback: "{log.supervisorFeedback}"</p>
                    )}
                  </div>
                  {(log.status === 'pending' || log.status === 'revision_requested') && (
                    <button onClick={() => { setModal(log); setFeedback(''); }} className="btn-primary text-sm px-4 py-2 flex-shrink-0">
                      Review
                    </button>
                  )}
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
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Review Log</h3>
            <p className="text-sm text-slate-500 mb-4">
              {modal.student?.name} — {modal.department} — {modal.hoursLogged} hrs
            </p>
            <div className="mb-5">
              <label className="label">Feedback / Comments (optional)</label>
              <textarea value={feedback} onChange={e => setFeedback(e.target.value)}
                className="input-field" rows={3} placeholder="Add feedback for the student…" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button disabled={saving} onClick={() => handleReview('approved')} className="btn-success">✓ Approve</button>
              <button disabled={saving} onClick={() => handleReview('revision_requested')}
                className="bg-purple-500 hover:bg-purple-600 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200">
                ↩ Revision
              </button>
              <button disabled={saving} onClick={() => handleReview('rejected')} className="btn-danger">✕ Reject</button>
            </div>
            <button onClick={() => setModal(null)} className="btn-secondary w-full mt-3">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
