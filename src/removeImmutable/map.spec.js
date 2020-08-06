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
});
