import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";

const blankItem = () => ({
  itemCode: "",
  itemReference: "",
  width: "",
  length: "",
  depth: "",
  weight: "",
  quantity: 1,
  boxGroup: "",
});

export function NewOrder() {
  const [reference, setReference] = useState("");
  const [items, setItems] = useState([blankItem()]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const updateItem = (index, key, value) => {
    const next = [...items];
    next[index] = { ...next[index], [key]: value };
    setItems(next);
  };

  const addItem = () => {
    setItems([...items, blankItem()]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const save = async (thenPack) => {
    setError("");

    const cleaned = items
      .filter((item) => item.itemCode.trim())
      .map((item) => ({
        itemCode: item.itemCode.trim(),
        itemReference: item.itemReference.trim(),
        width: Number(item.width),
        length: Number(item.length),
        depth: Number(item.depth),
        weight: Number(item.weight),
        quantity: Number(item.quantity) || 1,
        boxGroup: item.boxGroup.trim(),
      }));

    if (!reference.trim()) {
      return setError("Give the order a reference.");
    }

    if (cleaned.length === 0) {
      return setError("Add at least one item.");
    }

    const missingReference = cleaned.find(
      (item) => !item.itemReference
    );

    if (missingReference) {
      return setError(
        `${missingReference.itemCode} needs an item reference.`
      );
    }

    const badDimensions = cleaned.find(
      (item) =>
        !(
          item.width > 0 &&
          item.length > 0 &&
          item.depth > 0
        )
    );

    if (badDimensions) {
      return setError(
        `${badDimensions.itemCode} needs width, length, and depth above zero.`
      );
    }

    const badWeight = cleaned.find(
      (item) =>
        !Number.isFinite(item.weight) ||
        item.weight < 0
    );

    if (badWeight) {
      return setError(
        `${badWeight.itemCode} needs a valid weight.`
      );
    }

    setBusy(true);

    try {
      const { order } = await api.createOrder({
        reference: reference.trim(),
        items: cleaned,
      });

      if (thenPack) {
        await api.packOrder(order.id);
      }

      navigate(`/orders/${order.id}`);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Operations</div>
          <h1>New order</h1>
        </div>
      </div>

      {error && (
        <div className="notice notice--error">
          {error}
        </div>
      )}

      <div className="sheet">
        <div
          className="field"
          style={{ maxWidth: 340 }}
        >
          <label htmlFor="reference">
            Order reference
          </label>

          <input
            id="reference"
            value={reference}
            placeholder="PO-40128"
            onChange={(e) =>
              setReference(e.target.value)
            }
          />
        </div>
      </div>

      <div className="sheet">
        <div className="sheet__head">
          <h2>Items</h2>

          <span
            className="mono muted"
            style={{ fontSize: "0.72rem" }}
          >
            Dimensions in mm · Weight in kg
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Item code</th>
                <th>Item reference</th>
                <th>Width</th>
                <th>Length</th>
                <th>Depth</th>
                <th>Weight</th>
                <th>Qty</th>
                <th>Box group</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>
                    <input
                      value={item.itemCode}
                      placeholder={`ITM-${String(
                        index + 1
                      ).padStart(3, "0")}`}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "itemCode",
                          e.target.value
                        )
                      }
                      aria-label={`Item ${
                        index + 1
                      } code`}
                    />
                  </td>

                  <td>
                    <input
                      value={item.itemReference}
                      placeholder="Widget A"
                      onChange={(e) =>
                        updateItem(
                          index,
                          "itemReference",
                          e.target.value
                        )
                      }
                      aria-label={`Item ${
                        index + 1
                      } reference`}
                    />
                  </td>

                  {[
                    "width",
                    "length",
                    "depth",
                    "weight",
                  ].map((key) => (
                    <td key={key}>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item[key]}
                        onChange={(e) =>
                          updateItem(
                            index,
                            key,
                            e.target.value
                          )
                        }
                        aria-label={`Item ${
                          index + 1
                        } ${key}`}
                      />
                    </td>
                  ))}

                  <td>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "quantity",
                          e.target.value
                        )
                      }
                      aria-label={`Item ${
                        index + 1
                      } quantity`}
                    />
                  </td>

                  <td>
                    <input
                      value={item.boxGroup}
                      placeholder="GROUP-A"
                      onChange={(e) =>
                        updateItem(
                          index,
                          "boxGroup",
                          e.target.value
                        )
                      }
                      aria-label={`Item ${
                        index + 1
                      } box group`}
                    />
                  </td>

                  <td className="text-right">
                    <button
                      className="btn-small btn-danger"
                      onClick={() =>
                        removeItem(index)
                      }
                      disabled={items.length === 1}
                      aria-label={`Remove item ${
                        index + 1
                      }`}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          style={{ marginTop: 16 }}
          className="stack-actions"
        >
          <button
            className="btn-ghost btn-small"
            onClick={addItem}
          >
            Add item
          </button>
        </div>
      </div>

      <div className="stack-actions">
        <button
          onClick={() => save(true)}
          disabled={busy}
        >
          {busy
            ? "Packing…"
            : "Save and pack"}
        </button>

        <button
          className="btn-ghost"
          onClick={() => save(false)}
          disabled={busy}
        >
          Save as draft
        </button>
      </div>
    </>
  );
}