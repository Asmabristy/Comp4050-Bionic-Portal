import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";

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
      statusFilter === "all" ||
      order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  const renderOrdersContent = () => {
    if (loading) {
      return (
        <p className="muted mono">
          Loading…
        </p>
      );
    }

    if (orders.length === 0) {
      return (
        <div className="empty">
          <p>
            No orders yet. Define one to send it
            to the solver.
          </p>

          <button
            type="button"
            onClick={() => navigate("/orders/new")}
          >
            Create the first order
          </button>
        </div>
      );
    }

    if (filteredOrders.length === 0) {
      return (
        <div className="orders-no-results">
          <strong>No matching orders</strong>

          <p>
            Try changing your search or status
            filter.
          </p>

          <button
            type="button"
            className="btn-small btn-ghost"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        </div>
      );
    }

    return (
      <div className="orders-table-wrap">
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
                <td className="mono">
                  {order.reference}
                </td>

                <td className="mono">
                  {order.items.length}
                </td>

                <td className="mono">
                  {order.result?.boxes?.length ?? "—"}
                </td>

                <td>
                  <span
                    className={`tag tag--${order.status}`}
                  >
                    {order.status}
                  </span>
                </td>

                <td className="mono muted">
                  {new Date(
                    order.createdAt
                  ).toLocaleDateString("en-AU")}
                </td>

                <td className="text-right">
                  <Link to={`/orders/${order.id}`}>
                    <button
                      type="button"
                      className="btn-small btn-ghost"
                    >
                      Open
                    </button>
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
      <div className="page-head">
        <div>
          <h1>Orders</h1>
        </div>

        <button
          type="button"
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

      {!loading && orders.length > 0 && (
        <div className="orders-toolbar">
          <div className="orders-search">
            <span className="orders-search__icon">
              
            </span>

            <input
              type="search"
              placeholder="Search by reference..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              aria-label="Search orders by reference"
            />
          </div>

          <div className="orders-filter">
            <label htmlFor="order-status">
              Status
            </label>

            <select
              id="order-status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="all">
                All statuses
              </option>

              <option value="draft">
                Draft
              </option>

              <option value="packing">
                Packing
              </option>

              <option value="packed">
                Packed
              </option>

              <option value="failed">
                Failed
              </option>
            </select>
          </div>
        </div>
      )}

      <div className="sheet">
        {renderOrdersContent()}
      </div>
    </>
  );
}