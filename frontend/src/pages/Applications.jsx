import { useEffect, useState } from 'react';
import { Plus, X, Trash2, Building2 } from 'lucide-react';
import { applicationsApi } from '../api/client.js';
import { Loader, ErrorState, EmptyState } from '../components/Loader.jsx';

// Proper status-tracker board (replaces the old bare table). Columns are the
// actual pipeline stages a real job hunt goes through - Saved -> Applied ->
// Interview -> Offered, with Rejected as a terminal column - so at a glance
// you can see how many applications are sitting where, and move any card
// forward/back with its own status dropdown (backed by the existing
// PATCH /applications/:id, which already supported this - it just wasn't
// wired to any UI before).
const COLUMNS = [
  { key: 'saved', label: 'Saved', pill: 'pill-muted' },
  { key: 'applied', label: 'Applied', pill: 'pill-accent' },
  { key: 'interview', label: 'Interview', pill: 'pill-accent' },
  { key: 'offered', label: 'Offered', pill: 'pill-success' },
  { key: 'rejected', label: 'Rejected', pill: 'pill-danger' }
];

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [status, setStatus] = useState('loading');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ company: '', role: '', status: 'applied' });
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setStatus('loading');
    try {
      const { data } = await applicationsApi.list();
      setApps(data.applications || []);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.company || !form.role) return;
    setSaving(true);
    try {
      await applicationsApi.create(form);
      setForm({ company: '', role: '', status: 'applied' });
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const moveStatus = async (app, newStatus) => {
    setBusyId(app.id);
    setApps((prev) => prev.map((a) => (a.id === app.id ? { ...a, status: newStatus } : a)));
    try {
      await applicationsApi.update(app.id, { status: newStatus });
    } finally {
      setBusyId(null);
    }
  };

  const removeApp = async (app) => {
    setBusyId(app.id);
    try {
      await applicationsApi.remove(app.id);
      setApps((prev) => prev.filter((a) => a.id !== app.id));
    } finally {
      setBusyId(null);
    }
  };

  if (status === 'loading') return <Loader text="Loading applications..." />;
  if (status === 'error') return <ErrorState message="Couldn't load applications." onRetry={load} />;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-fg text-lg font-semibold">Applications</h2>
        <button onClick={() => setShowForm((s) => !s)} className="btn-accent px-4 py-2 text-sm flex items-center gap-2">
          <Plus size={15} /> Add Application
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card p-5 flex items-end gap-3 flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Company</label>
            <input className="input w-40" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Role</label>
            <input className="input w-48" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Status</label>
            <select className="input w-32" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {COLUMNS.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={saving} className="btn-accent px-4 py-2.5 text-sm">
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={() => setShowForm(false)} className="w-9 h-9 rounded-btn border border-border text-muted flex items-center justify-center">
            <X size={14} />
          </button>
        </form>
      )}

      {apps.length === 0 ? (
        <EmptyState message="No applications yet. Add one or apply from Opportunity Matcher." />
      ) : (
        <div className="grid grid-cols-5 gap-4 items-start">
          {COLUMNS.map((col) => {
            const colApps = apps.filter((a) => a.status === col.key);
            return (
              <div key={col.key} className="card p-0 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <span className="text-fg text-sm font-medium">{col.label}</span>
                  <span className="pill-muted text-[11px]">{colApps.length}</span>
                </div>
                <div className="flex flex-col gap-2 p-3 min-h-[80px]">
                  {colApps.length === 0 ? (
                    <p className="text-muted text-xs px-1 py-2">No applications here.</p>
                  ) : (
                    colApps.map((a) => (
                      <div key={a.id} className="border border-border rounded-input p-3 flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-input bg-surface2 flex items-center justify-center shrink-0">
                              <Building2 size={13} className="text-accent-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-fg text-xs font-medium truncate">{a.company}</p>
                              <p className="text-muted text-[11px] truncate">{a.role}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeApp(a)}
                            disabled={busyId === a.id}
                            className="text-muted hover:text-danger shrink-0"
                            title="Remove"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-muted">
                          <span>{a.matchPercent ? `${a.matchPercent}% match` : '—'}</span>
                          <span>{a.appliedOn || '—'}</span>
                        </div>
                        <select
                          value={a.status}
                          disabled={busyId === a.id}
                          onChange={(e) => moveStatus(a, e.target.value)}
                          className="input text-[11px] py-1.5"
                        >
                          {COLUMNS.map((c) => (
                            <option key={c.key} value={c.key}>
                              Move to {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
