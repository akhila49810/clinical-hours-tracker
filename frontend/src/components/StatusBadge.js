import React from 'react';

const map = {
  pending:            { label: 'Pending',         cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  approved:           { label: 'Approved',        cls: 'bg-green-50 text-green-700 border border-green-200' },
  rejected:           { label: 'Rejected',        cls: 'bg-red-50 text-red-700 border border-red-200' },
  revision_requested: { label: 'Revision Needed', cls: 'bg-purple-50 text-purple-700 border border-purple-200' },
};

export default function StatusBadge({ status }) {
  const cfg = map[status] || map.pending;
  return <span className={`status-badge ${cfg.cls}`}>{cfg.label}</span>;
}
