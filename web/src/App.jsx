import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth.jsx";
import { Layout } from "./components/Layout.jsx";
import { Login } from "./pages/Login.jsx";
import { Orders } from "./pages/Orders.jsx";
import { NewOrder } from "./pages/NewOrder.jsx";
import { OrderDetail } from "./pages/OrderDetail.jsx";
import { Cartons } from "./pages/Cartons.jsx";

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
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/new" element={<NewOrder />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/cartons" element={<Cartons />} />
        <Route path="*" element={<Navigate to="/orders" replace />} />
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
