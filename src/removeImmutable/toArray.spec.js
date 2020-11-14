const transformer = require("./toArray");
const { testTransformer } = require("../testUtils");

describe("toArray", () => {
  test("Remove toArray calls", () => {
    testTransformer(
      transformer,
      `
        import { List } from "immutable";

        const m = List([]).toArray();
      `,
      `
        import { List } from "immutable";

        const m = List([]);
      `
    );
  });

  test("Ignores files with no toArray", () => {
    testTransformer(
      transformer,
      `
        import { List } from "immutable";

        const m = List([]);
      `,
      `
        import { List } from "immutable";

        const m = List([]);
      `
    );
  });
});
