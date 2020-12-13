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

  test("Doesn`t tranform size in chains", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: true }).size.props();
      `,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: true }).size.props();
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
