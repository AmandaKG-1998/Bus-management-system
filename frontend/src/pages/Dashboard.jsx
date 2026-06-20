import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import api from '../api/axios';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard/stats');
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <Layout>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h2>

      {loading && <p className="text-slate-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatCard title="Total Routes" value={stats.totalRoutes} color="border-blue-500" />
            <StatCard title="Total Vehicles" value={stats.totalVehicles} color="border-green-500" />
            <StatCard title="Active Vehicles" value={stats.activeVehicles} color="border-emerald-500" />
            <StatCard title="Total Drivers" value={stats.totalDrivers} color="border-purple-500" />
            <StatCard title="Total Schedules" value={stats.totalSchedules} color="border-orange-500" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-5">
              <h3 className="font-semibold text-slate-700 mb-4">Fuel Usage by Month</h3>
              {stats.fuelByMonth.length === 0 ? (
                <p className="text-slate-400 text-sm">No fuel data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats.fuelByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalLiters" fill="#3b82f6" name="Liters" />
                    <Bar dataKey="totalCost" fill="#f59e0b" name="Cost" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-5">
              <h3 className="font-semibold text-slate-700 mb-4">Upcoming Schedules</h3>
              {stats.upcomingSchedules.length === 0 ? (
                <p className="text-slate-400 text-sm">No upcoming schedules.</p>
              ) : (
                <ul className="divide-y">
                  {stats.upcomingSchedules.map((s) => (
                    <li key={s._id} className="py-2 text-sm">
                      <p className="font-medium text-slate-700">
                        {s.routeId?.startPoint} → {s.routeId?.endPoint}
                      </p>
                      <p className="text-slate-500">
                        {s.vehicleId?.registrationNumber} • {s.driverId?.name} •{' '}
                        {new Date(s.departureTime).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default Dashboard;
