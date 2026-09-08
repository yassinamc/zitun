import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { OliveLogo } from '../components/illustrations/AgriculturalIcons';

const links = [
  { to: '/', label: 'لوحة التحكم' },
  { to: '/receptions/new', label: 'قبان / استقبال' },
  { to: '/customers', label: 'الزبناء' },
];

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="md:w-64 bg-olive-850/90 border-l border-olive-700/40 p-5 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <OliveLogo className="w-12 h-12" />
          <div>
            <div className="text-xl font-extrabold text-gold-400">OliveFlow</div>
            <div className="text-xs text-olive-500">تسيير المعصرة بسهولة</div>
          </div>
        </div>

        <nav className="flex md:flex-col gap-2 overflow-x-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `px-4 py-3 rounded-xl whitespace-nowrap font-semibold transition ${
                  isActive
                    ? 'bg-olive-700 text-white'
                    : 'text-olive-500 hover:bg-olive-800 hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-olive-700/40 text-sm">
          <div className="font-bold">{user?.fullName}</div>
          <div className="text-olive-500">{user?.tenant?.name || 'Plateforme'}</div>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 text-clay-700 hover:text-gold-400 font-semibold"
          >
            خروج
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
