import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

const emptyForm = { vehicleId: '', liters: '', cost: '', date: '' };

const FuelLogs = () => {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const fetchAll = async () => {
    const [l, v] = await Promise.all([api.get('/fuel-logs'), api.get('/vehicles')]);
    setLogs(l.data);
    setVehicles(v.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/fuel-logs', {
        ...form,
        liters: Number(form.liters),
        cost: Number(form.cost) || 0
      });
      setForm(emptyForm);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save fuel log');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this fuel log?')) return;
    try {
      await api.delete(`/fuel-logs/${id}`);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete fuel log');
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Fuel Logs</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-5 mb-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <select name="vehicleId" value={form.vehicleId} onChange={handleChange} className="border rounded-md px-3 py-2" required>
          <option value="">Select vehicle</option>
          {vehicles.map((v) => (
            <option key={v._id} value={v._id}>{v.registrationNumber}</option>
          ))}
        </select>
        <input name="liters" type="number" step="0.1" value={form.liters} onChange={handleChange} placeholder="Liters" className="border rounded-md px-3 py-2" required />
        <input name="cost" type="number" step="0.01" value={form.cost} onChange={handleChange} placeholder="Cost" className="border rounded-md px-3 py-2" />
        <input name="date" type="date" value={form.date} onChange={handleChange} className="border rounded-md px-3 py-2" required />
        <button type="submit" className="bg-blue-600 text-white rounded-md py-2 sm:col-span-4 hover:bg-blue-700">Add Fuel Log</button>
        {error && <p className="text-red-500 text-sm sm:col-span-4">{error}</p>}
      </form>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-3">Vehicle</th>
              <th className="p-3">Liters</th>
              <th className="p-3">Cost</th>
              <th className="p-3">Date</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l._id} className="border-t">
                <td className="p-3">{l.vehicleId?.registrationNumber}</td>
                <td className="p-3">{l.liters}</td>
                <td className="p-3">{l.cost}</td>
                <td className="p-3">{new Date(l.date).toLocaleDateString()}</td>
                <td className="p-3">
                  <button onClick={() => handleDelete(l._id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan="5" className="p-4 text-center text-slate-400">No fuel logs yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default FuelLogs;
