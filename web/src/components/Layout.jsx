import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { isSupervisor } from "../roles.js";
import { Icon } from "./Icon.jsx";

const LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: "dashboard", end: false },
  { to: "/orders", label: "Orders", icon: "orders", end: true },
  { to: "/orders/new", label: "New Order", icon: "plus", end: false },
  { to: "/cartons", label: "Cartons", icon: "carton", end: false },
];

export function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate("/login");
  };

  const canSeeAdmin = isSupervisor(user);

  const links = canSeeAdmin
    ? [...LINKS, { to: "/administration", label: "Administration", icon: "settings" }]
    : LINKS;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar__brand">
          <div className="brand-mark">
            <Icon name="cube" size={19} strokeWidth={1.9} />
          </div>

          <div className="brand-text">
            <span className="brand-text__bionic">BIONIC</span>
            <span className="brand-text__portal">PORTAL</span>
          </div>
        </div>

        <nav className="topbar__nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                isActive ? "nav-link nav-link--active" : "nav-link"
              }
            >
              <Icon name={link.icon} size={16} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="topbar__account">
          <div className="account-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div className="account-details">
            <span className="account-name">{user?.name || "User"}</span>
            <span className="account-role">{user?.role || "User"}</span>
          </div>

          <button
            type="button"
            className="signout-button"
            onClick={handleSignOut}
          >
            <Icon name="signOut" size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
