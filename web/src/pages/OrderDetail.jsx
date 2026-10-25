
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

const blankItem = () => ({
  itemCode: "",
  itemReference: "",
  width: "",
  depth: "",
  length: "",
  weight: "",
  quantity: 1,
  boxGroup: "",
});

const editableItem = (item) => ({
  itemCode: String(item.itemCode ?? ""),
  itemReference: String(item.itemReference ?? ""),
  width: String(item.width ?? ""),
  depth: String(item.depth ?? ""),
  length: String(item.length ?? ""),
  weight: String(item.weight ?? ""),
  quantity: String(item.quantity ?? 1),
  boxGroup: String(item.boxGroup ?? ""),
});

const normalizeBoxGroup = (value) => {
  if (value == null) return "";

  if (
    typeof value === "string" ||
    (typeof value === "number" && Number.isFinite(value))
  ) {
    return String(value).trim();
  }

  throw new Error(
    "Box Group must be text, a number, or null."
  );
};

function validateEditedItems(items) {
  if (items.length === 0) {
    throw new Error("Add at least one item.");
  }

  if (items.length > 500) {
    throw new Error("An order can have at most 500 item rows.");
  }

  const cleaned = items.map((item, index) => {
    const number = index + 1;
    const itemCode = item.itemCode.trim();
    const itemReference = item.itemReference.trim();

    if (!itemCode || !itemReference) {
      throw new Error(
        `Item ${number} needs an item code and item reference.`
      );
    }

    const dimensions = [
      item.width,
      item.depth,
      item.length,
    ];

    if (
      dimensions.some(
        (value) =>
          String(value).trim() === "" ||
          !Number.isFinite(Number(value)) ||
          Number(value) <= 0
      )
    ) {
      throw new Error(
        `Item ${number} needs width, depth, and length above zero.`
      );
    }

    if (
      String(item.weight).trim() === "" ||
      !Number.isFinite(Number(item.weight)) ||
      Number(item.weight) < 0
    ) {
      throw new Error(
        `Item ${number} needs a valid weight of zero or greater.`
      );
    }

    const quantity = Number(item.quantity);

    if (
      String(item.quantity).trim() === "" ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 10000
    ) {
      throw new Error(
        `Item ${number} needs an integer quantity between 1 and 10000.`
      );
    }

    return {
      itemCode,
      itemReference,
      width: Number(item.width),
      depth: Number(item.depth),
      length: Number(item.length),
      weight: Number(item.weight),
      quantity,
      boxGroup: normalizeBoxGroup(item.boxGroup),
    };
  });

  const totalUnits = cleaned.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  if (totalUnits > 20000) {
    throw new Error(
      "The order cannot exceed 20000 total units."
    );
  }

  return cleaned;
}

