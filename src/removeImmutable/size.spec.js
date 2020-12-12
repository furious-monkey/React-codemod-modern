const transformer = require("./size");
const { testTransformer } = require("../testUtils");

describe("size", () => {
  test("Remove size calls", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: true }).size;
      `,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: true }).length;
      `
    );
  });

  test("Ignores files with no size", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: true });
      `,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: true });
      `
    );
  });
});
