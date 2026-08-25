import { useEffect, useState } from "react";
import { api } from "../api.js";

const blankCarton = {
  reference: "",
  width: "",
  length: "",
  depth: "",
  maxWeight: "",
  boxWeight: "",
  maximumBoxes: "",
  active: true,
};

export function Cartons() {
  const [cartons, setCartons] = useState([]);
  const [form, setForm] = useState(blankCarton);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadCartons = async () => {
    try {
     const { containers } = await api.listContainers();
      setCartons(containers);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadCartons();
  }, []);

  const updateField = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const addCarton = async () => {
    setError("");

    if (!form.reference.trim()) {
      return setError("Enter a carton reference.");
    }

    const width = Number(form.width);
    const length = Number(form.length);
    const depth = Number(form.depth);

    if (!(width > 0 && length > 0 && depth > 0)) {
      return setError(
        "Width, length, and depth must all be above zero."
      );
    }

    const payload = {
      reference: form.reference.trim(),
      width,
      length,
      depth,
      active: form.active,
    };

    if (form.maxWeight !== "") {
      payload.maxWeight = Number(form.maxWeight);
    }

    if (form.boxWeight !== "") {
      payload.boxWeight = Number(form.boxWeight);
    }

    if (form.maximumBoxes !== "") {
      payload.maximumBoxes = Number(form.maximumBoxes);
    }

    setBusy(true);

    try {
      await api.createContainer(payload);
      setForm(blankCarton);
      await loadCartons();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const retireCarton = async (id) => {
    setError("");

    try {
      await api.deleteContainer(id);
      await loadCartons();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Configuration</div>
          <h1>Cartons</h1>
        </div>
      </div>

      {error && (
        <div className="notice notice--error">
          {error}
        </div>
      )}

      <div className="sheet">
        <div className="sheet__head">
          <div>
            <h2>Carton catalogue</h2>
            <p className="muted">
              Reusable carton types available to the packing solver.
            </p>
          </div>

          <span className="mono muted">
            Dimensions in mm · Weight in kg
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Width</th>
                <th>Length</th>
                <th>Depth</th>
                <th>Max weight</th>
                <th>Box weight</th>
                <th>Maximum boxes</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {cartons.length === 0 ? (
                <tr>
                  <td colSpan="9">
                    <span className="muted">
                      No active carton types yet.
                    </span>
                  </td>
                </tr>
              ) : (
                cartons.map((carton) => (
                  <tr key={carton.id}>
                    <td className="mono">
                      {carton.reference}
                    </td>

                    <td>{carton.width}</td>
                    <td>{carton.length}</td>
                    <td>{carton.depth}</td>

                    <td>
                      {carton.maxWeight ?? "—"}
                    </td>

                    <td>
                      {carton.boxWeight ?? "—"}
                    </td>

                    <td>
                      {carton.maximumBoxes ?? "—"}
                    </td>

                    <td>
                      {carton.active
                        ? "Active"
                        : "Inactive"}
                    </td>

                    <td className="text-right">
                      <button
                        className="btn-small btn-danger"
                        onClick={() =>
                          retireCarton(carton.id)
                        }
                      >
                        Retire
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="sheet">
        <div className="sheet__head">
          <h2>Add carton type</h2>
        </div>

        <div className="form-grid">
          <div className="field">
            <label>Reference</label>
            <input
              value={form.reference}
              placeholder="SML"
              onChange={(e) =>
                updateField(
                  "reference",
                  e.target.value
                )
              }
            />
          </div>

          <div className="field">
            <label>Width (mm)</label>
            <input
              type="number"
              min="0"
              step="any"
              value={form.width}
              onChange={(e) =>
                updateField(
                  "width",
                  e.target.value
                )
              }
            />
          </div>

          <div className="field">
            <label>Length (mm)</label>
            <input
              type="number"
              min="0"
              step="any"
              value={form.length}
              onChange={(e) =>
                updateField(
                  "length",
                  e.target.value
                )
              }
            />
          </div>

          <div className="field">
            <label>Depth (mm)</label>
            <input
              type="number"
              min="0"
              step="any"
              value={form.depth}
              onChange={(e) =>
                updateField(
                  "depth",
                  e.target.value
                )
              }
            />
          </div>

          <div className="field">
            <label>Max weight (kg)</label>
            <input
              type="number"
              min="0"
              step="any"
              value={form.maxWeight}
              placeholder="Optional"
              onChange={(e) =>
                updateField(
                  "maxWeight",
                  e.target.value
                )
              }
            />
          </div>

          <div className="field">
            <label>Box weight (kg)</label>
            <input
              type="number"
              min="0"
              step="any"
              value={form.boxWeight}
              placeholder="Optional"
              onChange={(e) =>
                updateField(
                  "boxWeight",
                  e.target.value
                )
              }
            />
          </div>

          <div className="field">
            <label>Maximum boxes</label>
            <input
              type="number"
              min="0"
              step="1"
              value={form.maximumBoxes}
              placeholder="Optional"
              onChange={(e) =>
                updateField(
                  "maximumBoxes",
                  e.target.value
                )
              }
            />
          </div>
        </div>

        <div
          className="stack-actions"
          style={{ marginTop: 16 }}
        >
          <button
            onClick={addCarton}
            disabled={busy}
          >
            {busy
              ? "Adding…"
              : "Add carton"}
          </button>
        </div>
      </div>
    </>
  );
}