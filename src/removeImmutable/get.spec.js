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

  test("Supports string fallback value", () => {
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

  test("Supports null fallback value", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: true }).get('a', null);
      `,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: true }).a ?? null;
      `
    );
  });

  test("Supports fallback value inside logical expressions", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: true }).get('a', null) > 0;
      `,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: true }).a ?? null > 0;
      `
    );
  });

  test("Supports arrays", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS(['a']).get(0);
      `,
      `
        import { fromJS } from "immutable";

        const m = fromJS(['a'])[0];
      `
    );
  });

  test("Supports arrays with sring keys", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS(['a']).get('0');
      `,
      `
        import { fromJS } from "immutable";

        const m = fromJS(['a'])[0];
      `
    );
  });

  test("Supports dynamic keys", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const key = 'a';
        const m = fromJS(['a']).get(key);
      `,
      `
        import { fromJS } from "immutable";

        const key = 'a';
        const m = fromJS(['a'])[key];
      `
    );
  });

  test("Ignores files with no get", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: true }).a;
      `,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: true }).a;
      `
    );
  });
});
