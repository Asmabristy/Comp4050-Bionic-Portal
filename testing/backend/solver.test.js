import { describe, it, expect, vi } from "vitest";
vi.mock("../../server/src/config.js", () => ({ config: { useMockSolver: true } }));
import {
  buildSolverRequest,
  expandItems,
  normaliseSolverResponse,
  requestPacking,
} from "../../server/src/services/solverClient.js";
const item = {
  itemCode: "SKU",
  itemReference: "Widget, large",
  width: 10,
  length: 30,
  depth: 20,
  weight: 1,
  quantity: 2,
  boxGroup: "G",
};
const carton = {
  reference: "BOX",
  width: 40,
  length: 100,
  depth: 50,
  active: true,
};
const order = () => ({ items: [{ ...item }], containers: [{ ...carton }] });
const response = () => ({
  results: [
    {
      boxReference: "BOX",
      placements: [{ x: 1, y: 2, z: 3, item: { ...item, itemCode: "SKU#1" } }],
    },
  ],
  failed: [],
});
describe("Portal / Solver / Visualiser contract", () => {
  it("expands physical units with unique IDs and preserves dimensions and group", () => {
    expect(expandItems([item])).toEqual(
      [1, 2].map((n) => ({
        itemCode: `SKU#${n}`,
        itemReference: item.itemReference,
        width: 10,
        length: 30,
        depth: 20,
        weight: 1,
        boxGroup: "G",
      })),
    );
  });
  it("uses quantity one when omitted", () => {
    expect(expandItems([{ ...item, quantity: undefined }])).toHaveLength(1);
  });
  it("does not send inactive cartons and preserves optional zero limits", () => {
    const input = order();
    input.containers.push({ ...carton, reference: "OFF", active: false });
    input.containers[0].maximumBoxes = 0;
    expect(buildSolverRequest(input).boxes).toEqual([
      { ...carton, maximumBoxes: 0 },
    ]);
  });
  it("preserves XYZ positions and maps width/X, depth/Y, length/Z without rotating", () => {
    const result = normaliseSolverResponse(response(), order());
    expect(result.boxes[0]).toMatchObject({
      dimensions: { width: 40, length: 100, depth: 50 },
      items: [
        {
          itemId: "SKU#1",
          position: { x: 1, y: 2, z: 3 },
          dimensions: { width: 10, length: 30, depth: 20 },
        },
      ],
    });
    expect(result.boxes[0].items[0]).not.toHaveProperty("rotation");
  });
  it("gives repeated packed carton types distinct IDs", () => {
    const r = response();
    r.results.push(r.results[0]);
    expect(
      normaliseSolverResponse(r, order()).boxes.map((b) => b.boxId),
    ).toEqual(["BOX", "BOX-2"]);
  });
  it("normalises string, flat and nested failed item IDs", () => {
    const r = response();
    r.failed = ["A", { itemCode: "B" }, { item: { itemReference: "C" } }];
    expect(normaliseSolverResponse(r, order()).unpacked).toEqual([
      "A",
      "B",
      "C",
    ]);
  });
  it.each([
    null,
    {},
    { results: [], failed: null },
    { results: null, failed: [] },
  ])("rejects malformed Solver envelope %#", (value) => {
    expect(() => normaliseSolverResponse(value, order())).toThrow();
  });
  it("rejects non-finite placements", () => {
    const r = response();
    r.results[0].placements[0].x = NaN;
    expect(() => normaliseSolverResponse(r, order())).toThrow(/placement data/);
  });
  it("rejects zero dimensions", () => {
    const r = response();
    r.results[0].placements[0].item.width = 0;
    expect(() => normaliseSolverResponse(r, order())).toThrow(/dimensions/);
  });
});
