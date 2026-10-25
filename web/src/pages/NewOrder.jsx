
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

// Accept string, number, null, or missing Box Group values.
// Normalize to string for compatibility with the existing form and API.
const normalizeBoxGroup = (value) => {
  if (value == null) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  throw new Error(
    "Box Group must be text, a number, or null."
  );
};

export function NewOrder() {
  const [reference, setReference] = useState("");
  const [items, setItems] = useState([blankItem()]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [mode, setMode] = useState("manual");
  const [jsonFileName, setJsonFileName] = useState("");

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

  const switchToJson = () => {
    setMode("json");
    setError("");
  };

  const importJson = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setJsonFileName("");

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const text = String(reader.result ?? "").trim();

        if (!text) {
          throw new Error("The selected JSON file is empty.");
        }

        let data;

        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(
            "Invalid JSON syntax. Please check the file and try again."
          );
        }

        if (
          !data ||
          typeof data !== "object" ||
          Array.isArray(data) ||
          !Array.isArray(data.items) ||
          data.items.length === 0
        ) {
          throw new Error(
            'The JSON file must contain a non-empty "items" array.'
          );
        }

        const requiredFields = [
          "itemCode",
          "itemReference",
          "width",
          "depth",
          "length",
          "weight",
        ];

        const importedItems = data.items.map((item, index) => {
          const itemNumber = index + 1;

          if (
            !item ||
            typeof item !== "object" ||
            Array.isArray(item)
          ) {
            throw new Error(
              `Item ${itemNumber} must be a JSON object.`
            );
          }

          const missingFields = requiredFields.filter(
            (field) =>
              item[field] === undefined ||
              item[field] === null ||
              String(item[field]).trim() === ""
          );

          if (missingFields.length > 0) {
            throw new Error(
              `Item ${itemNumber} is missing required fields: ${missingFields.join(", ")}.`
            );
          }

          if (
            typeof item.itemCode !== "string" ||
            !item.itemCode.trim() ||
            typeof item.itemReference !== "string" ||
            !item.itemReference.trim()
          ) {
            throw new Error(
              `Item ${itemNumber} must have a valid itemCode and itemReference.`
            );
          }

          for (const field of [
            "width",
            "depth",
            "length",
            "weight",
          ]) {
            const value = item[field];

            if (
              typeof value !== "number" ||
              !Number.isFinite(value) ||
              (field === "weight" ? value < 0 : value <= 0)
            ) {
              throw new Error(
                `Item ${itemNumber} has an invalid ${field}. ${
                  field === "weight"
                    ? "Weight must be zero or greater."
                    : "Dimensions must be greater than zero."
                }`
              );
            }
          }

          const quantity = item.quantity ?? 1;

          if (
            !Number.isInteger(quantity) ||
            quantity < 1
          ) {
            throw new Error(
              `Item ${itemNumber} must have a positive integer quantity.`
            );
          }

          let boxGroup;

          try {
            boxGroup = normalizeBoxGroup(item.boxGroup);
          } catch {
            throw new Error(
              `Item ${itemNumber} has an invalid boxGroup. Box Group must be text, a number, or null.`
            );
          }

          return {
            itemCode: item.itemCode.trim(),
            itemReference: item.itemReference.trim(),
            width: item.width,
            length: item.length,
            depth: item.depth,
            weight: item.weight,
            quantity,
            boxGroup,
          };
        });

        setItems(importedItems);
        setJsonFileName(file.name);
      } catch (err) {
        setError(
          err.message || "The JSON file could not be imported."
        );
      }
    };

    reader.onerror = () => {
      setError("The JSON file could not be read.");
    };

    reader.readAsText(file);

    // Allow re-importing the same file after editing it.
    event.target.value = "";
  };

  const save = async (thenPack) => {
    setError("");

    let cleaned;

    try {
      cleaned = items
        .filter((item) => item.itemCode.trim())
        .map((item) => ({
          itemCode: item.itemCode.trim(),
          itemReference: item.itemReference.trim(),
          width: Number(item.width),
          length: Number(item.length),
          depth: Number(item.depth),
          weight: Number(item.weight),
          quantity: Number(item.quantity) || 1,
          boxGroup: normalizeBoxGroup(item.boxGroup),
        }));
    } catch (err) {
      setError(err.message);
      return;
    }

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
   * Rows that carry all three dimensions can be drawn.
   * The preview is read-only.
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
      {error && (
        <div className="notice notice--error">
          {error}
        </div>
      )}

      <Plate>
        <TitleBlock
          name="New order"
          fields={[
            {
              label: "Reference",
              value: reference.trim() || "Not set",
            },
            {
              label: "Item rows",
              value: items.length,
            },
            {
              label: "Units",
              value: totalUnits,
            },
          ]}
        />

        <div className="tabs">
          <button
            type="button"
            className={`tab ${
              mode === "manual" ? "tab--active" : ""
            }`.trim()}
            onClick={switchToManual}
          >
            Manual entry
          </button>

          <button
            type="button"
            className={`tab ${
              mode === "json" ? "tab--active" : ""
            }`.trim()}
            onClick={switchToJson}
          >
            JSON import
          </button>
        </div>

        {mode === "json" && (
          <div className="plate__body">
            <div className="csv-upload">
              <input
                id="json-file"
                type="file"
                accept=".json,application/json"
                onChange={importJson}
                aria-label="Import order items from JSON"
              />

              {jsonFileName && (
                <span className="csv-file-selected">
                  Loaded {jsonFileName}
                </span>
              )}
            </div>

            <p className="csv-format-note">
              Upload a JSON file containing an "items" array
              with item details, dimensions, weight, quantity,
              and box group.
            </p>
          </div>
        )}

        <div className="plate__body">
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
              onChange={(event) =>
                setReference(event.target.value)
              }
            />
          </div>
        </div>
      </Plate>

      {/* ITEM SPECIFICATION */}

      <Plate>
        <SectionHead
          title={
            mode === "json" ? "Imported items" : "Items"
          }
          note={
            mode === "json"
              ? "Every imported value can still be edited"
              : "Dimensions in mm · weight in kg"
          }
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
                        onChange={(event) =>
                          updateItem(
                            index,
                            key,
                            event.target.value
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
                      onChange={(event) =>
                        updateItem(
                          index,
                          "quantity",
                          event.target.value
                        )
                      }
                      aria-label={`Item ${
                        index + 1
                      } quantity`}
                    />
                  </td>

                  <td>
                    <input
                      type="text"
                      value={item.boxGroup}
                      placeholder="GROUP-A or 1"
                      onChange={(event) =>
                        updateItem(
                          index,
                          "boxGroup",
                          event.target.value
                        )
                      }
                      aria-label={`Item ${
                        index + 1
                      } box group`}
                    />
                  </td>

                  <td className="text-right">
                    <button
                      type="button"
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

        {shown.length > 0 && (
          <div className="preview">
            {shown.map((item, index) => (
              <div
                className="preview__cell"
                key={index}
              >
                <span className="preview__ref">
                  {item.itemCode ||
                    item.itemReference ||
                    `Row ${index + 1}`}
                </span>

                <Axon
                  width={item.width}
                  length={item.length}
                  depth={item.depth}
                  title={`${
                    item.itemCode ||
                    `Row ${index + 1}`
                  }: width ${
                    item.width
                  }, depth ${
                    item.depth
                  }, length ${
                    item.length
                  } millimetres`}
                />
              </div>
            ))}

            {drawable.length > shown.length && (
              <div className="preview__cell">
                <span className="preview__ref">
                  {drawable.length -
                    shown.length} more specified
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
              <button
                type="button"
                onClick={() => save(true)}
                disabled={busy}
              >
                {busy
                  ? "Packing…"
                  : "Save and pack"}
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
