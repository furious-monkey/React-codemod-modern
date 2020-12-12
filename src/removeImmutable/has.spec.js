const transformer = require("./has");
const { testTransformer } = require("../testUtils");

describe("has", () => {
  test("Remove has calls", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: true }).has('a');
      `,
      `
        import { fromJS } from "immutable";

        const m = !!fromJS({ a: true }).a;
      `
    );
  });

  test("Doesn`t tranform has in chains", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: true }).has('a').props();
      `,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: true }).has('a').props();
      `
    );
  });

  test("Supports arrays", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS(['a']).has(0);
      `,
      `
        import { fromJS } from "immutable";

        const m = !!fromJS(['a'])[0];
      `
    );
  });

  test("Supports arrays with sring keys", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS(['a']).has('0');
      `,
      `
        import { fromJS } from "immutable";

        const m = !!fromJS(['a'])[0];
      `
    );
  });

  test("Supports dynamic keys", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const key = { name: 'a' }
        const m = fromJS(['a']).has(key.name);
      `,
      `
        import { fromJS } from "immutable";

        const key = { name: 'a' }
        const m = !!fromJS(['a'])[key.name];
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
