const transformer = require("./get");
const { testTransformer } = require("../testUtils");

describe("get", () => {
  test("Remove get calls", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: true }).get('a');
      `,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: true }).a;
      `
    );
  });

  test("Provides fallback value", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: true }).get('a', 'fallback');
      `,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: true }).a ?? 'fallback';
      `
    );
  });
});
