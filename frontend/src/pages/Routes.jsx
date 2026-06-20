import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

const emptyForm = { startPoint: '', endPoint: '', stops: '', distance: '' };

const RoutesPage = () => {
  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const fetchRoutes = async () => {
    const { data } = await api.get('/routes');
    setRoutes(data);
  };

  useEffect(() => { fetchRoutes(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        startPoint: form.startPoint,
        endPoint: form.endPoint,
        distance: Number(form.distance),
        stops: form.stops ? form.stops.split(',').map((s) => s.trim()) : []
      };
      if (editingId) {
        await api.put(`/routes/${editingId}`, payload);
      } else {
        await api.post('/routes', payload);
      }
      setForm(emptyForm);
      setEditingId(null);
      fetchRoutes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save route');
    }
  };

  const handleEdit = (route) => {
    setForm({
      startPoint: route.startPoint,
      endPoint: route.endPoint,
      stops: (route.stops || []).join(', '),
      distance: route.distance
    });
    setEditingId(route._id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this route?')) return;
    try {
      await api.delete(`/routes/${id}`);
      fetchRoutes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete route');
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Route Management</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-5 mb-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <input name="startPoint" value={form.startPoint} onChange={handleChange} placeholder="Start point" className="border rounded-md px-3 py-2" required />
        <input name="endPoint" value={form.endPoint} onChange={handleChange} placeholder="End point" className="border rounded-md px-3 py-2" required />
        <input name="stops" value={form.stops} onChange={handleChange} placeholder="Stops (comma separated)" className="border rounded-md px-3 py-2" />
        <input name="distance" type="number" step="0.1" value={form.distance} onChange={handleChange} placeholder="Distance (km)" className="border rounded-md px-3 py-2" required />
        <button type="submit" className="bg-blue-600 text-white rounded-md py-2 sm:col-span-4 hover:bg-blue-700">
          {editingId ? 'Update Route' : 'Add Route'}
        </button>
        {error && <p className="text-red-500 text-sm sm:col-span-4">{error}</p>}
      </form>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-3">Start</th>
              <th className="p-3">End</th>
              <th className="p-3">Stops</th>
              <th className="p-3">Distance (km)</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="p-3">{r.startPoint}</td>
                <td className="p-3">{r.endPoint}</td>
                <td className="p-3">{(r.stops || []).join(', ') || '-'}</td>
                <td className="p-3">{r.distance}</td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => handleEdit(r)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(r._id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {routes.length === 0 && (
              <tr><td colSpan="5" className="p-4 text-center text-slate-400">No routes yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default RoutesPage;