export function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canRunSolver = isSupervisor(user);

  const [order, setOrder] = useState(null);
  const [editedItems, setEditedItems] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [changesSaved, setChangesSaved] = useState(false);

  const load = async () => {
    const { order: latest } = await api.getOrder(id);
    setOrder(latest);
    setEditedItems(latest.items.map(editableItem));
    return latest;
  };

  useEffect(() => {
    let cancelled = false;

    setOrder(null);
    setEditedItems([]);
    setEditing(false);
    setChangesSaved(false);
    setError("");

    api
      .getOrder(id)
      .then(({ order: latest }) => {
        if (cancelled) return;
        setOrder(latest);
        setEditedItems(latest.items.map(editableItem));
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const hasChanges =
    order !== null &&
    JSON.stringify(editedItems) !==
      JSON.stringify(order.items.map(editableItem));

  const updateItem = (index, key, value) => {
    setEditedItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [key]: value }
          : item
      )
    );
  };

  const addItem = () => {
    setEditedItems((current) => [
      ...current,
      blankItem(),
    ]);
  };

  const removeItem = (index) => {
    setEditedItems((current) =>
      current.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const cancelEditing = () => {
    setEditedItems(order.items.map(editableItem));
    setEditing(false);
    setError("");
  };

  const pack = async () => {
    setError("");
    setBusy(true);

    try {
      const { order: packedOrder } =
        await api.packOrder(id);

      setOrder(packedOrder);
      setEditedItems(packedOrder.items.map(editableItem));
      setEditing(false);
      setChangesSaved(false);
    } catch (err) {
      setError(err.message);

      try {
        await load();
      } catch {
        // Keep the original packing error visible.
      }
    } finally {
      setBusy(false);
    }
  };

  const saveAndRepack = async () => {
    setError("");

    let cleaned;

    try {
      cleaned = validateEditedItems(editedItems);
    } catch (err) {
      setError(err.message);
      return;
    }

    setBusy(true);

    let savedSuccessfully = false;

    try {
      const { order: updated } =
        await api.updateOrderItems(id, cleaned);

      savedSuccessfully = true;
      setChangesSaved(true);
      setOrder(updated);
      setEditedItems(updated.items.map(editableItem));

      const { order: packedOrder } =
        await api.packOrder(id);

      setOrder(packedOrder);
      setEditedItems(packedOrder.items.map(editableItem));
      setEditing(false);
      setChangesSaved(false);
    } catch (err) {
      setError(
        savedSuccessfully
          ? `The item changes were saved, but packing failed: ${err.message}. You can retry packing this order.`
          : err.message
      );

      if (savedSuccessfully) {
        try {
          await load();
        } catch {
          // Preserve the save/packing error.
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setError("");
    setBusy(true);

    try {
      await api.deleteOrder(id);
      navigate("/orders");
    } catch (err) {
      setError(err.message);
      setBusy(false);
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

  // Do not show old packing results alongside unsaved edits.
  const result = hasChanges ? null : order.result;

  const cartonsUsed = result?.boxes?.length ?? 0;

  const packedItems =
    result?.boxes?.reduce(
      (total, box) =>
        total + (box.items?.length ?? 0),
      0
    ) ?? 0;

  const unpackedItems =
    result?.unpacked?.length ?? 0;

  /*
   * Display unique carton types rather than carton instances.
   * This does not modify Solver or Visualizer data.
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

  const utilization = result?.boxes?.length
    ? result.boxes.reduce(
        (total, box) =>
          total +
          (typeof box.utilization === "number"
            ? box.utilization
            : 0),
        0
      ) / result.boxes.length
    : null;

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

  const showUnsavedWarning =
    canRunSolver && editing && hasChanges;

  return (
    <>
      <button
        type="button"
        className="backlink"
        onClick={() => navigate("/orders")}
        disabled={busy}
      >
        <Icon name="arrowLeft" size={12} />
        Back to the register
      </button>

      {error && (
        <div className="notice notice--error">
          {error}
        </div>
      )}

      {showUnsavedWarning && (
        <div className="notice notice--hivis">
          <strong>Unsaved item changes.</strong>{" "}
          Save and re-pack this order to update its
          packing results. The previous load plan is
          temporarily hidden.
        </div>
      )}

      {changesSaved && !order.result && (
        <div className="notice notice--hivis">
          Your updated items have been saved.
          The order needs to be packed again
          to generate a new load plan.
        </div>
      )}

      {result?.source === "mock" && (
        <div className="notice notice--hivis">
          Packed by the built-in stand-in solver,
          not FitSolver. Set{" "}
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
                (order.containers || [])
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
              {canRunSolver && !editing && (
                <button
                  type="button"
                  onClick={pack}
                  disabled={busy}
                >
                  {busy
                    ? "Packing…"
                    : order.result
                      ? "Re-pack"
                      : "Pack this order"}
                </button>
              )}

              {canRunSolver && editing && (
                <button
                  type="button"
                  onClick={
                    hasChanges
                      ? saveAndRepack
                      : pack
                  }
                  disabled={busy}
                >
                  {busy
                    ? "Saving / Packing…"
                    : hasChanges
                      ? "Save and Re-pack"
                      : order.result
                        ? "Re-pack"
                        : "Pack this order"}
                </button>
              )}

              <button
                type="button"
                className="btn-ghost btn-small btn-danger"
                onClick={remove}
                disabled={busy || hasChanges}
              >
                Delete
              </button>
            </>
          }
        />

        {/* LOAD PLAN */}

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
              {hasChanges
                ? "Item changes pending"
                : "Not packed yet"}
            </p>

            <p className="emptystate__text">
              {hasChanges
                ? "Save and re-pack to calculate a load plan using the edited items."
                : canRunSolver
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

      {/* AUTOMATIC 3D VISUALIZER */}

      {result?.status === "success" && (
        <Plate>
          <SectionHead
            title="Three-dimensional inspection"
          />

          <div className="visualizer">
            <div className="visualizer__text">
              <h3>Interactive packing view</h3>

              <p>
                Drag to rotate, scroll to zoom, and
                select an item to inspect its dimensions.
              </p>
            </div>
          </div>

          <div
            className="visualizer-stage"
            id="fit-visualiser"
          >
            <FitVisualiser
              key={result.solvedAt ?? "result"}
              result={result}
            />
          </div>
        </Plate>
      )}

      {/* ITEMS */}

      <Plate>
        <SectionHead
          title="Items"
          note={
            editing
              ? "Edit item specifications · dimensions in mm · weight in kg"
              : "Dimensions in mm · weight in kg"
          }
          actions={
            <span className="axon__legend">
              X: W across · Y: D up · Z: L back
            </span>
          }
        />

        {canRunSolver && (
          <div className="plate__body">
            <div className="stack-actions">
              {!editing ? (
                <button
                  type="button"
                  className="btn-ghost btn-small"
                  disabled={busy}
                  onClick={() => {
                    setEditedItems(
                      order.items.map(editableItem)
                    );
                    setEditing(true);
                    setError("");
                  }}
                >
                  Edit items
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn-ghost btn-small"
                    onClick={addItem}
                    disabled={busy || editedItems.length >= 500}
                  >
                    <Icon name="plus" size={13} />
                    Add item row
                  </button>

                  <button
                    type="button"
                    className="btn-ghost btn-small"
                    onClick={cancelEditing}
                    disabled={busy}
                  >
                    Cancel changes
                  </button>

                  <button
                    type="button"
                    onClick={
                      hasChanges
                        ? saveAndRepack
                        : pack
                    }
                    disabled={busy}
                  >
                    {busy
                      ? "Saving / Packing…"
                      : hasChanges
                        ? "Save and Re-pack"
                        : "Re-pack"}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

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
                {editing && canRunSolver && <th />}
              </tr>
            </thead>

            <tbody>
              {editing && canRunSolver
                ? editedItems.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          value={item.itemCode}
                          placeholder="ITM-001"
                          disabled={busy}
                          onChange={(event) =>
                            updateItem(
                              index,
                              "itemCode",
                              event.target.value
                            )
                          }
                          aria-label={`Item ${index + 1} code`}
                        />
                      </td>

                      <td>
                        <input
                          value={item.itemReference}
                          placeholder="Widget A"
                          disabled={busy}
                          onChange={(event) =>
                            updateItem(
                              index,
                              "itemReference",
                              event.target.value
                            )
                          }
                          aria-label={`Item ${index + 1} reference`}
                        />
                      </td>

                      {[
                        "width",
                        "depth",
                        "length",
                        "weight",
                      ].map((key) => (
                        <td key={key}>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item[key]}
                            disabled={busy}
                            onChange={(event) =>
                              updateItem(
                                index,
                                key,
                                event.target.value
                              )
                            }
                            aria-label={`Item ${index + 1} ${key}`}
                          />
                        </td>
                      ))}

                      <td>
                        <input
                          type="number"
                          min="1"
                          max="10000"
                          step="1"
                          value={item.quantity}
                          disabled={busy}
                          onChange={(event) =>
                            updateItem(
                              index,
                              "quantity",
                              event.target.value
                            )
                          }
                          aria-label={`Item ${index + 1} quantity`}
                        />
                      </td>

                      <td>
                        <input
                          type="text"
                          value={item.boxGroup}
                          placeholder="GROUP-A or 1"
                          disabled={busy}
                          onChange={(event) =>
                            updateItem(
                              index,
                              "boxGroup",
                              event.target.value
                            )
                          }
                          aria-label={`Item ${index + 1} box group`}
                        />
                      </td>

                      <td className="text-right">
                        <button
                          type="button"
                          className="btn-small btn-danger"
                          onClick={() => removeItem(index)}
                          disabled={busy || editedItems.length === 1}
                          aria-label={`Remove item ${index + 1}`}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                : order.items.map((item, index) => (
                    <tr
                      key={`${item.itemCode}-${index}`}
                    >
                      <td className="mono">
                        {item.itemCode}
                      </td>
                      <td>{item.itemReference}</td>
                      <td>{item.width}</td>
                      <td>{item.depth}</td>
                      <td>{item.length}</td>
                      <td>{item.weight}</td>
                      <td>{item.quantity ?? 1}</td>
                      <td className="mono">
                        {item.boxGroup || "—"}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </Plate>
    </>
  );
}
