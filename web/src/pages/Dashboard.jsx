import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";

export function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    api
      .listOrders()
      .then(({ orders }) => setOrders(orders))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    return {
      total: orders.length,

      packed: orders.filter(
        (order) => order.status === "packed"
      ).length,

      draft: orders.filter(
        (order) => order.status === "draft"
      ).length,

      packing: orders.filter(
        (order) => order.status === "packing"
      ).length,

      failed: orders.filter(
        (order) => order.status === "failed"
      ).length,
    };
  }, [orders]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [orders]);

  const packedPercentage =
    stats.total > 0
      ? Math.round((stats.packed / stats.total) * 100)
      : 0;

  return (
    <div className="dashboard-page">

      {/* =========================
          PAGE HEADER
         ========================= */}
      <section className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">Overview</p>

          <h1>Dashboard</h1>

          <p className="dashboard-description">
            Monitor orders and packing activity across Bionic Portal.
          </p>
        </div>

        <button
          className="dashboard-primary-button"
          onClick={() => navigate("/orders/new")}
        >
          <span>+</span>
          New Order
        </button>
      </section>

      {error && (
        <div className="notice notice--error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="dashboard-loading">
          Loading dashboard…
        </div>
      ) : (
        <>
          {/* =========================
              STATISTICS
             ========================= */}
          <section className="dashboard-stat-grid">

            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon">
                01
              </div>

              <div>
                <span className="dashboard-stat-label">
                  Total Orders
                </span>

                <strong className="dashboard-stat-number">
                  {stats.total}
                </strong>

                <span className="dashboard-stat-caption">
                  All orders
                </span>
              </div>
            </article>

            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon dashboard-stat-icon--green">
                02
              </div>

              <div>
                <span className="dashboard-stat-label">
                  Packed
                </span>

                <strong className="dashboard-stat-number">
                  {stats.packed}
                </strong>

                <span className="dashboard-stat-caption dashboard-stat-caption--green">
                  {packedPercentage}% of orders
                </span>
              </div>
            </article>

            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon">
                03
              </div>

              <div>
                <span className="dashboard-stat-label">
                  Draft
                </span>

                <strong className="dashboard-stat-number">
                  {stats.draft}
                </strong>

                <span className="dashboard-stat-caption">
                  Waiting to be packed
                </span>
              </div>
            </article>

            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon dashboard-stat-icon--red">
                04
              </div>

              <div>
                <span className="dashboard-stat-label">
                  Failed
                </span>

                <strong className="dashboard-stat-number">
                  {stats.failed}
                </strong>

                <span
                  className={`dashboard-stat-caption ${
                    stats.failed > 0
                      ? "dashboard-stat-caption--red"
                      : ""
                  }`}
                >
                  {stats.failed > 0
                    ? "Needs attention"
                    : "No failed orders"}
                </span>
              </div>
            </article>

          </section>

          {/* =========================
              MAIN DASHBOARD CONTENT
             ========================= */}
          <section className="dashboard-main-grid">

            {/* Recent Orders */}
            <article className="dashboard-card dashboard-card--wide">

              <div className="dashboard-card-header">
                <div>
                  <h2>Recent Orders</h2>

                  <p>
                    Latest activity in Bionic Portal
                  </p>
                </div>

                <Link
                  to="/orders"
                  className="dashboard-text-link"
                >
                  View all →
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="dashboard-empty">
                  No orders have been created yet.
                </div>
              ) : (
                <div className="dashboard-orders-table">

                  <div className="dashboard-orders-head">
                    <span>Reference</span>
                    <span>Items</span>
                    <span>Status</span>
                    <span>Created</span>
                    <span />
                  </div>

                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      to={`/orders/${order.id}`}
                      className="dashboard-orders-row"
                    >
                      <span className="mono">
                        {order.reference}
                      </span>

                      <span>
                        {order.items.length}
                      </span>

                      <span>
                        <span
                          className={`tag tag--${order.status}`}
                        >
                          {order.status}
                        </span>
                      </span>

                      <span className="dashboard-order-date">
                        {new Date(
                          order.createdAt
                        ).toLocaleDateString("en-AU")}
                      </span>

                      <span className="dashboard-row-arrow">
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </article>

            {/* Packing Summary */}
            <article className="dashboard-card">

              <div className="dashboard-card-header">
                <div>
                  <h2>Packing Summary</h2>

                  <p>
                    Current order status
                  </p>
                </div>
              </div>

              <div className="dashboard-progress-heading">
                <div>
                  <strong>
                    {packedPercentage}%
                  </strong>

                  <span>
                    Packed
                  </span>
                </div>
              </div>

              <div className="dashboard-progress-track">
                <div
                  className="dashboard-progress-fill"
                  style={{
                    width: `${packedPercentage}%`,
                  }}
                />
              </div>

              <div className="dashboard-status-list">

                <div className="dashboard-status-item">
                  <span>
                    <i className="status-dot status-dot--packed" />
                    Packed
                  </span>

                  <strong>{stats.packed}</strong>
                </div>

                <div className="dashboard-status-item">
                  <span>
                    <i className="status-dot status-dot--draft" />
                    Draft
                  </span>

                  <strong>{stats.draft}</strong>
                </div>

                <div className="dashboard-status-item">
                  <span>
                    <i className="status-dot status-dot--packing" />
                    Packing
                  </span>

                  <strong>{stats.packing}</strong>
                </div>

                <div className="dashboard-status-item">
                  <span>
                    <i className="status-dot status-dot--failed" />
                    Failed
                  </span>

                  <strong>{stats.failed}</strong>
                </div>

              </div>
            </article>

          </section>

          {/* =========================
              QUICK ACTIONS
             ========================= */}
          <section className="dashboard-card dashboard-quick-section">

            <div className="dashboard-card-header">
              <div>
                <h2>Quick Actions</h2>

                <p>
                  Common Bionic Portal tasks
                </p>
              </div>
            </div>

            <div className="dashboard-quick-grid">

              <button
                className="dashboard-quick-card"
                onClick={() =>
                  navigate("/orders/new")
                }
              >
                <span className="dashboard-quick-icon">
                  +
                </span>

                <div>
                  <strong>
                    Create New Order
                  </strong>

                  <span>
                    Enter order and item information
                  </span>
                </div>
              </button>

              <button
                className="dashboard-quick-card"
                onClick={() =>
                  navigate("/orders")
                }
              >
                <span className="dashboard-quick-icon">
                  →
                </span>

                <div>
                  <strong>
                    View Orders
                  </strong>

                  <span>
                    Review packing activity and results
                  </span>
                </div>
              </button>

              <button
                className="dashboard-quick-card"
                onClick={() =>
                  navigate("/cartons")
                }
              >
                <span className="dashboard-quick-icon">
                   ⬡
                </span>

                <div>
                  <strong>
                    View Cartons
                  </strong>

                  <span>
                    Review available carton types
                  </span>
                </div>
              </button>

            </div>
          </section>
        </>
      )}
    </div>
  );
}