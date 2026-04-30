import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const navItems = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Saved Websites', to: '/websites' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-row">
          <span className="brand-mark" aria-hidden="true">AI</span>
          <div className="brand-block">
            <h1 className="brand">AI Website Builder</h1>
            <p className="brand-copy">Draft, edit, and save polished website copy.</p>
          </div>
        </div>

        <div className="topbar-actions">
          <nav className="nav-tabs" aria-label="Primary navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `nav-tab${isActive ? ' nav-tab-active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="user-chip">
            <span>{user?.name}</span>
            <span>{user?.email}</span>
          </div>

          <button type="button" className="button signout-button" onClick={logout}>
            Sign Out
          </button>
        </div>
      </header>

      <main className="content-area">
        <Outlet />
      </main>
    </div>
  );
}
