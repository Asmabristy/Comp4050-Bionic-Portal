import { useEffect, useState } from "react";
import { api } from "../api.js";

export function Cartons() {
  const [containers, setContainers] = useState([]);
  const [form, setForm] = useState({ boxId: "", label: "", w: "", h: "", d: "", maxWeight: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () =>
    api
      .listContainers()
      .then(({ containers }) => setContainers(containers))
      .catch((err) => setError(err.message));

  useEffect(() => {
    load();
  }, []);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const add = async () => {
    setError("");
    setBusy(true);
    try {
      await api.createContainer({
        boxId: form.boxId.trim(),
        label: form.label.trim(),
        w: Number(form.w),
        h: Number(form.h),
        d: Number(form.d),
        maxWeight: Number(form.maxWeight) || 0,
      });
      setForm({ boxId: "", label: "", w: "", h: "", d: "", maxWeight: "" });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Reference data</div>
          <h1>Cartons</h1>
        </div>
      </div>

      {error && <div className="notice notice--error">{error}</div>}

      <div className="sheet">
        <div className="sheet__head">
          <h2>Available carton types</h2>
          <span className="mono muted" style={{ fontSize: "0.72rem" }}>
            Sent to the solver with every order
          </span>
        </div>

        {containers.length === 0 ? (
          <div className="empty">
            <p>No carton types yet. Add one below before packing an order.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Box ID</th>
                <th>Label</th>
                <th>W</th>
                <th>H</th>
                <th>D</th>
                <th>Max weight</th>
              </tr>
            </thead>
            <tbody>
              {containers.map((c) => (
                <tr key={c.id}>
                  <td className="mono">{c.boxId}</td>
                  <td>{c.label}</td>
                  <td className="mono">{c.w}</td>
                  <td className="mono">{c.h}</td>
                  <td className="mono">{c.d}</td>
                  <td className="mono">{c.maxWeight || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="sheet">
        <div className="sheet__head">
          <h2>Add a carton type</h2>
        </div>

        <div className="field-grid">
          <div className="field">
            <label htmlFor="boxId">Box ID</label>
            <input id="boxId" value={form.boxId} onChange={set("boxId")} placeholder="MED" />
          </div>
          <div className="field">
            <label htmlFor="label">Label</label>
            <input
              id="label"
              value={form.label}
              onChange={set("label")}
              placeholder="Medium carton"
            />
          </div>
          <div className="field">
            <label htmlFor="cw">Width (mm)</label>
            <input id="cw" type="number" min="0" value={form.w} onChange={set("w")} />
          </div>
          <div className="field">
            <label htmlFor="ch">Height (mm)</label>
            <input id="ch" type="number" min="0" value={form.h} onChange={set("h")} />
          </div>
          <div className="field">
            <label htmlFor="cd">Depth (mm)</label>
            <input id="cd" type="number" min="0" value={form.d} onChange={set("d")} />
          </div>
          <div className="field">
            <label htmlFor="cmw">Max weight (g)</label>
            <input
              id="cmw"
              type="number"
              min="0"
              value={form.maxWeight}
              onChange={set("maxWeight")}
            />
          </div>
        </div>

        <button onClick={add} disabled={busy}>
          {busy ? "Adding…" : "Add carton"}
        </button>
      </div>
    </>
  );
}
