import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { isSupervisor } from "../roles.js";
import { Icon } from "./Icon.jsx";
import { plateDate } from "./Plate.jsx";

const LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: "dashboard", end: false },
  { to: "/orders", label: "Orders", icon: "orders", end: true },
  { to: "/orders/new", label: "New order", icon: "plus", end: false },
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

  return (
    <div className="app-shell">
      {/* The rail: a full-height field plate carrying every destination. */}
      <aside className="sidebar">
        <div className="sidebar__brand">
          <div className="brand-text">
            <span className="brand-text__bionic">Bionic</span>
            <span className="brand-text__portal">Portal</span>
          </div>
        </div>

        <nav className="sidebar__nav">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                isActive ? "navcell navcell--active" : "navcell"
              }
            >
              <Icon name={link.icon} size={16} />
              {link.label}
            </NavLink>
          ))}

          {canSeeAdmin && (
            <NavLink
              to="/administration"
              className={({ isActive }) =>
                isActive
                  ? "navcell navcell--apart navcell--active"
                  : "navcell navcell--apart"
              }
            >
              <Icon name="user" size={16} />
              Administration
            </NavLink>
          )}
        </nav>
      </aside>

      <div className="app-main">
        {/* The sheet states its date once, here, rather than in every block. */}
        <div className="topstrip">
          <span className="topstrip__date">{plateDate()}</span>

          <div className="topstrip__account">
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
              Sign out
            </button>
          </div>
        </div>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
