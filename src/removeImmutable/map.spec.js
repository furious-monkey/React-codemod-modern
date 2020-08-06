const transformer = require("./map");
const { testTransformer } = require("../testUtils");

describe("map", () => {
  test("Remove Map calls", () => {
    testTransformer(
      transformer,
      `
        import { Map } from "immutable";

        const m = Map({ a: true });
      `,
      `
        import { Map } from "immutable";

        const m = { a: true };
      `
    );
  });

  test("Map is replaced with empty object if called wihout paremeters", () => {
    testTransformer(
      transformer,
      `
        import { Map } from "immutable";

        const m = Map();
      `,
      `
        import { Map } from "immutable";

        const m = {};
      `
    );
  });
});
