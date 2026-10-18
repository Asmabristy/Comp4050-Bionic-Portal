import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth.jsx";
import { isSupervisor } from "./roles.js";
import { Layout } from "./components/Layout.jsx";
import { Login } from "./pages/Login.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { Orders } from "./pages/Orders.jsx";
import { NewOrder } from "./pages/NewOrder.jsx";
import { OrderDetail } from "./pages/OrderDetail.jsx";
import { Cartons } from "./pages/Cartons.jsx";
import { Administration } from "./pages/Administration.jsx";

function Gate() {
  const { user, checking } = useAuth();

  if (checking) {
    return (
      <div className="gate">
        <p className="mono muted">Checking your session…</p>
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/new" element={<NewOrder />} />
        <Route path="/orders/:id" element={<OrderDetail />} />

        <Route path="/cartons" element={<Cartons />} />
        <Route
          path="/administration" element={
            isSupervisor(user) ? (
              <Administration />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </BrowserRouter>
  );
}