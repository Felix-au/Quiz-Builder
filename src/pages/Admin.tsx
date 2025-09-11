import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";

const API_BASE = import.meta.env.VITE_RESULTS_API_URL || "https://result-ocy1.onrender.com";

type Testimonial = {
  _id?: string;
  name: string;
  role: string;
  institution: string;
  image: string;
  quote: string;
};

export default function Admin() {
  const { theme } = useTheme();
  const [password, setPassword] = React.useState("");
  const [verified, setVerified] = React.useState(false);
  const [checking, setChecking] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [items, setItems] = React.useState<Testimonial[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [form, setForm] = React.useState<Testimonial>({ name: "", role: "", institution: "", image: "", quote: "" });

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${API_BASE}/api/testimonials`);
      const data = await resp.json();
      setItems(Array.isArray(data?.testimonials) ? data.testimonials : []);
    } catch (e: any) {
      setError(e?.message || "Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setChecking(true);
    setError(null);
    try {
      const resp = await fetch(`${API_BASE}/api/admin/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
      const data = await resp.json();
      if (data?.ok) {
        setVerified(true);
        await fetchItems();
      } else {
        setVerified(false);
        setError('Invalid password');
      }
    } catch (e: any) {
      setError(e?.message || 'Verification failed');
    } finally {
      setChecking(false);
    }
  };

  const resetForm = () => {
    setForm({ name: "", role: "", institution: "", image: "", quote: "" });
  };

  const submit = async () => {
    setError(null);
    const method = 'POST';
    const url = `${API_BASE}/api/testimonials`;
    try {
      const resp = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
        body: JSON.stringify(form),
      });
      if (!resp.ok) {
        const txt = await resp.text();
        try { const j = JSON.parse(txt); throw new Error(j?.error || `Request failed (${resp.status})`); } catch { throw new Error(`Request failed (${resp.status})`); }
      }
      await fetchItems();
      resetForm();
    } catch (e: any) {
      setError(e?.message || 'Failed to save');
    }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    setError(null);
    try {
      const resp = await fetch(`${API_BASE}/api/testimonials/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': password },
      });
      if (!resp.ok) throw new Error(`Delete failed (${resp.status})`);
      await fetchItems();
    } catch (e: any) {
      setError(e?.message || 'Failed to delete');
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'gradientMeshPop' ? 'bg-black text-white' : 'bg-[#fdf6e3] text-black'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link to="/">
            <img src={theme === 'gradientMeshPop' ? "/logo1dark.png" : "/logo1light.png"} alt="logo" className="h-12" />
          </Link>
          <h1 className="text-2xl font-bold">Admin - Testimonials</h1>
        </div>

        {!verified ? (
          <div className="max-w-md mx-auto bg-white/80 text-black rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-2">Enter Admin Password</h2>
            <input
              type="password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
            />
            <Button className="mt-3 w-full" onClick={verify} disabled={checking || !password.trim()}> {checking ? 'Verifying...' : 'Verify'} </Button>
            {error && <div className="mt-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded px-3 py-2">{error}</div>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Form */}
            <div className="md:col-span-1 bg-white/80 text-black rounded-xl border p-4">
              <h3 className="font-semibold mb-3">Create Testimonial</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input className="w-full rounded-lg border border-gray-300 px-3 py-2" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <input className="w-full rounded-lg border border-gray-300 px-3 py-2" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Institution</label>
                  <input className="w-full rounded-lg border border-gray-300 px-3 py-2" value={form.institution} onChange={e => setForm(f => ({ ...f, institution: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Image URL</label>
                  <input className="w-full rounded-lg border border-gray-300 px-3 py-2" value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quote</label>
                  <textarea className="w-full rounded-lg border border-gray-300 px-3 py-2" rows={4} value={form.quote} onChange={e => setForm(f => ({ ...f, quote: e.target.value }))} />
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={submit}>Create</Button>
                </div>
                {error && <div className="mt-2 text-sm text-red-700 bg-red-100 border border-red-200 rounded px-3 py-2">{error}</div>}
              </div>
            </div>

            {/* List */}
            <div className="md:col-span-2 bg-white/80 text-black rounded-xl border p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Existing Testimonials</h3>
                <Button variant="outline" onClick={fetchItems} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</Button>
              </div>
              {items.length === 0 ? (
                <div className="text-sm text-gray-700">No testimonials yet.</div>
              ) : (
                <div className="space-y-3">
                  {items.map(t => (
                    <div key={t._id} className="rounded-lg border bg-white p-3 flex items-start gap-3">
                      <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover border" />
                      <div className="flex-1">
                        <div className="font-semibold">{t.name}</div>
                        <div className="text-xs text-gray-600">{t.role} • {t.institution}</div>
                        <div className="text-sm mt-1">{t.quote}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="destructive" onClick={() => del(t._id!)}>Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
