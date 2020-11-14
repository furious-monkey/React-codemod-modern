const transformer = require("./map");
const { testTransformer } = require("../testUtils");

describe("map", () => {
  test("Remove Map calls", () => {
    testTransformer(
      transformer,
      `
        import { Map, List } from "immutable";

        const m = Map({ a: true });
      `,
      `
        import { List } from "immutable";

        const m = { a: true };
      `
    );
  });

  test("Map is replaced with empty object if called wihout paremeters", () => {
    testTransformer(
      transformer,
      `
        import { Map, List } from "immutable";

        const m = Map();
      `,
      `
        import { List } from "immutable";

        const m = {};
      `
    );
  });

  test("Removes import completly if nothing else is imported", () => {
    testTransformer(
      transformer,
      `
        import { Map } from "immutable";

        const m = Map({ a: true });
      `,
      `
        const m = { a: true };
      `
    );
  });

  test("Ignores files with no Map", () => {
    testTransformer(
      transformer,
      `
        const m = { a: true };
      `,
      `
        const m = { a: true };
      `
    );
  });
});
