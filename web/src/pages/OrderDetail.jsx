import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { PackingPreview, volumeFill } from "../components/PackingPreview.jsx";

export function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () =>
    api
      .getOrder(id)
      .then(({ order }) => setOrder(order))
      .catch((err) => setError(err.message));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const pack = async () => {
    setError("");
    setBusy(true);
    try {
      const { order } = await api.packOrder(id);
      setOrder(order);
    } catch (err) {
      setError(err.message);
      load();
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    await api.deleteOrder(id);
    navigate("/orders");
  };

  if (!order) {
    return (
      <>
        {error && <div className="notice notice--error">{error}</div>}
        <p className="muted mono">Loading…</p>
      </>
    );
  }

  const result = order.result;

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Order</div>
          <h1>{order.reference}</h1>
        </div>
        <div className="stack-actions">
          <span className={`tag tag--${order.status}`}>{order.status}</span>
          <button onClick={pack} disabled={busy}>
            {busy ? "Packing…" : result ? "Re-pack" : "Pack this order"}
          </button>
          <button className="btn-small btn-danger" onClick={remove}>
            Delete
          </button>
        </div>
      </div>

      {error && <div className="notice notice--error">{error}</div>}

      {result?.source === "mock" && (
        <div className="notice notice--hivis">
          Packed by the built-in stand-in solver, not FitSolver. Set{" "}
          <span className="mono">USE_MOCK_SOLVER=false</span> once the solver service is running.
        </div>
      )}

      <div className="sheet">
        <div className="sheet__head">
          <h2>Manifest</h2>
        </div>
        <div className="rows">
          <div className="row">
            <div className="row__label">Items</div>
            <div className="mono">{order.items.length}</div>
          </div>
          <div className="row">
            <div className="row__label">Carton types</div>
            <div className="mono">{order.containers.map((c) => c.boxId).join(", ") || "—"}</div>
          </div>
          <div className="row">
            <div className="row__label">Cartons used</div>
            <div className="mono">{result?.boxes?.length ?? "—"}</div>
          </div>
          <div className="row">
            <div className="row__label">Unpacked</div>
            <div className="mono">
              {result ? (result.unpacked.length ? result.unpacked.join(", ") : "none") : "—"}
            </div>
          </div>
          <div className="row">
            <div className="row__label">Solve time</div>
            <div className="mono">{result ? `${result.solverMs} ms` : "—"}</div>
          </div>
        </div>
      </div>

      {result?.message && (
        <div className={`notice ${result.status === "error" ? "notice--error" : ""}`}>
          {result.message}
        </div>
      )}

      {result?.status === "success" && result.boxes.length > 0 && (
        <div className="sheet">
          <div className="sheet__head">
            <h2>Packing plan</h2>
            <span className="mono muted" style={{ fontSize: "0.72rem" }}>
              Top-down · mm
            </span>
          </div>

          <div className="boxgrid">
            {result.boxes.map((box, i) => {
              const fill = volumeFill(box);
              return (
                <div className="boxcard" key={i}>
                  <div className="boxcard__head">
                    <span className="boxcard__id">
                      {box.boxId} · {i + 1}
                    </span>
                    <span className="mono muted" style={{ fontSize: "0.72rem" }}>
                      {box.items.length} items
                    </span>
                  </div>

                  <PackingPreview box={box} />

                  <div className="fillbar">
                    <div className="fillbar__val" style={{ width: `${fill}%` }} />
                  </div>
                  <div className="fillnote">
                    <span>Volume used</span>
                    <span>{fill}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="viz-slot" style={{ marginTop: 20 }}>
            FitVisualizer 3D view mounts here — reads GET /api/orders/{order.id}/result
          </div>
        </div>
      )}

      <div className="sheet">
        <div className="sheet__head">
          <h2>Items</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Item ID</th>
              <th>W</th>
              <th>H</th>
              <th>D</th>
              <th>Weight</th>
              <th>Qty</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={i}>
                <td className="mono">{item.itemId}</td>
                <td className="mono">{item.w}</td>
                <td className="mono">{item.h}</td>
                <td className="mono">{item.d}</td>
                <td className="mono">{item.weight}</td>
                <td className="mono">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
