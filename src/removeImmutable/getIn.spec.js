const transformer = require("./getIn");
const { testTransformer } = require("../testUtils");

describe("getIn", () => {
  test("Remove getIn calls", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: { b: true } }).getIn(['a', 'b']);
      `,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: { b: true } })?.a.b;
      `
    );
  });

  test("Provides fallback value", () => {
    testTransformer(
      transformer,
      `
      import { fromJS } from "immutable";

      const m = fromJS({ a: { b: true } }).getIn(['a', 'b'], 'fallback');
      `,
      `
      import { fromJS } from "immutable";

      const m = fromJS({ a: { b: true } })?.a.b ?? 'fallback';
      `
    );
  });

  test("Hnadles array length 1", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: { b: true } }).getIn(['a']);
      `,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: { b: true } }).a;
      `
    );
  });

  test("Hnadles array length 3", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: { b: true } }).getIn(['a', 'b', 'c']);
      `,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: { b: true } })?.a?.b.c;
      `
    );
  });
});
