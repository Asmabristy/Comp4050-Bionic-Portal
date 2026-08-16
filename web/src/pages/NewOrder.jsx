import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";

const blankItem = () => ({ itemId: "", w: "", h: "", d: "", weight: "", quantity: 1 });

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

  const addItem = () => setItems([...items, blankItem()]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const save = async (thenPack) => {
    setError("");

    const cleaned = items
      .filter((i) => i.itemId.trim())
      .map((i) => ({
        itemId: i.itemId.trim(),
        w: Number(i.w),
        h: Number(i.h),
        d: Number(i.d),
        weight: Number(i.weight) || 0,
        quantity: Number(i.quantity) || 1,
      }));

    if (!reference.trim()) return setError("Give the order a reference.");
    if (cleaned.length === 0) return setError("Add at least one item.");

    const bad = cleaned.find((i) => !(i.w > 0 && i.h > 0 && i.d > 0));
    if (bad) return setError(`${bad.itemId} needs width, height, and depth above zero.`);

    setBusy(true);
    try {
      const { order } = await api.createOrder({ reference: reference.trim(), items: cleaned });
      if (thenPack) await api.packOrder(order.id);
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

      {error && <div className="notice notice--error">{error}</div>}

      <div className="sheet">
        <div className="field" style={{ maxWidth: 340 }}>
          <label htmlFor="reference">Order reference</label>
          <input
            id="reference"
            value={reference}
            placeholder="PO-40128"
            onChange={(e) => setReference(e.target.value)}
          />
        </div>
      </div>

      <div className="sheet">
        <div className="sheet__head">
          <h2>Items</h2>
          <span className="mono muted" style={{ fontSize: "0.72rem" }}>
            Dimensions in mm
          </span>
        </div>

        <table>
          <thead>
            <tr>
              <th style={{ width: "24%" }}>Item ID</th>
              <th>W</th>
              <th>H</th>
              <th>D</th>
              <th>Weight (g)</th>
              <th>Qty</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>
                  <input
                    value={item.itemId}
                    placeholder={`SKU-${index + 1}`}
                    onChange={(e) => updateItem(index, "itemId", e.target.value)}
                    aria-label={`Item ${index + 1} ID`}
                  />
                </td>
                {["w", "h", "d", "weight"].map((key) => (
                  <td key={key}>
                    <input
                      type="number"
                      min="0"
                      value={item[key]}
                      onChange={(e) => updateItem(index, key, e.target.value)}
                      aria-label={`Item ${index + 1} ${key}`}
                    />
                  </td>
                ))}
                <td>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", e.target.value)}
                    aria-label={`Item ${index + 1} quantity`}
                  />
                </td>
                <td className="text-right">
                  <button
                    className="btn-small btn-danger"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    aria-label={`Remove item ${index + 1}`}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 16 }} className="stack-actions">
          <button className="btn-ghost btn-small" onClick={addItem}>
            Add item
          </button>
        </div>
      </div>

      <div className="stack-actions">
        <button onClick={() => save(true)} disabled={busy}>
          {busy ? "Packing…" : "Save and pack"}
        </button>
        <button className="btn-ghost" onClick={() => save(false)} disabled={busy}>
          Save as draft
        </button>
      </div>
    </>
  );
}
