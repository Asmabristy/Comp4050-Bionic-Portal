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

  const stats = useMemo(
    () => ({
      total: orders.length,
      packed: orders.filter((o) => o.status === "packed").length,
      draft: orders.filter((o) => o.status === "draft").length,
      packing: orders.filter((o) => o.status === "packing").length,
      failed: orders.filter((o) => o.status === "failed").length,
    }),
    [orders]
  );

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        )
        .slice(0, 5),
    [orders]
  );

  const packedPercentage =
    stats.total > 0
      ? Math.round((stats.packed / stats.total) * 100)
      : 0;

  const statCards = [
    {
      n: "01",
      label: "Total Orders",
      value: stats.total,
      caption: "All orders",
      tone: "blue",
    },
    {
      n: "02",
      label: "Packed",
      value: stats.packed,
      caption: `${packedPercentage}% of orders`,
      tone: "green",
    },
    {
      n: "03",
      label: "Draft",
      value: stats.draft,
      caption: "Waiting to be packed",
      tone: "purple",
    },
    {
      n: "04",
      label: "Failed",
      value: stats.failed,
      caption:
        stats.failed > 0
          ? "Needs attention"
          : "No failed orders",
      tone: "red",
    },
  ];

  return (
    <>
      <div className="dashboard-head">
  <div>
    <p className="dashboard-eyebrow">WELCOME BACK</p>
    <h1>Dashboard</h1>
  </div>


        <button
          type="button"
          className="btn-primary dashboard-new-order"
          onClick={() => navigate("/orders/new")}
        >
          <span>+</span>
          New Order
        </button>
      </div>

      {error && (
        <div className="notice notice--error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="card dashboard-loading">
          Loading dashboard…
        </div>
      ) : (
        <>
          <section className="dashboard-stats">
            {statCards.map((card) => (
              <article
                key={card.n}
                className={`dashboard-stat dashboard-stat--${card.tone}`}
              >
                <div
                  className={`dashboard-stat__number dashboard-stat__number--${card.tone}`}
                >
                  {card.n}
                </div>

                <div className="dashboard-stat__content">
                  <span className="dashboard-stat__label">
                    {card.label}
                  </span>

                  <strong className="dashboard-stat__value">
                    {card.value}
                  </strong>

                  <span
                    className={`dashboard-stat__caption ${
                      card.tone === "green"
                        ? "dashboard-stat__caption--green"
                        : card.tone === "red" &&
                          stats.failed > 0
                        ? "dashboard-stat__caption--red"
                        : ""
                    }`}
                  >
                    {card.caption}
                  </span>
                </div>
              </article>
            ))}
          </section>

          <section className="dashboard-main-grid">
            <article className="dashboard-panel dashboard-recent">
              <div className="dashboard-panel__head">
                <div>
                  <h2>Recent Orders</h2>
                  <p>Latest activity in Bionic Portal</p>
                </div>

                <Link
                  to="/orders"
                  className="dashboard-link"
                >
                  View all →
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="dashboard-empty">
                  No orders yet.
                </div>
              ) : (
                <div className="dashboard-table-wrap">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Reference</th>
                        <th>Items</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th />
                      </tr>
                    </thead>

                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="mono">
                            {order.reference}
                          </td>

                          <td>
                            {order.items?.length ?? 0}
                          </td>

                          <td>
                            <span
                              className={`tag tag--${order.status}`}
                            >
                              {order.status}
                            </span>
                          </td>

                          <td className="muted">
                            {order.createdAt
                              ? new Date(
                                  order.createdAt
                                ).toLocaleDateString()
                              : "—"}
                          </td>

                          <td className="text-right">
                            <Link
                              to={`/orders/${order.id}`}
                              className="dashboard-row-arrow"
                              aria-label={`Open ${order.reference}`}
                            >
                              →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>

            <article className="dashboard-panel dashboard-summary">
              <div className="dashboard-panel__head">
                <div>
                  <h2>Packing Summary</h2>
                  <p>Current order status</p>
                </div>
              </div>

              <div className="dashboard-summary__percentage">
                <strong>{packedPercentage}%</strong>
                <span>Packed</span>
              </div>

              <div className="dashboard-progress">
                <div
                  className="dashboard-progress__bar"
                  style={{
                    width: `${packedPercentage}%`,
                  }}
                />
              </div>

              <div className="dashboard-summary__rows">
                <div>
                  <span>
                    <i className="dot dot--packed" />
                    Packed
                  </span>
                  <strong>{stats.packed}</strong>
                </div>

                <div>
                  <span>
                    <i className="dot dot--draft" />
                    Draft
                  </span>
                  <strong>{stats.draft}</strong>
                </div>

                <div>
                  <span>
                    <i className="dot dot--packing" />
                    Packing
                  </span>
                  <strong>{stats.packing}</strong>
                </div>

                <div>
                  <span>
                    <i className="dot dot--failed" />
                    Failed
                  </span>
                  <strong>{stats.failed}</strong>
                </div>
              </div>
            </article>
          </section>

          <section className="dashboard-panel dashboard-quick">
            <div className="dashboard-panel__head">
              <div>
                <h2>Quick Actions</h2>
                <p>Common Bionic Portal tasks</p>
              </div>
            </div>

            <div className="dashboard-quick-grid">
              <Link
                to="/orders/new"
                className="dashboard-quick-card"
              >
                <div className="dashboard-quick-card__icon">
                  +
                </div>

                <div>
                  <strong>Create New Order</strong>
                  <span>
                    Enter order and item information
                  </span>
                </div>
              </Link>

              <Link
                to="/orders"
                className="dashboard-quick-card"
              >
                <div className="dashboard-quick-card__icon">
                  →
                </div>

                <div>
                  <strong>View Orders</strong>
                  <span>
                    Review packing activity and results
                  </span>
                </div>
              </Link>

              <Link
                to="/cartons"
                className="dashboard-quick-card"
              >
                <div className="dashboard-quick-card__icon">
                    ◇
                </div>

                <div>
                  <strong>View Cartons</strong>
                  <span>
                    Review available carton types
                  </span>
                </div>
              </Link>
            </div>
          </section>
        </>
      )}
    </>
  );
}