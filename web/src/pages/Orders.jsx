import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { Icon } from "../components/Icon.jsx";
import { Plate, TitleBlock, plateDate } from "../components/Plate.jsx";

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
          <p className="emptystate__text">Reading the register…</p>
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <div className="emptystate">
          <div className="tile">
            <Icon name="orders" size={18} />
          </div>

          <p className="emptystate__title">Register empty</p>

          <p className="emptystate__text">
            Raise your first order and it will be listed here.
          </p>
        </div>
      );
    }

    if (filteredOrders.length === 0) {
      return (
        <div className="emptystate">
          <div className="tile">
            <Icon name="search" size={18} />
          </div>

          <p className="emptystate__title">Nothing matches</p>

          <p className="emptystate__text">
            No order matches that reference and status. Clear the filters to
            see the whole register.
          </p>
        </div>
      );
    }

    return (
      <div className="register">
        <table>
          <thead>
            <tr>
              <th>Reference</th>
              <th>Items</th>
              <th>Cartons used</th>
              <th>Status</th>
              <th>Raised</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td className="mono">{order.reference}</td>

                <td>{order.items.length}</td>

                <td>{order.result?.boxes?.length ?? "—"}</td>

                <td>
                  <span className={`tag tag--${order.status}`}>
                    {order.status}
                  </span>
                </td>

                <td className="muted">
                  {order.createdAt ? plateDate(order.createdAt) : "—"}
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
    );
  };

  return (
    <>
      {error && <div className="notice notice--error">{error}</div>}

      <Plate>
        <TitleBlock
          name="Orders"
          fields={[
            { label: "Records", value: orders.length },
            {
              label: "Showing",
              value: loading ? "—" : filteredOrders.length,
            },
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

        <div className="toolbar">
          <div className="toolbar__search">
            <label htmlFor="orders-search">Reference</label>

            <input
              id="orders-search"
              type="search"
              placeholder="Search by reference"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="toolbar__filter">
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
              className="btn-ghost btn-small"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          )}
        </div>

        {renderContent()}
      </Plate>
    </>
  );
}
