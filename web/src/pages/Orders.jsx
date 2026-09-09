import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { Icon } from "../components/Icon.jsx";
import { PageHeader, SectionHeader } from "../components/PageHeader.jsx";

export function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const navigate = useNavigate();

  useEffect(() => {
    api
      .listOrders()
      .then(({ orders }) => setOrders(orders))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.reference
      .toLowerCase()
      .includes(search.trim().toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const filtersApplied = search.trim() !== "" || statusFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="emptystate">
          <p className="emptystate__text">Loading orders…</p>
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <div className="emptystate">
          <div className="tile tone-grey">
            <Icon name="orders" size={20} />
          </div>
          <p className="emptystate__title">No orders yet</p>
          <p className="emptystate__text">
            Create your first order to see it here.
          </p>
        </div>
      );
    }

    if (filteredOrders.length === 0) {
      return (
        <div className="emptystate">
          <div className="tile tone-grey">
            <Icon name="search" size={20} />
          </div>
          <p className="emptystate__title">No matching orders</p>
          <p className="emptystate__text">
            Try a different reference or status.
          </p>
        </div>
      );
    }

    return (
      <div className="table-wrap">
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
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td className="mono strong">{order.reference}</td>
                <td>{order.items.length}</td>
                <td>{order.result?.boxes?.length ?? "—"}</td>
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
    );
  };

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Orders"
        subtitle="Every order raised in Bionic Portal, newest first."
        actions={
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate("/orders/new")}
          >
            <Icon name="plus" size={17} />
            New Order
          </button>
        }
      />

      {error && <div className="notice notice--error">{error}</div>}

      <div className="card">
        <SectionHeader
          icon={<Icon name="list" size={18} />}
          title="All Orders"
          subtitle={
            loading
              ? "Loading…"
              : `${filteredOrders.length} of ${orders.length} shown`
          }
        />

        <div className="toolbar">
          <div className="toolbar__search">
            <Icon name="search" size={16} />
            <input
              type="search"
              placeholder="Search by reference…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search orders by reference"
            />
          </div>

          <div className="toolbar__field">
            <label htmlFor="orders-status">Status</label>
            <select
              id="orders-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="packing">Packing</option>
              <option value="packed">Packed</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {filtersApplied && (
            <button
              type="button"
              className="btn-ghost btn-small toolbar__spacer"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          )}
        </div>

        {renderContent()}
      </div>
    </>
  );
}
