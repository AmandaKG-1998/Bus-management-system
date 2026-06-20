import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

const emptyForm = { routeId: '', vehicleId: '', driverId: '', departureTime: '', arrivalTime: '' };

const Schedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const fetchAll = async () => {
    const [s, r, v, d] = await Promise.all([
      api.get('/schedules'),
      api.get('/routes'),
      api.get('/vehicles'),
      api.get('/drivers')
    ]);
    setSchedules(s.data);
    setRoutes(r.data);
    setVehicles(v.data);
    setDrivers(d.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.put(`/schedules/${editingId}`, form);
      } else {
        await api.post('/schedules', form);
      }
      setForm(emptyForm);
      setEditingId(null);
      fetchAll();
    } catch (err) {
      // This is where the time-conflict message from the backend shows up
      setError(err.response?.data?.message || 'Failed to save schedule');
    }
  };

  const handleEdit = (s) => {
    setForm({
      routeId: s.routeId?._id,
      vehicleId: s.vehicleId?._id,
      driverId: s.driverId?._id,
      departureTime: s.departureTime ? s.departureTime.substring(0, 16) : '',
      arrivalTime: s.arrivalTime ? s.arrivalTime.substring(0, 16) : ''
    });
    setEditingId(s._id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this schedule?')) return;
    try {
      await api.delete(`/schedules/${id}`);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete schedule');
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Schedule Management</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-5 mb-6 grid grid-cols-1 sm:grid-cols-5 gap-3">
        <select name="routeId" value={form.routeId} onChange={handleChange} className="border rounded-md px-3 py-2" required>
          <option value="">Select route</option>
          {routes.map((r) => (
            <option key={r._id} value={r._id}>{r.startPoint} → {r.endPoint}</option>
          ))}
        </select>
        <select name="vehicleId" value={form.vehicleId} onChange={handleChange} className="border rounded-md px-3 py-2" required>
          <option value="">Select vehicle</option>
          {vehicles.map((v) => (
            <option key={v._id} value={v._id}>{v.registrationNumber}</option>
          ))}
        </select>
        <select name="driverId" value={form.driverId} onChange={handleChange} className="border rounded-md px-3 py-2" required>
          <option value="">Select driver</option>
          {drivers.map((d) => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </select>
        <input name="departureTime" type="datetime-local" value={form.departureTime} onChange={handleChange} className="border rounded-md px-3 py-2" required />
        <input name="arrivalTime" type="datetime-local" value={form.arrivalTime} onChange={handleChange} className="border rounded-md px-3 py-2" required />
        <button type="submit" className="bg-blue-600 text-white rounded-md py-2 sm:col-span-5 hover:bg-blue-700">
          {editingId ? 'Update Schedule' : 'Add Schedule'}
        </button>
        {error && <p className="text-red-500 text-sm sm:col-span-5 bg-red-50 p-2 rounded">{error}</p>}
      </form>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-3">Route</th>
              <th className="p-3">Vehicle</th>
              <th className="p-3">Driver</th>
              <th className="p-3">Departure</th>
              <th className="p-3">Arrival</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s) => (
              <tr key={s._id} className="border-t">
                <td className="p-3">{s.routeId?.startPoint} → {s.routeId?.endPoint}</td>
                <td className="p-3">{s.vehicleId?.registrationNumber}</td>
                <td className="p-3">{s.driverId?.name}</td>
                <td className="p-3">{new Date(s.departureTime).toLocaleString()}</td>
                <td className="p-3">{new Date(s.arrivalTime).toLocaleString()}</td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => handleEdit(s)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(s._id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {schedules.length === 0 && (
              <tr><td colSpan="6" className="p-4 text-center text-slate-400">No schedules yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default Schedules;
