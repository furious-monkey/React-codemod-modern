const transformer = require("./set");
const { testTransformer } = require("../testUtils");

describe("set", () => {
  test("Remove set calls", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: true }).set('a', false);
      `,
      `
        import { fromJS } from "immutable";

        const m = {
                ...fromJS({ a: true }),
                a: false
        };
      `
    );
  });
});
