import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser, registerUser } from '../hooks/useApi';

const DEPARTMENTS = [
  'Internal Medicine','Surgery','Pediatrics','Obstetrics & Gynecology',
  'Emergency Medicine','Psychiatry','Radiology','Pathology','Orthopedics','Cardiology',
];

export default function AuthPage() {
  const [mode, setMode]   = useState('login');
  const [form, setForm]   = useState({ name: '', email: '', password: '', role: 'student', studentId: '', department: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = mode === 'login'
        ? await loginUser({ email: form.email, password: form.password })
        : await registerUser(form);
      login(res.data);
      navigate(res.data.role === 'supervisor' ? '/supervisor' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
     
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-medical-900 to-medical-600 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-white -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-white translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <span className="text-medical-700 font-bold text-lg">V</span>
          </div>
          <span className="text-white font-semibold text-lg">VOM Medical College</span>
        </div>

        <div className="relative">
          <h1 className="font-display text-4xl font-bold text-white leading-tight mb-4">
            Clinical Hours<br />Tracker Portal
          </h1>
          <p className="text-medical-200 text-lg leading-relaxed mb-8">
            Log rotations, track procedures, and get supervisor approval — all in one place.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[['⏱️','Track Hours'],['🩺','Log Procedures'],['✅','Get Approved'],['📊','View Progress']].map(([icon, label]) => (
              <div key={label} className="bg-white/10 rounded-xl p-4 flex items-center gap-3">
                <span className="text-2xl">{icon}</span>
                <span className="text-white font-medium text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-medical-300 text-sm">© 2024 VOM Medical College. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-medical-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="text-slate-800 font-semibold text-lg">VOM Medical College</span>
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              {mode === 'login' ? 'Sign in to the clinical portal' : 'Register for the clinical portal'}
            </p>

            {/* Tab toggle */}
            <div className="flex bg-slate-100 rounded-lg p-1 mb-6">
              {['login','register'].map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(''); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    mode === m ? 'bg-white shadow text-medical-700' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {m === 'login' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="label">Full Name</label>
                    <input name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="Dr. Jane Smith" required />
                  </div>
                  <div>
                    <label className="label">Role</label>
                    <select name="role" value={form.role} onChange={handleChange} className="input-field">
                      <option value="student">Student</option>
                      <option value="supervisor">Supervisor</option>
                    </select>
                  </div>
                  {form.role === 'student' && (
                    <div>
                      <label className="label">Student ID</label>
                      <input name="studentId" value={form.studentId} onChange={handleChange} className="input-field" placeholder="VOM2024001" />
                    </div>
                  )}
                  <div>
                    <label className="label">Department</label>
                    <select name="department" value={form.department} onChange={handleChange} className="input-field">
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="label">Email Address</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" placeholder="you@vom.edu" required />
              </div>
              <div>
                <label className="label">Password</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} className="input-field" placeholder="••••••••" required minLength={6} />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-4">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} className="text-medical-600 font-medium hover:underline">
                {mode === 'login' ? 'Register' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
