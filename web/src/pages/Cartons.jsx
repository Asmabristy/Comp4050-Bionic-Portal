import { useEffect, useState } from "react";
import { api } from "../api.js";

const createBlankCarton = () => ({
  reference: "",
  width: "",
  length: "",
  depth: "",
  maxWeight: "",
  boxWeight: "",
  maximumBoxes: "",
  active: true,
});

function toEditableCarton(carton) {
  return {
    reference: carton.reference ?? "",
    width: carton.width ?? "",
    length: carton.length ?? "",
    depth: carton.depth ?? "",
    maxWeight: carton.maxWeight ?? "",
    boxWeight: carton.boxWeight ?? "",
    maximumBoxes: carton.maximumBoxes ?? "",
    active: carton.active ?? true,
  };
}

function buildPayload(carton) {
  const payload = {
    reference: String(carton.reference).trim(),
    width: Number(carton.width),
    length: Number(carton.length),
    depth: Number(carton.depth),
    active: Boolean(carton.active),
  };

  payload.maxWeight =
    carton.maxWeight === "" ||
    carton.maxWeight == null
      ? null
      : Number(carton.maxWeight);

  payload.boxWeight =
    carton.boxWeight === "" ||
    carton.boxWeight == null
      ? null
      : Number(carton.boxWeight);

  payload.maximumBoxes =
    carton.maximumBoxes === "" ||
    carton.maximumBoxes == null
      ? null
      : Number(carton.maximumBoxes);

  return payload;
}

