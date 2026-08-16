import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";

export function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .listOrders()
      .then(({ orders }) => setOrders(orders))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Operations</div>
          <h1>Orders</h1>
        </div>
        <button onClick={() => navigate("/orders/new")}>New order</button>
      </div>

      {error && <div className="notice notice--error">{error}</div>}

      <div className="sheet">
        {loading ? (
          <p className="muted mono">Loading…</p>
        ) : orders.length === 0 ? (
          <div className="empty">
            <p>No orders yet. Define one to send it to the solver.</p>
            <button onClick={() => navigate("/orders/new")}>Create the first order</button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Items</th>
                <th>Cartons used</th>
                <th>Status</th>
                <th>Created</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="mono">{order.reference}</td>
                  <td className="mono">{order.items.length}</td>
                  <td className="mono">{order.result?.boxes?.length ?? "—"}</td>
                  <td>
                    <span className={`tag tag--${order.status}`}>{order.status}</span>
                  </td>
                  <td className="mono muted">
                    {new Date(order.createdAt).toLocaleDateString("en-AU")}
                  </td>
                  <td className="text-right">
                    <Link to={`/orders/${order.id}`}>
                      <button className="btn-small btn-ghost">Open</button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
