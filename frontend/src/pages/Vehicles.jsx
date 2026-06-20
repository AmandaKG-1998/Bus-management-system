import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

const emptyForm = { registrationNumber: '', type: 'Bus', capacity: '', status: 'available' };

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const fetchVehicles = async () => {
    const { data } = await api.get('/vehicles');
    setVehicles(data);
  };

  useEffect(() => { fetchVehicles(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form, capacity: Number(form.capacity) };
      if (editingId) {
        await api.put(`/vehicles/${editingId}`, payload);
      } else {
        await api.post('/vehicles', payload);
      }
      setForm(emptyForm);
      setEditingId(null);
      fetchVehicles();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save vehicle');
    }
  };

  const handleEdit = (v) => {
    setForm({ registrationNumber: v.registrationNumber, type: v.type, capacity: v.capacity, status: v.status });
    setEditingId(v._id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this vehicle?')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      fetchVehicles();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete vehicle');
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Vehicle Management</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-5 mb-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <input name="registrationNumber" value={form.registrationNumber} onChange={handleChange} placeholder="Registration number" className="border rounded-md px-3 py-2" required />
        <input name="type" value={form.type} onChange={handleChange} placeholder="Type (e.g. Bus)" className="border rounded-md px-3 py-2" />
        <input name="capacity" type="number" value={form.capacity} onChange={handleChange} placeholder="Capacity" className="border rounded-md px-3 py-2" required />
        <select name="status" value={form.status} onChange={handleChange} className="border rounded-md px-3 py-2">
          <option value="available">Available</option>
          <option value="on-route">On Route</option>
          <option value="maintenance">Maintenance</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white rounded-md py-2 sm:col-span-4 hover:bg-blue-700">
          {editingId ? 'Update Vehicle' : 'Add Vehicle'}
        </button>
        {error && <p className="text-red-500 text-sm sm:col-span-4">{error}</p>}
      </form>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-3">Reg. Number</th>
              <th className="p-3">Type</th>
              <th className="p-3">Capacity</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v._id} className="border-t">
                <td className="p-3">{v.registrationNumber}</td>
                <td className="p-3">{v.type}</td>
                <td className="p-3">{v.capacity}</td>
                <td className="p-3 capitalize">{v.status}</td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => handleEdit(v)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(v._id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {vehicles.length === 0 && (
              <tr><td colSpan="5" className="p-4 text-center text-slate-400">No vehicles yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default Vehicles;
