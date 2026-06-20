import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/routes', label: 'Routes' },
  { to: '/schedules', label: 'Schedules' },
  { to: '/drivers', label: 'Drivers' },
  { to: '/vehicles', label: 'Vehicles' },
  { to: '/fuel-logs', label: 'Fuel Logs' },
  { to: '/maintenance', label: 'Maintenance' },
  { to: '/reports', label: 'Reports' }
];

const Sidebar = () => {
  return (
    <aside className="w-60 bg-slate-900 text-white min-h-screen p-4 shrink-0">
      <h1 className="text-xl font-bold mb-6">🚌 Bus Management</h1>
      <nav className="flex flex-col gap-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm ${isActive ? 'bg-blue-600' : 'hover:bg-slate-800'}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
