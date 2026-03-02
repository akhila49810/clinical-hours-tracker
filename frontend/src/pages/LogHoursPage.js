import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createLog } from '../hooks/useApi';

const DEPARTMENTS = [
  'Internal Medicine','Surgery','Pediatrics','Obstetrics & Gynecology',
  'Emergency Medicine','Psychiatry','Radiology','Pathology','Orthopedics','Cardiology',
];
const PROC_CATEGORIES  = ['Observed','Assisted','Performed','Supervised'];
const COMMON_PROCEDURES = [
  'Blood Draw','IV Insertion','Physical Exam','Suturing','ECG Interpretation',
  'Patient History Taking','Wound Dressing','CPR','Intubation','Catheter Insertion',
];

export default function LogHoursPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    department: '', location: '', hoursLogged: '',
    patientEncounters: '', learningObjectives: '', reflections: '',
  });
  const [procedures, setProcedures] = useState([]);
  const [newProc, setNewProc] = useState({ name: '', category: 'Observed', notes: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addProcedure = () => {
    if (!newProc.name.trim()) return;
    setProcedures([...procedures, { ...newProc, _id: Date.now() }]);
    setNewProc({ name: '', category: 'Observed', notes: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createLog({ ...form, procedures: procedures.map(({ _id, ...rest }) => rest) });
      navigate('/logs');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit log');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-slate-700 mb-3 flex items-center gap-1">← Back</button>
        <h1 className="text-2xl font-bold text-slate-800">Log Clinical Hours</h1>
        <p className="text-slate-500 mt-1 text-sm">Record your rotation details for supervisor review</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-6">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
      
        <div className="card">
          <h2 className="font-semibold text-slate-700 mb-4">📅 Rotation Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Date *</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="label">Hours Logged *</label>
              <input type="number" name="hoursLogged" value={form.hoursLogged} onChange={handleChange}
                className="input-field" placeholder="e.g. 8" min="0.5" max="24" step="0.5" required />
            </div>
            <div>
              <label className="label">Department *</label>
              <select name="department" value={form.department} onChange={handleChange} className="input-field" required>
                <option value="">Select Department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Location / Hospital *</label>
              <input name="location" value={form.location} onChange={handleChange}
                className="input-field" placeholder="e.g. VOM Teaching Hospital" required />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Patient Encounters</label>
              <input type="number" name="patientEncounters" value={form.patientEncounters}
                onChange={handleChange} className="input-field" placeholder="Number of patients seen" min="0" />
            </div>
          </div>
        </div>

    
        <div className="card">
          <h2 className="font-semibold text-slate-700 mb-4">🩺 Procedures</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="label">Procedure Name</label>
              <input list="proc-list" value={newProc.name}
                onChange={e => setNewProc({ ...newProc, name: e.target.value })}
                className="input-field" placeholder="e.g. Blood Draw" />
              <datalist id="proc-list">
                {COMMON_PROCEDURES.map(p => <option key={p} value={p} />)}
              </datalist>
            </div>
            <div>
              <label className="label">Category</label>
              <select value={newProc.category} onChange={e => setNewProc({ ...newProc, category: e.target.value })} className="input-field">
                {PROC_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button type="button" onClick={addProcedure} className="btn-primary w-full">+ Add</button>
            </div>
          </div>
          {procedures.length > 0 ? (
            <div className="space-y-2 mt-4">
              {procedures.map(p => (
                <div key={p._id} className="flex items-center justify-between bg-medical-50 border border-medical-100 rounded-lg px-4 py-2.5">
                  <div>
                    <span className="font-medium text-sm text-slate-700">{p.name}</span>
                    <span className="ml-2 text-xs text-medical-600 bg-medical-100 px-2 py-0.5 rounded-full">{p.category}</span>
                  </div>
                  <button type="button" onClick={() => setProcedures(procedures.filter(x => x._id !== p._id))}
                    className="text-red-400 hover:text-red-600 text-sm">✕</button>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-slate-400 italic">No procedures added yet</p>}
        </div>

        
        <div className="card">
          <h2 className="font-semibold text-slate-700 mb-4">📝 Reflection</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Learning Objectives</label>
              <textarea name="learningObjectives" value={form.learningObjectives} onChange={handleChange}
                className="input-field" rows={3} placeholder="What were your learning objectives for this rotation?" />
            </div>
            <div>
              <label className="label">Reflections</label>
              <textarea name="reflections" value={form.reflections} onChange={handleChange}
                className="input-field" rows={4} placeholder="What did you learn? Any challenges or highlights?" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Submitting…' : '✓ Submit for Approval'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