export function Cartons() {
  const [cartons, setCartons] = useState([]);
  const [form, setForm] = useState(createBlankCarton());

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [editingId, setEditingId] =
    useState(null);

  const [editForm, setEditForm] =
    useState(createBlankCarton());

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const [jsonFileName, setJsonFileName] =
    useState("");

  const [importedCartons, setImportedCartons] =
    useState([]);

  const loadCartons = async () => {
    try {
      const { containers } =
        await api.listContainers(true);

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

  const updateEditField = (key, value) => {
    setEditForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const filteredCartons = cartons.filter(
    (carton) => {
      const matchesSearch =
        carton.reference
          .toLowerCase()
          .includes(
            search.trim().toLowerCase()
          );

      if (statusFilter === "active") {
        return matchesSearch && carton.active;
      }

      if (statusFilter === "inactive") {
        return matchesSearch && !carton.active;
      }

      return matchesSearch;
    }
  );

  const validateCarton = (carton) => {
    if (!String(carton.reference).trim()) {
      return "Enter a carton reference.";
    }

    const width = Number(carton.width);
    const length = Number(carton.length);
    const depth = Number(carton.depth);

    if (
      !(
        width > 0 &&
        length > 0 &&
        depth > 0
      )
    ) {
      return (
        "Width, length, and depth must all " +
        "be above zero."
      );
    }

    if (
      carton.maxWeight !== "" &&
      carton.maxWeight != null &&
      Number(carton.maxWeight) < 0
    ) {
      return (
        "Maximum weight must be zero or above."
      );
    }

    if (
      carton.boxWeight !== "" &&
      carton.boxWeight != null &&
      Number(carton.boxWeight) < 0
    ) {
      return (
        "Box weight must be zero or above."
      );
    }

    if (
      carton.maximumBoxes !== "" &&
      carton.maximumBoxes != null
    ) {
      const maximumBoxes = Number(
        carton.maximumBoxes
      );

      if (
        !Number.isInteger(maximumBoxes) ||
        maximumBoxes < 0
      ) {
        return (
          "Maximum boxes must be a whole " +
          "number of zero or above."
        );
      }
    }

    return "";
  };

  const addCarton = async () => {
    setError("");
    setMessage("");

    const validationError =
      validateCarton(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = buildPayload(form);

    setBusy(true);

    try {
      await api.createContainer(payload);

      setForm(createBlankCarton());

      await loadCartons();

      setMessage(
        `${payload.reference} was added to the carton catalogue.`
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const beginEdit = (carton) => {
    setError("");
    setMessage("");

    setEditingId(carton.id);
    setEditForm(toEditableCarton(carton));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(createBlankCarton());
  };

  const saveEdit = async (id) => {
    setError("");
    setMessage("");

    const validationError =
      validateCarton(editForm);

    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = buildPayload(editForm);

    setBusy(true);

    try {
      await api.updateContainer(id, payload);

      await loadCartons();

      setEditingId(null);
      setEditForm(createBlankCarton());

      setMessage(
        `${payload.reference} was updated successfully.`
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const deactivateCarton = async (
    carton
  ) => {
    setError("");
    setMessage("");

    try {
      await api.deleteContainer(carton.id);

      await loadCartons();

      setMessage(
        `${carton.reference} is now inactive.`
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const activateCarton = async (carton) => {
    setError("");
    setMessage("");

    try {
      await api.updateContainer(
        carton.id,
        {
          active: true,
        }
      );

      await loadCartons();

      setMessage(
        `${carton.reference} is now active.`
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const importJson = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setMessage("");
    setJsonFileName(file.name);

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed = JSON.parse(
          String(reader.result || "")
        );

        if (!Array.isArray(parsed)) {
          setError(
            "The boxes JSON file must contain an array of cartons."
          );

          return;
        }

        const normalized =
          parsed.map((carton) => ({
            reference:
              carton.Reference ??
              carton.reference ??
              "",

            width:
              carton.Width ??
              carton.width ??
              "",

            length:
              carton.Length ??
              carton.length ??
              "",

            depth:
              carton.Depth ??
              carton.depth ??
              "",

            maxWeight:
              carton.MaxWeight ??
              carton.maxWeight ??
              "",

            boxWeight:
              carton.BoxWeight ??
              carton.boxWeight ??
              "",

            maximumBoxes:
              carton.MaximumBoxes ??
              carton.maximumBoxes ??
              "",

            active:
              carton.Active ??
              carton.active ??
              true,
          }));

        const invalidCarton =
          normalized.find((carton) =>
            validateCarton(carton)
          );

        if (invalidCarton) {
          setError(
            "One or more cartons in the JSON file contain invalid data."
          );

          return;
        }

        setImportedCartons(normalized);

        setMessage(
          `${normalized.length} carton type${
            normalized.length === 1
              ? ""
              : "s"
          } loaded from ${file.name}. Review the preview before applying changes.`
        );
      } catch {
        setError(
          "The selected file could not be read as valid JSON."
        );
      }
    };

    reader.readAsText(file);
  };

  const getImportAction = (
    importedCarton
  ) => {
    const existing = cartons.find(
      (carton) =>
        carton.reference.toLowerCase() ===
        importedCarton.reference.toLowerCase()
    );

    return existing
      ? "Update existing"
      : "Add new";
  };

  const applyJsonImport = async () => {
    setError("");
    setMessage("");

    if (importedCartons.length === 0) {
      setError(
        "Choose a boxes.json file first."
      );

      return;
    }

    setBusy(true);

    let updatedCount = 0;
    let addedCount = 0;

    try {
      for (const importedCarton of importedCartons) {
        const payload =
          buildPayload(importedCarton);

        const existing = cartons.find(
          (carton) =>
            carton.reference.toLowerCase() ===
            importedCarton.reference.toLowerCase()
        );

        if (existing) {
          await api.updateContainer(
            existing.id,
            payload
          );

          updatedCount += 1;
        } else {
          await api.createContainer(
            payload
          );

          addedCount += 1;
        }
      }

      await loadCartons();

      setImportedCartons([]);
      setJsonFileName("");

      setMessage(
        `${updatedCount} carton type${
          updatedCount === 1 ? "" : "s"
        } updated and ${addedCount} new carton type${
          addedCount === 1 ? "" : "s"
        } added.`
      );
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
          <div className="eyebrow">Catalogue</div>
          <h1>Cartons</h1>
          <p className="muted">Carton types available to the packing algorithm.</p>
        </div>
      </div>

      {error && (
        <div className="notice notice--error">
          {error}
        </div>
      )}

      {message && (
        <div className="notice">
          {message}
        </div>
      )}

      {/* Search and status filter */}

      <div className="carton-toolbar">
        <div className="carton-search">
          <input
            type="search"
            placeholder="Search cartons..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            aria-label="Search carton catalogue"
          />
        </div>

        <div className="carton-status-filter">
          <label htmlFor="carton-status">
            Status
          </label>

          <select
            id="carton-status"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >
            <option value="all">
              All statuses
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>
          </select>
        </div>
      </div>

      {/* Carton catalogue */}

      <div className="sheet">
        <div className="sheet__head">
          <div>
            <h2>
              Carton catalogue
            </h2>
          </div>

          <span className="mono muted">
            Dimensions in mm · Weight in kg
          </span>
        </div>

        <div
          style={{
            overflowX: "auto",
          }}
        >
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
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCartons.length ===
              0 ? (
                <tr>
                  <td colSpan="9">
                    <span className="muted">
                      No matching carton
                      types.
                    </span>
                  </td>
                </tr>
              ) : (
                filteredCartons.map(
                  (carton) => {
                    const isEditing =
                      editingId ===
                      carton.id;

                    if (isEditing) {
                      return (
                        <tr
                          key={
                            carton.id
                          }
                        >
                          <td>
                            <input
                              value={
                                editForm.reference
                              }
                              onChange={(
                                event
                              ) =>
                                updateEditField(
                                  "reference",
                                  event
                                    .target
                                    .value
                                )
                              }
                            />
                          </td>

                          {[
                            "width",
                            "length",
                            "depth",
                            "maxWeight",
                            "boxWeight",
                            "maximumBoxes",
                          ].map(
                            (
                              key
                            ) => (
                              <td
                                key={
                                  key
                                }
                              >
                                <input
                                  type="number"
                                  min="0"
                                  step={
                                    key ===
                                    "maximumBoxes"
                                      ? "1"
                                      : "any"
                                  }
                                  value={
                                    editForm[
                                      key
                                    ]
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    updateEditField(
                                      key,
                                      event
                                        .target
                                        .value
                                    )
                                  }
                                />
                              </td>
                            )
                          )}

                          <td>
                            <select
  className="carton-status-select"
  value={editForm.active ? "true" : "false"}
  onChange={(e) =>
    updateEditField(
      "active",
      e.target.value === "true"
    )
  }
>
  <option value="true">Active</option>
  <option value="false">Inactive</option>
</select>
                          </td>

                          <td>
                            <div className="stack-actions">
                              <button
                                type="button"
                                className="btn-small"
                                disabled={
                                  busy
                                }
                                onClick={() =>
                                  saveEdit(
                                    carton.id
                                  )
                                }
                              >
                                Save
                              </button>

                              <button
                                type="button"
                                className="btn-small btn-ghost"
                                disabled={
                                  busy
                                }
                                onClick={
                                  cancelEdit
                                }
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr
                        key={
                          carton.id
                        }
                      >
                        <td className="mono">
                          {
                            carton.reference
                          }
                        </td>

                        <td>
                          {carton.width}
                        </td>

                        <td>
                          {carton.length}
                        </td>

                        <td>
                          {carton.depth}
                        </td>

                        <td>
                          {carton.maxWeight ??
                            "—"}
                        </td>

                        <td>
                          {carton.boxWeight ??
                            "—"}
                        </td>

                        <td>
                          {carton.maximumBoxes ??
                            "—"}
                        </td>

                        <td>
                          <span
                            className={
                              carton.active
                                ? "carton-status carton-status--active"
                                : "carton-status carton-status--inactive"
                            }
                          >
                            {carton.active
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td>
                          <div className="stack-actions">
                            <button
                              type="button"
                              className="btn-small btn-ghost"
                              onClick={() =>
                                beginEdit(
                                  carton
                                )
                              }
                            >
                              Edit
                            </button>

                            {carton.active ? (
                              <button
                                type="button"
                                className="btn-small btn-danger"
                                onClick={() =>
                                  deactivateCarton(
                                    carton
                                  )
                                }
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn-small"
                                onClick={() =>
                                  activateCarton(
                                    carton
                                  )
                                }
                              >
                                Activate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON import */}

      <div className="sheet">
        <div className="sheet__head">
          <div>
            <h2>
              Import boxes.json
            </h2>
          </div>
        </div>

        <div className="carton-json-upload">
          <input
            type="file"
            accept=".json,application/json"
            onChange={importJson}
          />

          {jsonFileName && (
            <span className="muted">
              {jsonFileName}
            </span>
          )}
        </div>

        {importedCartons.length >
          0 && (
          <div className="carton-import-preview">
            <div className="sheet__head">
              <h3>
                Import preview
              </h3>

              <span className="muted">
                {
                  importedCartons.length
                }{" "}
                carton
                {importedCartons.length ===
                1
                  ? ""
                  : "s"}
              </span>
            </div>

            <div
              style={{
                overflowX:
                  "auto",
              }}
            >
              <table>
                <thead>
                  <tr>
                    <th>
                      Reference
                    </th>
                    <th>
                      Dimensions
                    </th>
                    <th>
                      Max weight
                    </th>
                    <th>
                      Box weight
                    </th>
                    <th>
                      Maximum boxes
                    </th>
                    <th>
                      Status
                    </th>
                    <th>
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {importedCartons.map(
                    (
                      carton,
                      index
                    ) => (
                      <tr
                        key={`${carton.reference}-${index}`}
                      >
                        <td className="mono">
                          {
                            carton.reference
                          }
                        </td>

                        <td className="mono">
                          {
                            carton.width
                          }{" "}
                          ×{" "}
                          {
                            carton.length
                          }{" "}
                          ×{" "}
                          {
                            carton.depth
                          }
                        </td>

                        <td>
                          {carton.maxWeight ||
                            "—"}
                        </td>

                        <td>
                          {carton.boxWeight ||
                            "—"}
                        </td>

                        <td>
                          {carton.maximumBoxes ||
                            "—"}
                        </td>

                        <td>
                          {carton.active
                            ? "Active"
                            : "Inactive"}
                        </td>

                        <td>
                          <span
                            className={
                              getImportAction(
                                carton
                              ) ===
                              "Update existing"
                                ? "tag tag--packing"
                                : "tag tag--packed"
                            }
                          >
                            {getImportAction(
                              carton
                            )}
                          </span>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div
              className="stack-actions"
              style={{
                marginTop: 16,
              }}
            >
              <button
                type="button"
                disabled={busy}
                onClick={
                  applyJsonImport
                }
              >
                {busy
                  ? "Applying…"
                  : "Apply changes"}
              </button>

              <button
                type="button"
                className="btn-ghost"
                disabled={busy}
                onClick={() => {
                  setImportedCartons(
                    []
                  );

                  setJsonFileName(
                    ""
                  );
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Manual add */}

      <div className="sheet">
        <div className="sheet__head">
          <div>
            <h2>
              Add carton type
            </h2>

            <p className="muted">
              Add a carton directly
              to the shared
              catalogue.
            </p>
          </div>
        </div>

        <div className="form-grid">
          <div className="field">
            <label>
              Reference
            </label>

            <input
              value={
                form.reference
              }
              placeholder="SML"
              onChange={(event) =>
                updateField(
                  "reference",
                  event.target
                    .value
                )
              }
            />
          </div>

          <div className="field">
            <label>
              Width (mm)
            </label>

            <input
              type="number"
              min="0"
              step="any"
              value={form.width}
              onChange={(event) =>
                updateField(
                  "width",
                  event.target
                    .value
                )
              }
            />
          </div>

          <div className="field">
            <label>
              Length (mm)
            </label>

            <input
              type="number"
              min="0"
              step="any"
              value={form.length}
              onChange={(event) =>
                updateField(
                  "length",
                  event.target
                    .value
                )
              }
            />
          </div>

          <div className="field">
            <label>
              Depth (mm)
            </label>

            <input
              type="number"
              min="0"
              step="any"
              value={form.depth}
              onChange={(event) =>
                updateField(
                  "depth",
                  event.target
                    .value
                )
              }
            />
          </div>

          <div className="field">
            <label>
              Max weight (kg)
            </label>

            <input
              type="number"
              min="0"
              step="any"
              value={
                form.maxWeight
              }
              placeholder="Optional"
              onChange={(event) =>
                updateField(
                  "maxWeight",
                  event.target
                    .value
                )
              }
            />
          </div>

          <div className="field">
            <label>
              Box weight (kg)
            </label>

            <input
              type="number"
              min="0"
              step="any"
              value={
                form.boxWeight
              }
              placeholder="Optional"
              onChange={(event) =>
                updateField(
                  "boxWeight",
                  event.target
                    .value
                )
              }
            />
          </div>

          <div className="field">
            <label>
              Maximum boxes
            </label>

            <input
              type="number"
              min="0"
              step="1"
              value={
                form.maximumBoxes
              }
              placeholder="Optional"
              onChange={(event) =>
                updateField(
                  "maximumBoxes",
                  event.target
                    .value
                )
              }
            />
          </div>
        </div>

        <div
          className="stack-actions"
          style={{
            marginTop: 16,
          }}
        >
          <button
            type="button"
            onClick={
              addCarton
            }
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