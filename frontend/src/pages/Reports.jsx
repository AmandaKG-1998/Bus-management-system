import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Layout from '../components/Layout';
import api from '../api/axios';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

const Reports = () => {
  const [fuelLogs, setFuelLogs] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      const [f, m, v] = await Promise.all([
        api.get('/fuel-logs'),
        api.get('/maintenance'),
        api.get('/vehicles')
      ]);
      setFuelLogs(f.data);
      setMaintenance(m.data);
      setVehicles(v.data);
    };
    fetchAll();
  }, []);

  // Build a monthly summary: total fuel cost + maintenance cost per month
  const monthlySummary = (() => {
    const map = {};
    fuelLogs.forEach((f) => {
      const month = f.date?.substring(0, 7);
      if (!map[month]) map[month] = { month, fuelCost: 0, maintenanceCost: 0 };
      map[month].fuelCost += f.cost || 0;
    });
    maintenance.forEach((m) => {
      const month = m.date?.substring(0, 7);
      if (!map[month]) map[month] = { month, fuelCost: 0, maintenanceCost: 0 };
      map[month].maintenanceCost += m.cost || 0;
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  })();

  // Cost split by maintenance service type (for the pie chart)
  const serviceTypeBreakdown = (() => {
    const map = {};
    maintenance.forEach((m) => {
      map[m.serviceType] = (map[m.serviceType] || 0) + (m.cost || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  })();

  const totalFuelCost = fuelLogs.reduce((sum, f) => sum + (f.cost || 0), 0);
  const totalMaintenanceCost = maintenance.reduce((sum, m) => sum + (m.cost || 0), 0);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Bus Management System - Monthly Report', 14, 16);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

    doc.setFontSize(12);
    doc.text(`Total Fuel Cost: ${totalFuelCost.toFixed(2)}`, 14, 32);
    doc.text(`Total Maintenance Cost: ${totalMaintenanceCost.toFixed(2)}`, 14, 39);
    doc.text(`Total Vehicles: ${vehicles.length}`, 14, 46);

    autoTable(doc, {
      startY: 54,
      head: [['Month', 'Fuel Cost', 'Maintenance Cost']],
      body: monthlySummary.map((m) => [m.month, m.fuelCost.toFixed(2), m.maintenanceCost.toFixed(2)])
    });

    doc.save('bus-management-report.pdf');
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Reports & Analytics</h2>
        <button onClick={exportPDF} className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700">
          Export PDF
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500">
          <p className="text-sm text-slate-500">Total Fuel Cost</p>
          <p className="text-3xl font-bold text-slate-800">{totalFuelCost.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-orange-500">
          <p className="text-sm text-slate-500">Total Maintenance Cost</p>
          <p className="text-3xl font-bold text-slate-800">{totalMaintenanceCost.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="font-semibold text-slate-700 mb-4">Monthly Cost Summary</h3>
          {monthlySummary.length === 0 ? (
            <p className="text-slate-400 text-sm">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlySummary}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="fuelCost" stroke="#3b82f6" name="Fuel Cost" />
                <Line type="monotone" dataKey="maintenanceCost" stroke="#f59e0b" name="Maintenance Cost" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="font-semibold text-slate-700 mb-4">Maintenance Cost by Service Type</h3>
          {serviceTypeBreakdown.length === 0 ? (
            <p className="text-slate-400 text-sm">No maintenance data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={serviceTypeBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {serviceTypeBreakdown.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
