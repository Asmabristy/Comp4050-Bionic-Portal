import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import { isSupervisor } from "../roles.js";
import { Icon } from "../components/Icon.jsx";
import {
  Plate,
  TitleBlock,
  SectionHead,
} from "../components/Plate.jsx";
import { Axon } from "../components/Axon.jsx";

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

  const [mode, setMode] = useState("manual");
  const [csvFileName, setCsvFileName] = useState("");

  const navigate = useNavigate();
  const { user } = useAuth();

  const canRunSolver = isSupervisor(user);

  const updateItem = (index, key, value) => {
    const next = [...items];

    next[index] = {
      ...next[index],
      [key]: value,
    };

    setItems(next);
  };

  const addItem = () => {
    setItems([...items, blankItem()]);
  };

  const removeItem = (index) => {
    setItems(
      items.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const switchToManual = () => {
    setMode("manual");
    setError("");
  };

  const switchToCsv = () => {
    setMode("csv");
    setError("");
  };

  const importCsv = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setCsvFileName(file.name);

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const text = String(reader.result || "").trim();

        if (!text) {
          setError("The selected CSV file is empty.");
          return;
        }

        const lines = text
          .split(/\r?\n/)
          .filter((line) => line.trim());

        if (lines.length < 2) {
          setError(
            "The CSV needs a header row and at least one item."
          );
          return;
        }

        const headers = lines[0]
          .split(",")
          .map((header) => header.trim());

        const requiredHeaders = [
          "itemCode",
          "itemReference",
          "width",
          "length",
          "depth",
          "weight",
        ];

        const missingHeaders = requiredHeaders.filter(
          (header) => !headers.includes(header)
        );

        if (missingHeaders.length > 0) {
          setError(
            `Missing CSV columns: ${missingHeaders.join(", ")}`
          );
          return;
        }

        const importedItems = lines
          .slice(1)
          .map((line) => {
            const values = line
              .split(",")
              .map((value) => value.trim());

            const row = {};

            headers.forEach((header, index) => {
              row[header] = values[index] ?? "";
            });

            return {
              itemCode: row.itemCode ?? "",
              itemReference: row.itemReference ?? "",
              width: row.width ?? "",
              length: row.length ?? "",
              depth: row.depth ?? "",
              weight: row.weight ?? "",
              quantity: row.quantity || 1,
              boxGroup: row.boxGroup ?? "",
            };
          })
          .filter((item) => item.itemCode);

        if (importedItems.length === 0) {
          setError(
            "No valid item rows were found in the CSV."
          );
          return;
        }

        setItems(importedItems);
      } catch {
        setError("The CSV file could not be imported.");
      }
    };

    reader.readAsText(file);
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
      setError("Give the order a reference.");
      return;
    }

    if (cleaned.length === 0) {
      setError("Add at least one item.");
      return;
    }

    const missingReference = cleaned.find(
      (item) => !item.itemReference
    );

    if (missingReference) {
      setError(
        `${missingReference.itemCode} needs an item reference.`
      );
      return;
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
      setError(
        `${badDimensions.itemCode} needs width, length, and depth above zero.`
      );
      return;
    }

    const badWeight = cleaned.find(
      (item) =>
        !Number.isFinite(item.weight) ||
        item.weight < 0
    );

    if (badWeight) {
      setError(
        `${badWeight.itemCode} needs a valid weight.`
      );
      return;
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

  /*
   * Rows that carry all three dimensions can be drawn. The preview is read
   * only -- it exists so the operator sees which axis each figure is going
   * into before the order is saved.
   */
  const drawable = items.filter(
    (item) =>
      Number(item.width) > 0 &&
      Number(item.length) > 0 &&
      Number(item.depth) > 0
  );

  const shown = drawable.slice(0, 8);

  const totalUnits = items.reduce(
    (total, item) => total + (Number(item.quantity) || 1),
    0
  );

  return (
    <>
      {error && <div className="notice notice--error">{error}</div>}

      <Plate>
        <TitleBlock
          name="New order"
          fields={[
            { label: "Reference", value: reference.trim() || "Not set" },
            { label: "Item rows", value: items.length },
            { label: "Units", value: totalUnits },
          ]}
        />

        <div className="tabs">
          <button
            type="button"
            className={`tab ${mode === "manual" ? "tab--active" : ""}`.trim()}
            onClick={switchToManual}
          >
            Manual entry
          </button>

          <button
            type="button"
            className={`tab ${mode === "csv" ? "tab--active" : ""}`.trim()}
            onClick={switchToCsv}
          >
            CSV import
          </button>
        </div>

        {mode === "csv" && (
          <div className="plate__body">
            <div className="csv-upload">
              <input
                id="csv-file"
                type="file"
                accept=".csv,text/csv"
                onChange={importCsv}
              />

              {csvFileName && (
                <span className="csv-file-selected">
                  Loaded {csvFileName}
                </span>
              )}
            </div>

            <p className="csv-format-note">
              <span>Required columns </span>
              <code>
                itemCode, itemReference, width, length, depth, weight,
                quantity, boxGroup
              </code>
            </p>
          </div>
        )}

        <div className="plate__body">
          <div className="field" style={{ maxWidth: 340 }}>
            <label htmlFor="reference">Order reference</label>

            <input
              id="reference"
              value={reference}
              placeholder="PO-40128"
              onChange={(event) => setReference(event.target.value)}
            />
          </div>
        </div>
      </Plate>

      {/* ===================================================
          ITEM SPECIFICATION
          =================================================== */}

      <Plate>
        <SectionHead
          title={mode === "csv" ? "Imported items" : "Items"}
          note={
            mode === "csv"
              ? "Every imported value can still be edited"
              : "Dimensions in mm · weight in kg"
          }
          actions={
            <span className="axon__legend">W across · L back · D up</span>
          }
        />

        <div className="register">
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
                      placeholder={`ITM-${String(index + 1).padStart(
                        3,
                        "0"
                      )}`}
                      onChange={(event) =>
                        updateItem(index, "itemCode", event.target.value)
                      }
                      aria-label={`Item ${index + 1} code`}
                    />
                  </td>

                  <td>
                    <input
                      value={item.itemReference}
                      placeholder="Widget A"
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

                  {["width", "length", "depth", "weight"].map((key) => (
                    <td key={key}>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item[key]}
                        onChange={(event) =>
                          updateItem(index, key, event.target.value)
                        }
                        aria-label={`Item ${index + 1} ${key}`}
                      />
                    </td>
                  ))}

                  <td>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantity}
                      onChange={(event) =>
                        updateItem(index, "quantity", event.target.value)
                      }
                      aria-label={`Item ${index + 1} quantity`}
                    />
                  </td>

                  <td>
                    <input
                      value={item.boxGroup}
                      placeholder="GROUP-A"
                      onChange={(event) =>
                        updateItem(index, "boxGroup", event.target.value)
                      }
                      aria-label={`Item ${index + 1} box group`}
                    />
                  </td>

                  <td className="text-right">
                    <button
                      type="button"
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
        </div>

        {shown.length > 0 && (
          <div className="preview">
            {shown.map((item, index) => (
              <div className="preview__cell" key={index}>
                <span className="preview__ref">
                  {item.itemCode || item.itemReference || `Row ${index + 1}`}
                </span>

                <Axon
                  width={item.width}
                  length={item.length}
                  depth={item.depth}
                  title={`${
                    item.itemCode || `Row ${index + 1}`
                  }: width ${item.width}, length ${item.length}, depth ${
                    item.depth
                  } millimetres`}
                />
              </div>
            ))}

            {drawable.length > shown.length && (
              <div className="preview__cell">
                <span className="preview__ref">
                  {drawable.length - shown.length} more specified
                </span>
              </div>
            )}
          </div>
        )}

        <div className="plate__body">
          <div className="stack-actions">
            <button
              type="button"
              className="btn-ghost btn-small"
              onClick={addItem}
            >
              <Icon name="plus" size={13} />
              Add item row
            </button>
          </div>
        </div>

        <div className="plate__body plate__body--footer">
          <div className="stack-actions">
            {canRunSolver && (
              <button type="button" onClick={() => save(true)} disabled={busy}>
                {busy ? "Packing…" : "Save and pack"}
              </button>
            )}

            <button
              type="button"
              className="btn-ghost"
              onClick={() => save(false)}
              disabled={busy}
            >
              Save as draft
            </button>
          </div>
        </div>
      </Plate>
    </>
  );
}
