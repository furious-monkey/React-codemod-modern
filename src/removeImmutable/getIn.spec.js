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

  test("Handles array length 1", () => {
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

  test("Handles array length 3", () => {
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

  test("Handles arrays", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: { b: true } }).getIn(['a', 0, 'c']);
      `,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: { b: true } })?.a?.[0].c;
      `
    );
  });

  test("Ignores files with no getIn", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: { b: true } }).a;
      `,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: { b: true } }).a;
      `
    );
  });
});
