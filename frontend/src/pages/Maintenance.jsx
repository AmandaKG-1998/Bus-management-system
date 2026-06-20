import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

const emptyForm = { vehicleId: '', serviceType: '', cost: '', notes: '', date: '' };

const Maintenance = () => {
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const fetchAll = async () => {
    const [m, v] = await Promise.all([api.get('/maintenance'), api.get('/vehicles')]);
    setRecords(m.data);
    setVehicles(v.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/maintenance', { ...form, cost: Number(form.cost) || 0 });
      setForm(emptyForm);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save maintenance record');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return;
    try {
      await api.delete(`/maintenance/${id}`);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete record');
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Maintenance Records</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-5 mb-6 grid grid-cols-1 sm:grid-cols-5 gap-3">
        <select name="vehicleId" value={form.vehicleId} onChange={handleChange} className="border rounded-md px-3 py-2" required>
          <option value="">Select vehicle</option>
          {vehicles.map((v) => (
            <option key={v._id} value={v._id}>{v.registrationNumber}</option>
          ))}
        </select>
        <input name="serviceType" value={form.serviceType} onChange={handleChange} placeholder="Service type (e.g. Oil change)" className="border rounded-md px-3 py-2" required />
        <input name="cost" type="number" step="0.01" value={form.cost} onChange={handleChange} placeholder="Cost" className="border rounded-md px-3 py-2" />
        <input name="date" type="date" value={form.date} onChange={handleChange} className="border rounded-md px-3 py-2" required />
        <input name="notes" value={form.notes} onChange={handleChange} placeholder="Notes" className="border rounded-md px-3 py-2" />
        <button type="submit" className="bg-blue-600 text-white rounded-md py-2 sm:col-span-5 hover:bg-blue-700">Add Record</button>
        {error && <p className="text-red-500 text-sm sm:col-span-5">{error}</p>}
      </form>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-3">Vehicle</th>
              <th className="p-3">Service Type</th>
              <th className="p-3">Cost</th>
              <th className="p-3">Date</th>
              <th className="p-3">Notes</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="p-3">{r.vehicleId?.registrationNumber}</td>
                <td className="p-3">{r.serviceType}</td>
                <td className="p-3">{r.cost}</td>
                <td className="p-3">{new Date(r.date).toLocaleDateString()}</td>
                <td className="p-3">{r.notes || '-'}</td>
                <td className="p-3">
                  <button onClick={() => handleDelete(r._id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr><td colSpan="6" className="p-4 text-center text-slate-400">No maintenance records yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default Maintenance;
