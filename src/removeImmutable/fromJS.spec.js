const transformer = require("./fromJS");
const { testTransformer } = require("../testUtils");

describe("fromJS", () => {
  test("Remove fromJS calls", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";
        const m = fromJS({ a: true });
      `,
      `
        import { fromJS } from "immutable";
        const m = { a: true };
      `
    );
  });
});
