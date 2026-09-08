import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import FitVisualiser from "@bionic/visualiser";

export function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [show3D, setShow3D] = useState(false);

  const load = () =>
    api
      .getOrder(id)
      .then(({ order }) => setOrder(order))
      .catch((err) => setError(err.message));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // A different order means the open 3D view no longer matches what's on screen.
  useEffect(() => {
    setShow3D(false);
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
    try {
      await api.deleteOrder(id);
      navigate("/orders");
    } catch (err) {
      setError(err.message);
    }
  };

  if (!order) {
    return (
      <>
        {error && (
          <div className="notice notice--error">
            {error}
          </div>
        )}

        <p className="muted mono">
          Loading…
        </p>
      </>
    );
  }

  const result = order.result;

  /*
   * Packing summary values.
   * These are derived from the actual stored Solver result.
   */
  const cartonsUsed =
    result?.boxes?.length ?? 0;

  const packedItems =
    result?.boxes?.reduce(
      (total, box) =>
        total + (box.items?.length ?? 0),
      0
    ) ?? 0;

  const unpackedItems =
    result?.unpacked?.length ?? 0;

  const selectedCartons = result?.boxes?.length
    ? [
        ...new Set(
          result.boxes
            .map((box) => box.boxId)
            .filter(Boolean)
        ),
      ].join(", ")
    : "—";

  /*
   * Calculate overall volume utilization using
   * the same box information used by the 2D preview.
   */
 const utilization =
  result?.boxes?.length
    ? result.boxes.reduce(
        (total, box) =>
          total +
          (typeof box.utilization === "number"
            ? box.utilization
            : 0),
        0
      ) / result.boxes.length
    : null;
  /*
   * Some Solver result formats expose totalWeight
   * on each box. If available, display it.
   */
  const totalWeight =
    result?.boxes?.length &&
    result.boxes.every(
      (box) =>
        typeof box.totalWeight === "number"
    )
      ? result.boxes.reduce(
          (total, box) =>
            total + box.totalWeight,
          0
        )
      : null;

  return (
    <>
      {/* Back navigation */}
      <button
        type="button"
        className="order-back-button"
        onClick={() => navigate("/orders")}
      >
        ← Back to Orders
      </button>

      {/* Order heading */}
      <div className="page-head order-detail-head">
        <div>
          <div className="eyebrow">
            Order
          </div>

          <h1>{order.reference}</h1>
        </div>

        <div className="stack-actions">
          <span
            className={`tag tag--${order.status}`}
          >
            {order.status}
          </span>

          <button
            type="button"
            onClick={pack}
            disabled={busy}
          >
            {busy
              ? "Packing…"
              : result
                ? "Re-pack"
                : "Pack this order"}
          </button>

          <button
            type="button"
            className="btn-small btn-danger"
            onClick={remove}
          >
            Delete
          </button>
        </div>
      </div>

      {error && (
        <div className="notice notice--error">
          {error}
        </div>
      )}

      {result?.source === "mock" && (
        <div className="notice notice--hivis">
          Packed by the built-in stand-in
          solver, not FitSolver. Set{" "}
          <span className="mono">
            USE_MOCK_SOLVER=false
          </span>{" "}
          once the Solver package is ready.
        </div>
      )}

      {/* =====================================================
          ORDER INFORMATION / MANIFEST
          ===================================================== */}

      <div className="sheet">
        <div className="sheet__head">
          <div>
            <h2>Manifest</h2>

            <p className="muted">
              Order and packing requirements
            </p>
          </div>
        </div>

        <div className="rows">
          <div className="row">
            <div className="row__label">
              Items
            </div>

            <div className="mono">
              {order.items.length}
            </div>
          </div>

          <div className="row">
            <div className="row__label">
              Carton types
            </div>

            <div className="mono">
              {order.containers
                .map(
                  (container) =>
                    container.reference
                )
                .join(", ") || "—"}
            </div>
          </div>

          <div className="row">
            <div className="row__label">
              Order status
            </div>

            <div>
              <span
                className={`tag tag--${order.status}`}
              >
                {order.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {result?.message && (
        <div
          className={`notice ${
            result.status === "error"
              ? "notice--error"
              : ""
          }`}
        >
          {result.message}
        </div>
      )}

      {/* =====================================================
          PACKING RESULT
          ===================================================== */}

      {result && (
        <div className="sheet packing-result">
          <div className="sheet__head">
            <div>
              <h2>Packing Result</h2>

              <p className="muted">
                Result generated by the packing
                algorithm
              </p>
            </div>

            <span
              className={`tag ${
                result.status === "success"
                  ? "tag--packed"
                  : "tag--failed"
              }`}
            >
              {result.status === "success"
                ? "Packed"
                : result.status}
            </span>
          </div>

          <div className="packing-result__stats">
            <div className="packing-result__stat">
              <span>Cartons used</span>
              <strong>{cartonsUsed}</strong>
            </div>

            <div className="packing-result__stat">
              <span>Items packed</span>
              <strong>{packedItems}</strong>
            </div>

            <div className="packing-result__stat">
              <span>Unpacked</span>
              <strong>{unpackedItems}</strong>
            </div>

            <div className="packing-result__stat">
              <span>Utilization</span>
             <strong>
           {utilization !== null
       ? `${(utilization * 100).toFixed(1)}%`
               : "—"}
               </strong>
            </div>
          </div>

          <div className="packing-result__details">
            <div className="packing-result__detail">
              <span>
                Carton selected
              </span>

              <strong className="mono">
                {selectedCartons}
              </strong>
            </div>

            <div className="packing-result__detail">
              <span>
                Total weight
              </span>

              <strong className="mono">
                {totalWeight !== null
                  ? `${totalWeight.toFixed(2)} kg`
                  : "—"}
              </strong>
            </div>

            <div className="packing-result__detail">
              <span>
                Solve time
              </span>

              <strong className="mono">
                {result.solverMs != null
                  ? `${result.solverMs} ms`
                  : "—"}
              </strong>
            </div>

            <div className="packing-result__detail">
              <span>
                Solver
              </span>

              <strong>
                {result.source ===
                "bionic-solver"
                  ? "Bionic FitSolver"
                  : result.source === "mock"
                    ? "Mock solver"
                    : "Bionic FitSolver"}
              </strong>
            </div>
          </div>
        </div>
      )}

     {result?.status === "success" && (
  <div className="sheet">
    <div className="sheet__head">
      <div>
        <h2>3D Visualization</h2>

        <p className="muted">
          Explore the packing arrangement in the FitVisualizer view.
        </p>
      </div>
    </div>

    <div className="visualizer-placeholder">
      <div className="visualizer-placeholder__content">
        <div className="visualizer-placeholder__icon">
          3D
        </div>

        <div>
          <h3>Interactive packing view</h3>

          <p>
            {show3D
              ? "Drag to rotate, scroll to zoom, and tap an item for its dimensions."
              : "Open the FitVisualizer view to inspect the Solver's carton and item placements."}
          </p>
        </div>
      </div>

      <button
        type="button"
        className="visualizer-button"
        onClick={() => setShow3D((open) => !open)}
        aria-expanded={show3D}
        aria-controls="fit-visualiser"
      >
        {show3D ? "Hide 3D" : "View in 3D"}
      </button>
    </div>

    {show3D && (
      <div className="visualizer-stage" id="fit-visualiser">
        <FitVisualiser result={result} />
      </div>
    )}
  </div>
)}
      {/* =====================================================
          ITEMS
          ===================================================== */}

      <div className="sheet">
        <div className="sheet__head">
          <div>
            <h2>Items</h2>

            <p className="muted">
              Dimensions in mm · Weight in kg
            </p>
          </div>
        </div>

        <div
          style={{
            overflowX: "auto",
          }}
        >
          <table>
            <thead>
              <tr>
                <th>Item code</th>
                <th>
                  Item reference
                </th>
                <th>Width</th>
                <th>Length</th>
                <th>Depth</th>
                <th>Weight</th>
                <th>Qty</th>
                <th>Box group</th>
              </tr>
            </thead>

            <tbody>
              {order.items.map(
                (item, index) => (
                  <tr
                    key={`${item.itemCode}-${index}`}
                  >
                    <td className="mono">
                      {item.itemCode}
                    </td>

                    <td>
                      {item.itemReference}
                    </td>

                    <td className="mono">
                      {item.width}
                    </td>

                    <td className="mono">
                      {item.length}
                    </td>

                    <td className="mono">
                      {item.depth}
                    </td>

                    <td className="mono">
                      {item.weight}
                    </td>

                    <td className="mono">
                      {item.quantity ?? 1}
                    </td>

                    <td className="mono">
                      {item.boxGroup ||
                        "—"}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}