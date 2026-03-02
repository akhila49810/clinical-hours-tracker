import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const studentLinks    = [
  { to: '/dashboard',   label: 'Dashboard', icon: '📊' },
  { to: '/logs',        label: 'My Logs',   icon: '📋' },
  { to: '/logs/new',    label: 'Log Hours', icon: '➕' },
];
const supervisorLinks = [
  { to: '/supervisor',          label: 'Dashboard',    icon: '📊' },
  { to: '/supervisor/logs',     label: 'Review Logs',  icon: '📋' },
  { to: '/supervisor/students', label: 'Students',     icon: '👥' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [open, setOpen] = useState(false);
  const links = user?.role === 'supervisor' ? supervisorLinks : studentLinks;

  return (
    <nav className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-medical-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm leading-tight">VOM Clinical Portal</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
            </div>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  location.pathname === link.to
                    ? 'bg-medical-50 text-medical-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{link.icon}</span>{link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-600">
              <div className="w-8 h-8 bg-medical-100 rounded-full flex items-center justify-center">
                <span className="text-medical-700 font-semibold text-xs">{user?.name?.charAt(0)}</span>
              </div>
              <span className="font-medium">{user?.name}</span>
            </div>
            <button onClick={() => { logout(); navigate('/'); }} className="btn-secondary text-sm px-3 py-1.5">
              Logout
            </button>
            <button className="md:hidden p-2 text-slate-600" onClick={() => setOpen(!open)}>☰</button>
          </div>
        </div>

      
        {open && (
          <div className="md:hidden pb-4 space-y-1">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  location.pathname === link.to ? 'bg-medical-50 text-medical-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {link.icon} {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
