const transformer = require("./mapMutations");
const { testTransformer } = require("../testUtils");

describe("mapMutations", () => {
  test("Removes set calls", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS({}).set('a', false);
      `,
      `
        import { fromJS } from "immutable";

        const m = {
                ...fromJS({}),
                a: false
        };
      `
    );
  });

  test("Removes chained set calls", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS({}).set('a', false).set('b', true).set('c', 1);
      `,
      `
        import { fromJS } from "immutable";

        const m = {
                ...fromJS({}),
                a: false,
                b: true,
                c: 1
        };
      `
    );
  });
});
