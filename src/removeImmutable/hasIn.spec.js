const transformer = require("./hasIn");
const { testTransformer } = require("../testUtils");

describe("hasIn", () => {
  test("Remove hasIn calls", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: { b: true } }).hasIn(['a', 'b']);
      `,
      `
        import { fromJS } from "immutable";

        const m = !!fromJS({ a: { b: true } }).a?.b;
      `
    );
  });

  test("Doesn`t tranform hasIn in chains", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: { b: true } }).hasIn(['a', 'b']).props();
      `,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: { b: true } }).hasIn(['a', 'b']).props();
      `
    );
  });

  test("Handles array length 1", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: { b: true } }).hasIn(['a']);
      `,
      `
        import { fromJS } from "immutable";

        const m = !!fromJS({ a: { b: true } }).a;
      `
    );
  });

  test("Handles array length 3", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: { b: true } }).hasIn(['a', 'b', 'c']);
      `,
      `
        import { fromJS } from "immutable";

        const m = !!fromJS({ a: { b: true } }).a?.b?.c;
      `
    );
  });

  test("Handles arrays", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: { b: true } }).hasIn(['a', 0, 'c']);
      `,
      `
        import { fromJS } from "immutable";

        const m = !!fromJS({ a: { b: true } }).a?.[0]?.c;
      `
    );
  });

  test("Handles arrays with string keys", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: { b: true } }).hasIn(['a', '0', 'c']);
      `,
      `
        import { fromJS } from "immutable";

        const m = !!fromJS({ a: { b: true } }).a?.[0]?.c;
      `
    );
  });

  test("Handles dynamic values", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const key = { name: 'a' };
        const m = fromJS({ a: { b: true } }).hasIn(['a', key.name, 'c']);
      `,
      `
        import { fromJS } from "immutable";

        const key = { name: 'a' };
        const m = !!fromJS({ a: { b: true } }).a?.[key.name]?.c;
      `
    );
  });

  test("Ignores files with no hasIn", () => {
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
