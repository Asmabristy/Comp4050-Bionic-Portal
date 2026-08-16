import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth.jsx";

export function Layout() {
  const { user, signOut } = useAuth();

  const linkClass = ({ isActive }) => `rail__link${isActive ? " is-active" : ""}`;

  return (
    <div className="shell">
      <nav className="rail">
        <div>
          <div className="rail__mark">
            Fit<span>Portal</span>
          </div>
          <div className="rail__sub">Perfect Fit / Bionic</div>
        </div>

        <div className="rail__nav">
          <NavLink to="/orders" className={linkClass}>
            Orders
          </NavLink>
          <NavLink to="/orders/new" className={linkClass}>
            New order
          </NavLink>
          <NavLink to="/cartons" className={linkClass}>
            Cartons
          </NavLink>
        </div>

        <div className="rail__foot">
          <strong>{user?.name}</strong>
          {user?.email}
          <div style={{ marginTop: 12 }}>
            <button className="btn-small btn-ghost" style={{ color: "#e6e9ec" }} onClick={signOut}>
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
