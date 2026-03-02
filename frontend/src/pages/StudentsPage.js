import React, { useEffect, useState } from 'react';
import { getStudents } from '../hooks/useApi';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  useEffect(() => {
    getStudents()
      .then(res => setStudents(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.studentId || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Students</h1>
        <p className="text-slate-500 text-sm mt-1">{students.length} registered student{students.length !== 1 ? 's' : ''}</p>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)}
        className="input-field max-w-sm mb-6" placeholder="🔍 Search by name, email or ID…" />

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-medical-200 border-t-medical-600 rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => (
            <div key={s.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-medical-100 rounded-full flex items-center justify-center">
                  <span className="text-medical-700 font-bold">{s.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{s.name}</p>
                  <p className="text-xs text-slate-400">{s.studentId || 'No ID'}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-1">📧 {s.email}</p>
              {s.department && <p className="text-xs text-slate-500">🏥 {s.department}</p>}
              <p className="text-xs text-slate-400 mt-2">
                Joined {new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-slate-400">
              <span className="text-4xl block mb-2">👥</span>
              <p>No students found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
