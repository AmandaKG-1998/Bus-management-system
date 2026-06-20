import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

const emptyForm = { name: '', licenseNumber: '', contact: '', licenseExpiry: '', status: 'active' };

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const fetchDrivers = async () => {
    const { data } = await api.get('/drivers');
    setDrivers(data);
  };

  useEffect(() => { fetchDrivers(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.put(`/drivers/${editingId}`, form);
      } else {
        await api.post('/drivers', form);
      }
      setForm(emptyForm);
      setEditingId(null);
      fetchDrivers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save driver');
    }
  };

  const handleEdit = (d) => {
    setForm({
      name: d.name,
      licenseNumber: d.licenseNumber,
      contact: d.contact,
      licenseExpiry: d.licenseExpiry ? d.licenseExpiry.substring(0, 10) : '',
      status: d.status
    });
    setEditingId(d._id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this driver?')) return;
    try {
      await api.delete(`/drivers/${id}`);
      fetchDrivers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete driver');
    }
  };

  const isExpiringSoon = (dateStr) => {
    const days = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
    return days < 30;
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Driver Management</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-5 mb-6 grid grid-cols-1 sm:grid-cols-5 gap-3">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" className="border rounded-md px-3 py-2" required />
        <input name="licenseNumber" value={form.licenseNumber} onChange={handleChange} placeholder="License number" className="border rounded-md px-3 py-2" required />
        <input name="contact" value={form.contact} onChange={handleChange} placeholder="Contact number" className="border rounded-md px-3 py-2" required />
        <input name="licenseExpiry" type="date" value={form.licenseExpiry} onChange={handleChange} className="border rounded-md px-3 py-2" required />
        <select name="status" value={form.status} onChange={handleChange} className="border rounded-md px-3 py-2">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white rounded-md py-2 sm:col-span-5 hover:bg-blue-700">
          {editingId ? 'Update Driver' : 'Add Driver'}
        </button>
        {error && <p className="text-red-500 text-sm sm:col-span-5">{error}</p>}
      </form>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">License No.</th>
              <th className="p-3">Contact</th>
              <th className="p-3">License Expiry</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => (
              <tr key={d._id} className="border-t">
                <td className="p-3">{d.name}</td>
                <td className="p-3">{d.licenseNumber}</td>
                <td className="p-3">{d.contact}</td>
                <td className={`p-3 ${isExpiringSoon(d.licenseExpiry) ? 'text-red-600 font-semibold' : ''}`}>
                  {new Date(d.licenseExpiry).toLocaleDateString()}
                  {isExpiringSoon(d.licenseExpiry) && ' ⚠️'}
                </td>
                <td className="p-3 capitalize">{d.status}</td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => handleEdit(d)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(d._id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {drivers.length === 0 && (
              <tr><td colSpan="6" className="p-4 text-center text-slate-400">No drivers yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default Drivers;
