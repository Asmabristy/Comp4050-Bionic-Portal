
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import FitVisualiser from "@bionic/visualiser";
import { Icon } from "../components/Icon.jsx";
import {
  Plate,
  TitleBlock,
  SectionHead,
  plateDate,
} from "../components/Plate.jsx";
import { Measure } from "../components/Measure.jsx";
import { useAuth } from "../auth.jsx";
import { isSupervisor } from "../roles.js";

export function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canRunSolver = isSupervisor(user);

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

        <div className="emptystate">
          <p className="emptystate__text">
            Reading the order…
          </p>
        </div>
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

  /*
   * Display unique carton types rather than individual carton instances.
   * For example: LRG, LRG-2, LRG-3 becomes LRG.
   *
   * This affects the display only, not the Solver or Visualizer data.
   */
  const selectedCartons = result?.boxes?.length
    ? [
        ...new Set(
          result.boxes
            .map((box) =>
              String(box.boxId ?? "")
                .trim()
                .replace(/-\d+$/, "")
            )
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

  const utilizationPercent =
    utilization !== null
      ? Math.round(utilization * 100)
      : null;

  const totalUnits = order.items.reduce(
    (total, item) =>
      total + (Number(item.quantity) || 1),
    0
  );

  return (
    <>
      <button
        type="button"
        className="backlink"
        onClick={() => navigate("/orders")}
      >
        <Icon name="arrowLeft" size={12} />
        Back to the register
      </button>

      {error && (
        <div className="notice notice--error">
          {error}
        </div>
      )}

      {result?.source === "mock" && (
        <div className="notice notice--hivis">
          Packed by the built-in stand-in solver, not FitSolver. Set{" "}
          <span className="mono">
            USE_MOCK_SOLVER=false
          </span>{" "}
          once the Solver package is ready.
        </div>
      )}

      <Plate>
        <TitleBlock
          name={order.reference}
          fields={[
            {
              label: "Status",
              value: (
                <span
                  className={`tag tag--${order.status}`}
                >
                  {order.status}
                </span>
              ),
            },
            {
              label: "Items",
              value: order.items.length,
            },
            {
              label: "Units",
              value: totalUnits,
            },
            {
              label: "Cartons offered",
              value:
                order.containers
                  .map(
                    (container) =>
                      container.reference
                  )
                  .join(" · ") || "—",
            },
            {
              label: "Raised",
              value: order.createdAt
                ? plateDate(order.createdAt)
                : "—",
            },
          ]}
          actions={
            <>
              {canRunSolver && (
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
              )}

              <button
                type="button"
                className="btn-ghost btn-small btn-danger"
                onClick={remove}
              >
                Delete
              </button>
            </>
          }
        />

        {/* ===================================================
            LOAD PLAN — the order's one subject, full width
            =================================================== */}

        {result ? (
          <div className="loadplan">
            <div className="loadplan__head">
              <h2 className="loadplan__title">
                Load plan
              </h2>

              <p className="loadplan__note">
                Computed by{" "}
                {result.source === "mock"
                  ? "the stand-in solver"
                  : "Bionic FitSolver"}
                {result.solverMs != null &&
                  ` in ${result.solverMs} ms`}
              </p>
            </div>

            <Measure
              label="Volume used across the cartons packed"
              ratio={
                utilizationPercent !== null
                  ? `${cartonsUsed} ${
                      cartonsUsed === 1
                        ? "carton"
                        : "cartons"
                    }`
                  : "Not measured"
              }
              percent={
                utilizationPercent ?? 0
              }
              value={
                utilizationPercent ?? "—"
              }
              unit={
                utilizationPercent !== null
                  ? "%"
                  : ""
              }
              short={unpackedItems > 0}
              deficit={
                unpackedItems > 0
                  ? `Not packed — ${unpackedItems} ${
                      unpackedItems === 1
                        ? "item"
                        : "items"
                    }`
                  : "Everything fitted"
              }
            />

            <div className="loadplan__figures">
              <div className="loadplan__figure">
                <span>Cartons used</span>
                <strong>{cartonsUsed}</strong>
              </div>

              <div className="loadplan__figure">
                <span>Items placed</span>
                <strong>{packedItems}</strong>
              </div>

              <div className="loadplan__figure">
                <span>Not packed</span>
                <strong
                  className={
                    unpackedItems > 0
                      ? "is-short"
                      : ""
                  }
                >
                  {unpackedItems}
                </strong>
              </div>

              <div className="loadplan__figure">
                <span>Cartons selected</span>
                <strong
                  style={{
                    fontSize: "1.0625rem",
                  }}
                >
                  {selectedCartons}
                </strong>
              </div>

              <div className="loadplan__figure">
                <span>Total weight</span>
                <strong
                  style={{
                    fontSize: "1.0625rem",
                  }}
                >
                  {totalWeight !== null
                    ? `${totalWeight.toFixed(2)} kg`
                    : "—"}
                </strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="emptystate">
            <div className="tile">
              <Icon name="cube" size={18} />
            </div>

            <p className="emptystate__title">
              Not packed yet
            </p>

            <p className="emptystate__text">
              {canRunSolver
                ? "Run the packing algorithm to produce a load plan for this order."
                : "A supervisor runs the packing algorithm for this order."}
            </p>
          </div>
        )}

        {result?.message && (
          <div
            className={`notice ${
              result.status === "error"
                ? "notice--error"
                : ""
            }`}
            style={{
              border: 0,
              borderTop:
                "1px solid var(--rule)",
            }}
          >
            {result.message}
          </div>
        )}
      </Plate>

      {/* ===================================================
          3D INSPECTION
          =================================================== */}

      {result?.status === "success" && (
        <Plate>
          <SectionHead
            title="Three-dimensional inspection"
          />

          <div className="visualizer">
            <div className="visualizer__text">
              <h3>Interactive packing view</h3>

              <p>
                {show3D
                  ? "Drag to rotate, scroll to zoom, and select an item for its dimensions."
                  : "Open FitVisualizer to inspect the carton and item placements the solver produced."}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShow3D((open) => !open)
              }
              aria-expanded={show3D}
              aria-controls="fit-visualiser"
            >
              {show3D
                ? "Hide 3D"
                : "View in 3D"}
            </button>
          </div>

          {show3D && (
            <div
              className="visualizer-stage"
              id="fit-visualiser"
            >
              <FitVisualiser result={result} />
            </div>
          )}
        </Plate>
      )}

      {/* ===================================================
          ITEMS
          =================================================== */}

      <Plate>
        <SectionHead
          title="Items"
          note="Dimensions in mm · weight in kg"
          actions={
            <span className="axon__legend">
              X: W across · Y: D up · Z: L back
            </span>
          }
        />

        <div className="register">
          <table>
            <thead>
              <tr>
                <th>Item code</th>
                <th>Item reference</th>
                <th>Width (X)</th>
                <th>Depth (Y)</th>
                <th>Length (Z)</th>
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
                    <td>{item.width}</td>
                    <td>{item.depth}</td>
                    <td>{item.length}</td>
                    <td>{item.weight}</td>
                    <td>
                      {item.quantity ?? 1}
                    </td>
                    <td className="mono">
                      {item.boxGroup || "—"}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </Plate>
    </>
  );
}
