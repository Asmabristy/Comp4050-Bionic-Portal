import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import { Plate, TitleBlock, SectionHead, plateDate } from "../components/Plate.jsx";
import { Measure } from "../components/Measure.jsx";
import { Icon } from "../components/Icon.jsx";

const SHEETS = [
  {
    to: "/orders/new",
    icon: "plus",
    name: "Raise an order",
    note: "Enter items by hand or import a CSV",
  },
  {
    to: "/orders",
    icon: "orders",
    name: "Order register",
    note: "Every order in the shared queue",
  },
  {
    to: "/cartons",
    icon: "carton",
    name: "Carton catalogue",
    note: "Specified parts and their dimensions",
  },
];

export function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { user } = useAuth();

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
        .slice(0, 6),
    [orders]
  );

  const packedPercentage =
    stats.total > 0
      ? Math.round((stats.packed / stats.total) * 100)
      : 0;

  // What has not been dealt with is named, not buried in the percentage.
  const waiting = stats.draft + stats.packing;

  const cells = [
    { label: "Orders raised", value: stats.total, note: "In the shared queue" },
    {
      label: "Packed",
      value: stats.packed,
      note: `${packedPercentage}% of the queue`,
    },
    { label: "Draft", value: stats.draft, note: "Not yet packed" },
    {
      label: "Failed",
      value: stats.failed,
      note: stats.failed > 0 ? "Needs attention" : "None failed",
      alert: stats.failed > 0,
    },
  ];

  return (
    <>
      {error && <div className="notice notice--error">{error}</div>}

      <Plate>
        <TitleBlock
          name="Dashboard"
          fields={[
            { label: "Issued to", value: user?.name || "—" },
            { label: "Role", value: user?.role || "—" },
            { label: "Date", value: plateDate() },
          ]}
          actions={
            <button
              type="button"
              onClick={() => navigate("/orders/new")}
            >
              <Icon name="plus" size={14} />
              Raise order
            </button>
          }
        />

        {loading ? (
          <div className="emptystate">
            <p className="emptystate__text">Reading the register…</p>
          </div>
        ) : (
          <>
            <Measure
              lead
              label="Queue packed against orders raised"
              ratio={`${stats.packed} / ${stats.total}`}
              percent={packedPercentage}
              value={packedPercentage}
              unit="%"
              short={waiting > 0}
              deficit={
                stats.total === 0
                  ? "No orders raised yet"
                  : waiting > 0
                    ? `Waiting — ${waiting} ${
                        waiting === 1 ? "order" : "orders"
                      }`
                    : "Queue clear"
              }
            />

            <div className="specstrip">
              {cells.map((cell) => (
                <div className="specstrip__cell" key={cell.label}>
                  <span className="specstrip__label">{cell.label}</span>
                  <strong className="specstrip__value">{cell.value}</strong>
                  <span
                    className={`specstrip__note ${
                      cell.alert ? "specstrip__note--alert" : ""
                    }`.trim()}
                  >
                    {cell.note}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </Plate>

      {!loading && (
        <div className="dash-split">
          <Plate>
            <SectionHead
              title="Recent orders"
              note="Six most recently raised"
              actions={
                <Link to="/orders" className="row-open">
                  All orders
                  <Icon name="arrowRight" size={13} />
                </Link>
              }
            />

            {recentOrders.length === 0 ? (
              <div className="emptystate">
                <div className="tile">
                  <Icon name="orders" size={18} />
                </div>

                <p className="emptystate__title">Register empty</p>

                <p className="emptystate__text">
                  Raise an order and it will appear here.
                </p>
              </div>
            ) : (
              <div className="register">
                <table>
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Items</th>
                      <th>Status</th>
                      <th>Raised</th>
                      <th />
                    </tr>
                  </thead>

                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="mono">{order.reference}</td>

                        <td>{order.items?.length ?? 0}</td>

                        <td>
                          <span className={`tag tag--${order.status}`}>
                            {order.status}
                          </span>
                        </td>

                        <td className="muted">
                          {order.createdAt
                            ? plateDate(order.createdAt)
                            : "—"}
                        </td>

                        <td className="text-right">
                          <Link
                            to={`/orders/${order.id}`}
                            className="row-open"
                            aria-label={`Open ${order.reference}`}
                          >
                            Open
                            <Icon name="arrowRight" size={12} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Plate>

          <Plate>
            <SectionHead title="Status" note="Current order states" />

            <div className="dash-breakdown">
              <div className="dash-breakdown__row">
                <span>
                  <i className="dot dot--packed" />
                  Packed
                </span>
                <strong>{stats.packed}</strong>
              </div>

              <div className="dash-breakdown__row">
                <span>
                  <i className="dot dot--draft" />
                  Draft
                </span>
                <strong>{stats.draft}</strong>
              </div>

              <div className="dash-breakdown__row">
                <span>
                  <i className="dot dot--packing" />
                  Packing
                </span>
                <strong>{stats.packing}</strong>
              </div>

              <div className="dash-breakdown__row">
                <span>
                  <i className="dot dot--failed" />
                  Failed
                </span>
                <strong>{stats.failed}</strong>
              </div>
            </div>

            <SectionHead title="Sheets" note="Where the work happens" />

            <div className="dash-index">
              {SHEETS.map((sheet) => (
                <Link
                  to={sheet.to}
                  key={sheet.to}
                  className="dash-index__item"
                >
                  <span>
                    <span className="dash-index__name">{sheet.name}</span>
                    <span className="dash-index__note">{sheet.note}</span>
                  </span>

                  <Icon name={sheet.icon} size={16} />
                </Link>
              ))}
            </div>
          </Plate>
        </div>
      )}
    </>
  );
}
