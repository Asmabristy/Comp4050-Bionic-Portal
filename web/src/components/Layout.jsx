import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";

export function Layout() {
 const { user, signOut } = useAuth();
  const navigate = useNavigate();

const handleSignOut = () => {
  signOut();
  navigate("/login");
};

 const canSeeAdmin = user?.role === "supervisor";

  return (
    <div className="app-shell">
      <header className="topbar">

        {/* BIONIC PORTAL */}
        <div className="topbar__brand">
          <div className="brand-text">
            <span className="brand-text__bionic">BIONIC</span>
            <span className="brand-text__portal">PORTAL</span>
          </div>
        </div>

        {/* MAIN NAVIGATION */}
        <nav className="topbar__nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "nav-link nav-link--active" : "nav-link"
            }
          >
            Dashboard
          </NavLink>

        <NavLink
         to="/orders"
        end
        className={({ isActive }) =>
        isActive ? "nav-link nav-link--active" : "nav-link"
  }
>
            Orders
          </NavLink>

          <NavLink
            to="/orders/new"
            className={({ isActive }) =>
              isActive ? "nav-link nav-link--active" : "nav-link"
            }
          >
            New Order
          </NavLink>

          <NavLink
            to="/cartons"
            className={({ isActive }) =>
              isActive ? "nav-link nav-link--active" : "nav-link"
            }
          >
            Cartons
          </NavLink>

          {canSeeAdmin && (
            <NavLink
              to="/administration"
              className={({ isActive }) =>
                isActive ? "nav-link nav-link--active" : "nav-link"
              }
            >
              Administration
            </NavLink>
          )}
        </nav>

        {/* USER AREA — ALWAYS LAST */}
        <div className="topbar__account">
          <div className="account-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div className="account-details">
            <span className="account-name">
              {user?.name || "User"}
            </span>

            <span className="account-role">
              {user?.role || "User"}
            </span>
          </div>

         <button
  type="button"
  className="signout-button"
  onClick={handleSignOut}
>
  Sign out
</button>
        </div>

      </header>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}