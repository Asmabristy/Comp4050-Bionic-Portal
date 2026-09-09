import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { Icon } from "../components/Icon.jsx";
import { PageHeader, SectionHeader } from "../components/PageHeader.jsx";
import { HeroDecor } from "../components/HeroDecor.jsx";

/**
 * Small bar sparkline in the corner of a stat card.
 *
 * Decorative: it gives the card its shape and weight rather than plotting real
 * history, which we don't store. Heights are fixed so cards stay visually
 * steady as the numbers change.
 */
function Sparkline({ tone, bars }) {
  const W = 66;
  const H = 34;
  const gap = 3;
  const barW = (W - gap * (bars.length - 1)) / bars.length;

  return (
    <svg
      className={`spark spark--${tone}`}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {bars.map((h, i) => {
        const barH = Math.max((h / 100) * H, 3);

        return (
          <rect
            key={i}
            x={i * (barW + gap)}
            y={H - barH}
            width={barW}
            height={barH}
            rx="1.8"
            /* Earlier bars sit back so the shape reads left to right. */
            opacity={0.3 + (i / (bars.length - 1)) * 0.7}
          />
        );
      })}
    </svg>
  );
}

/** Ring showing what share of orders are packed. */
function ProgressRing({ percent }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const filled = (percent / 100) * circumference;

  return (
    <div className="ring">
      <svg viewBox="0 0 130 130" className="ring__svg" aria-hidden="true">
        <circle
          cx="65"
          cy="65"
          r={radius}
          className="ring__track"
          strokeWidth="11"
          fill="none"
        />
        <circle
          cx="65"
          cy="65"
          r={radius}
          className="ring__value"
          strokeWidth="11"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference - filled}`}
          transform="rotate(-90 65 65)"
        />
      </svg>

      <div className="ring__label">
        <strong>{percent}%</strong>
        <span>Packed</span>
      </div>
    </div>
  );
}

const STATUS_ROWS = [
  { key: "packed", label: "Packed", tone: "packed" },
  { key: "draft", label: "Draft", tone: "draft" },
  { key: "packing", label: "Packing", tone: "packing" },
  { key: "failed", label: "Failed", tone: "failed" },
];

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
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5),
    [orders]
  );

  const packedPercentage =
    stats.total > 0 ? Math.round((stats.packed / stats.total) * 100) : 0;

  const statCards = [
    {
      n: "01",
      icon: "orders",
      tone: "blue",
      label: "Total Orders",
      value: stats.total,
      caption: "All orders",
      bars: [18, 26, 38, 44, 62, 78, 100],
    },
    {
      n: "02",
      icon: "box",
      tone: "green",
      label: "Packed",
      value: stats.packed,
      caption: `${packedPercentage}% of orders`,
      captionTone: "ok",
      bars: [22, 30, 34, 52, 70, 84, 100],
    },
    {
      n: "03",
      icon: "clock",
      tone: "purple",
      label: "Draft",
      value: stats.draft,
      caption: "Waiting to be packed",
      bars: [34, 58, 80, 46, 64, 92, 42],
    },
    {
      n: "04",
      icon: "alert",
      tone: "red",
      label: "Failed",
      value: stats.failed,
      caption: stats.failed > 0 ? "Needs attention" : "No failed orders",
      captionTone: stats.failed > 0 ? "danger" : undefined,
      bars: [28, 54, 40, 76, 58, 90, 48],
    },
  ];

  return (
    <>
      <HeroDecor />

      <PageHeader
        eyebrow="Welcome back"
        title="Dashboard"
        subtitle="Here's what's happening with your orders today."
        actions={
          <div className="pagehead__cta">
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate("/orders/new")}
            >
              <Icon name="plus" size={17} />
              New Order
            </button>
            <span className="pagehead__cta-hint">
              Create a new order and get packing
            </span>
          </div>
        }
      />

      {error && <div className="notice notice--error">{error}</div>}

      {loading ? (
        <div className="card emptystate">
          <p className="emptystate__text">Loading dashboard…</p>
        </div>
      ) : (
        <>
          <section className="statgrid">
            {statCards.map((card) => (
              <article
                key={card.n}
                className={`statcard statcard--${card.tone}`}
              >
                <div className={`statcard__tile tone-${card.tone}`}>
                  <Icon name={card.icon} size={23} strokeWidth={1.9} />
                </div>

                <div className="statcard__body">
                  <span className="statcard__label">{card.label}</span>
                  <strong className="statcard__value">{card.value}</strong>
                  <span
                    className={`statcard__caption${
                      card.captionTone
                        ? ` statcard__caption--${card.captionTone}`
                        : ""
                    }`}
                  >
                    {card.caption}
                  </span>
                </div>

                <span className={`statcard__n tone-text-${card.tone}`}>
                  {card.n}
                </span>

                <Sparkline tone={card.tone} bars={card.bars} />
              </article>
            ))}
          </section>

          <section className="dashgrid">
            <article className="card card--fill">
              <SectionHeader
                icon={<Icon name="orders" size={18} />}
                title="Recent Orders"
                subtitle="Latest activity in Bionic Portal"
                actions={
                  <Link to="/orders" className="link-action">
                    View all orders
                    <Icon name="arrowRight" size={15} />
                  </Link>
                }
              />

              {recentOrders.length === 0 ? (
                <div className="emptystate">
                  <div className="tile tone-grey">
                    <Icon name="orders" size={20} />
                  </div>
                  <p className="emptystate__title">No orders yet</p>
                  <p className="emptystate__text">
                    Create your first order to see it here.
                  </p>
                </div>
              ) : (
                <div className="table-wrap card__grow">
                  <table>
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
                          <td className="mono strong">{order.reference}</td>
                          <td>{order.items.length}</td>
                          <td>
                            <span className={`tag tag--${order.status}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="muted">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="text-right">
                            <Link
                              to={`/orders/${order.id}`}
                              className="row-arrow"
                              aria-label={`Open ${order.reference}`}
                            >
                              <Icon name="arrowRight" size={16} />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {recentOrders.length > 0 && (
                <div className="cardfoot">
                  <span>
                    Showing {recentOrders.length} of {orders.length}{" "}
                    {orders.length === 1 ? "order" : "orders"}
                  </span>

                  <Link to="/orders" className="link-action">
                    Open orders
                    <Icon name="arrowRight" size={15} />
                  </Link>
                </div>
              )}
            </article>

            <article className="card card--fill">
              <SectionHeader
                icon={<Icon name="chart" size={18} />}
                title="Packing Summary"
                subtitle="Current order status across all orders"
                tone="purple"
              />

              <div className="summary">
                <ProgressRing percent={packedPercentage} />

                <ul className="statuslist">
                  {STATUS_ROWS.map((row) => (
                    <li key={row.key}>
                      <i className={`dot dot--${row.tone}`} />
                      <span>{row.label}</span>
                      <strong>{stats[row.key]}</strong>
                    </li>
                  ))}
                </ul>
              </div>

              {stats.total > 0 && stats.failed === 0 && stats.packed === stats.total && (
                <div className="banner banner--ok">
                  <Icon name="check" size={16} />
                  <span>All orders packed successfully!</span>
                  <strong>Great work</strong>
                </div>
              )}
            </article>
          </section>

          <section className="card">
            <SectionHeader
              icon={<Icon name="bolt" size={18} />}
              title="Quick Actions"
              subtitle="Common Bionic Portal tasks"
              tone="amber"
            />

            <div className="quickgrid">
              {[
                {
                  to: "/orders/new",
                  icon: "plus",
                  tone: "blue",
                  title: "Create New Order",
                  text: "Enter order and item information",
                },
                {
                  to: "/orders",
                  icon: "list",
                  tone: "purple",
                  title: "View Orders",
                  text: "Review packing activity and results",
                },
                {
                  to: "/cartons",
                  icon: "carton",
                  tone: "green",
                  title: "View Cartons",
                  text: "Review available carton types",
                },
              ].map((action) => (
                <Link key={action.to} to={action.to} className="quickcard">
                  <div className={`tile tone-${action.tone}`}>
                    <Icon name={action.icon} size={19} />
                  </div>

                  <div className="quickcard__text">
                    <strong>{action.title}</strong>
                    <span>{action.text}</span>
                  </div>

                  <span className="quickcard__go">
                    <Icon name="arrowRight" size={16} />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
}
