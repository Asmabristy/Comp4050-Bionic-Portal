import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { Icon } from "../components/Icon.jsx";

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

  const filtersApplied =
    search.trim() !== "" || statusFilter !== "all";

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

          <p className="emptystate__title">
            No orders yet
          </p>

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

          <p className="emptystate__title">
            No matching orders
          </p>

          <p className="emptystate__text">
            Try a different reference or status.
          </p>
        </div>
      );
    }

    return (
      <div className="orders-table-wrap">
        <table className="orders-table">
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
                <td className="mono strong">
                  {order.reference}
                </td>

                <td>{order.items.length}</td>

                <td>
                  {order.result?.boxes?.length ?? "—"}
                </td>

                <td>
                  <span className={`tag tag--${order.status}`}>
                    {order.status}
                  </span>
                </td>

                <td className="muted">
                  {new Date(
                    order.createdAt
                  ).toLocaleDateString()}
                </td>

                <td className="text-right">
                  <Link
                    to={`/orders/${order.id}`}
                    className="orders-open-button"
                  >
                    Open
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
      <div className="orders-page-head">
        <h1>Orders</h1>

        <button
          type="button"
          className="btn-primary"
          onClick={() => navigate("/orders/new")}
        >
          New order
        </button>
      </div>

      {error && (
        <div className="notice notice--error">
          {error}
        </div>
      )}

      <div className="orders-controls">
        <div className="orders-search">
          <input
            type="search"
            placeholder="Search by reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search orders by reference"
          />
        </div>

        <div className="orders-filter">
          <label htmlFor="orders-status">
            Status
          </label>

          <select
            id="orders-status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
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
            className="btn-ghost btn-small"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="orders-card">
        {renderContent()}
      </div>
    </>
  );
}