import { useEffect, useState } from "react";
import { api } from "../api.js";
import { Icon } from "../components/Icon.jsx";
import {
  Plate,
  TitleBlock,
  SectionHead,
} from "../components/Plate.jsx";
import { Axon } from "../components/Axon.jsx";

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

  const activeCount = cartons.filter((carton) => carton.active).length;

  const EDITABLE = [
    "width",
    "depth",
    "length",
    "maxWeight",
    "boxWeight",
    "maximumBoxes",
  ];

  return (
    <>
      {error && <div className="notice notice--error">{error}</div>}

      {message && <div className="notice">{message}</div>}

      {/* ===================================================
          THE CATALOGUE — each carton as a specified part
          =================================================== */}

      <Plate>
        <TitleBlock
          name="Cartons"
          fields={[
            { label: "Parts", value: cartons.length },
            { label: "Active", value: activeCount },
            { label: "Showing", value: filteredCartons.length },
          ]}
        />

        <div className="toolbar">
          <div className="toolbar__search">
            <label htmlFor="carton-search">Reference</label>

            <input
              id="carton-search"
              type="search"
              placeholder="Search the catalogue"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="toolbar__filter">
            <label htmlFor="carton-status">Status</label>

            <select
              id="carton-status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <span className="toolbar__count">
            Dimensions in mm · weight in kg
          </span>
        </div>

        <SectionHead
          title="Catalogue"
          note="X: width across, Y: depth up, Z: length back"
          actions={
            <span className="axon__legend">X: W across · Y: D up · Z: L back</span>
          }
        />

        {filteredCartons.length === 0 ? (
          <div className="emptystate">
            <div className="tile">
              <Icon name="carton" size={18} />
            </div>

            <p className="emptystate__title">No matching carton</p>

            <p className="emptystate__text">
              Nothing in the catalogue matches that reference and status.
            </p>
          </div>
        ) : (
          <div className="catalogue">
            {filteredCartons.map((carton) => (
              <article
                key={carton.id}
                className={`catalogue__part ${
                  carton.active ? "" : "catalogue__part--inactive"
                }`.trim()}
              >
                <div className="catalogue__head">
                  <span className="catalogue__ref">{carton.reference}</span>

                  <span
                    className={`tag ${
                      carton.active ? "tag--packed" : "tag--draft"
                    }`}
                  >
                    {carton.active ? "Active" : "Inactive"}
                  </span>
                </div>

                <Axon
                  width={carton.width}
                  length={carton.length}
                  depth={carton.depth}
                  span={74}
                  title={`Carton ${carton.reference}: width ${carton.width}, depth ${carton.depth}, length ${carton.length} millimetres`}
                />

                <div className="catalogue__spec">
                  <div>
                    <span>Max weight</span>
                    <span>
                      {carton.maxWeight != null
                        ? `${carton.maxWeight} kg`
                        : "—"}
                    </span>
                  </div>

                  <div>
                    <span>Box weight</span>
                    <span>
                      {carton.boxWeight != null
                        ? `${carton.boxWeight} kg`
                        : "—"}
                    </span>
                  </div>

                  <div>
                    <span>Max boxes</span>
                    <span>{carton.maximumBoxes ?? "—"}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Plate>

      {/* ===================================================
          THE REGISTER — where a carton is edited
          =================================================== */}

      <Plate>
        <SectionHead
          title="Register"
          note="Edit a carton, or take it out of service"
        />

        <div className="register">
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Width (X)</th>
                <th>Depth (Y)</th>
                <th>Length (Z)</th>
                <th>Max weight</th>
                <th>Box weight</th>
                <th>Max boxes</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {filteredCartons.length === 0 ? (
                <tr>
                  <td colSpan="9">
                    <span className="muted">No matching carton types.</span>
                  </td>
                </tr>
              ) : (
                filteredCartons.map((carton) => {
                  const isEditing = editingId === carton.id;

                  if (isEditing) {
                    return (
                      <tr key={carton.id}>
                        <td>
                          <input
                            value={editForm.reference}
                            aria-label="Carton reference"
                            onChange={(event) =>
                              updateEditField(
                                "reference",
                                event.target.value
                              )
                            }
                          />
                        </td>

                        {EDITABLE.map((key) => (
                          <td key={key}>
                            <input
                              type="number"
                              min="0"
                              step={key === "maximumBoxes" ? "1" : "any"}
                              value={editForm[key]}
                              aria-label={key}
                              onChange={(event) =>
                                updateEditField(key, event.target.value)
                              }
                            />
                          </td>
                        ))}

                        <td>
                          <select
                            aria-label="Carton status"
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

                        <td className="text-right">
                          <div className="stack-actions">
                            <button
                              type="button"
                              className="btn-small"
                              disabled={busy}
                              onClick={() => saveEdit(carton.id)}
                            >
                              Save
                            </button>

                            <button
                              type="button"
                              className="btn-small btn-ghost"
                              disabled={busy}
                              onClick={cancelEdit}
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={carton.id}>
                      <td className="mono">{carton.reference}</td>
                        <td>{carton.width}</td>
                        <td>{carton.depth}</td>
                        <td>{carton.length}</td>
                      <td>{carton.maxWeight ?? "—"}</td>
                      <td>{carton.boxWeight ?? "—"}</td>
                      <td>{carton.maximumBoxes ?? "—"}</td>

                      <td>
                        <span
                          className={`tag ${
                            carton.active ? "tag--packed" : "tag--draft"
                          }`}
                        >
                          {carton.active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="text-right">
                        <div className="stack-actions">
                          <button
                            type="button"
                            className="btn-small btn-ghost"
                            onClick={() => beginEdit(carton)}
                          >
                            Edit
                          </button>

                          {carton.active ? (
                            <button
                              type="button"
                              className="btn-small btn-danger"
                              onClick={() => deactivateCarton(carton)}
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn-small"
                              onClick={() => activateCarton(carton)}
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Plate>

      {/* ===================================================
          IMPORT
          =================================================== */}

      <Plate>
        <SectionHead
          title="Import boxes.json"
          note="Bring a whole catalogue in at once"
        />

        <div className="plate__body">
          <div className="carton-json-upload">
            <input
              type="file"
              accept=".json,application/json"
              onChange={importJson}
              aria-label="Choose a boxes.json file"
            />

            {jsonFileName && (
              <span className="csv-file-selected">
                Loaded {jsonFileName}
              </span>
            )}
          </div>

          {importedCartons.length > 0 && (
            <div className="carton-import-preview">
              <div className="sectionhead">
                <div className="sectionhead__text">
                  <h2 className="sectionhead__title">Import preview</h2>

                  <p className="sectionhead__subtitle">
                    {importedCartons.length} carton
                    {importedCartons.length === 1 ? "" : "s"} read from the
                    file
                  </p>
                </div>
              </div>

              <div className="register">
                <table>
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>W × D × L (XYZ)</th>
                      <th>Max weight</th>
                      <th>Box weight</th>
                      <th>Max boxes</th>
                      <th>Status</th>
                      <th>On apply</th>
                    </tr>
                  </thead>

                  <tbody>
                    {importedCartons.map((carton, index) => (
                      <tr key={`${carton.reference}-${index}`}>
                        <td className="mono">{carton.reference}</td>

                        <td>
                          {carton.width} × {carton.depth} × {carton.length}
                        </td>

                        <td>{carton.maxWeight || "—"}</td>
                        <td>{carton.boxWeight || "—"}</td>
                        <td>{carton.maximumBoxes || "—"}</td>

                        <td>
                          <span
                            className={`tag ${
                              carton.active ? "tag--packed" : "tag--draft"
                            }`}
                          >
                            {carton.active ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              getImportAction(carton) === "Update existing"
                                ? "tag tag--packing"
                                : "tag tag--packed"
                            }
                          >
                            {getImportAction(carton)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div
                className="stack-actions"
                style={{ padding: "var(--s4) var(--s5)" }}
              >
                <button
                  type="button"
                  disabled={busy}
                  onClick={applyJsonImport}
                >
                  {busy ? "Applying…" : "Apply changes"}
                </button>

                <button
                  type="button"
                  className="btn-ghost"
                  disabled={busy}
                  onClick={() => {
                    setImportedCartons([]);
                    setJsonFileName("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </Plate>

      {/* ===================================================
          SPECIFY A NEW CARTON
          =================================================== */}

      <Plate>
        <SectionHead
          title="Add a carton type"
          note="Added straight to the shared catalogue"
          actions={
            <span className="axon__legend">X: W across · Y: D up · Z: L back</span>
          }
        />

        <div className="plate__body">
          <div className="form-grid">
            <div className="field">
              <label htmlFor="new-carton-reference">Reference</label>

              <input
                id="new-carton-reference"
                value={form.reference}
                placeholder="SML"
                onChange={(event) =>
                  updateField("reference", event.target.value)
                }
              />
            </div>

            <div className="field">
              <label htmlFor="new-carton-width">Width (mm)</label>

              <input
                id="new-carton-width"
                type="number"
                min="0"
                step="any"
                value={form.width}
                onChange={(event) =>
                  updateField("width", event.target.value)
                }
              />
            </div>

            <div className="field">
              <label htmlFor="new-carton-depth">Depth (mm)</label>

              <input
                id="new-carton-depth"
                type="number"
                min="0"
                step="any"
                value={form.depth}
                onChange={(event) =>
                  updateField("depth", event.target.value)
                }
              />
            </div>

            <div className="field">
              <label htmlFor="new-carton-length">Length (mm)</label>

              <input
                id="new-carton-length"
                type="number"
                min="0"
                step="any"
                value={form.length}
                onChange={(event) =>
                  updateField("length", event.target.value)
                }
              />
            </div>

            <div className="field">
              <label htmlFor="new-carton-max-weight">Max weight (kg)</label>

              <input
                id="new-carton-max-weight"
                type="number"
                min="0"
                step="any"
                value={form.maxWeight}
                placeholder="Optional"
                onChange={(event) =>
                  updateField("maxWeight", event.target.value)
                }
              />
            </div>

            <div className="field">
              <label htmlFor="new-carton-box-weight">Box weight (kg)</label>

              <input
                id="new-carton-box-weight"
                type="number"
                min="0"
                step="any"
                value={form.boxWeight}
                placeholder="Optional"
                onChange={(event) =>
                  updateField("boxWeight", event.target.value)
                }
              />
            </div>

            <div className="field">
              <label htmlFor="new-carton-max-boxes">Maximum boxes</label>

              <input
                id="new-carton-max-boxes"
                type="number"
                min="0"
                step="1"
                value={form.maximumBoxes}
                placeholder="Optional"
                onChange={(event) =>
                  updateField("maximumBoxes", event.target.value)
                }
              />
            </div>
          </div>
        </div>

        <div className="preview">
          <div className="preview__cell">
            <span className="preview__ref">
              {form.reference.trim() || "Not specified yet"}
            </span>

            <Axon
              width={form.width}
              length={form.length}
              depth={form.depth}
              span={74}
            />
          </div>
        </div>

        <div className="plate__body plate__body--footer">
          <div className="stack-actions">
            <button type="button" onClick={addCarton} disabled={busy}>
              {busy ? "Adding…" : "Add carton"}
            </button>
          </div>
        </div>
      </Plate>
    </>
  );
}
