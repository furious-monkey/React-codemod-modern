const transformer = require("./toJS");
const { testTransformer } = require("../testUtils");

describe("toJS", () => {
  test("Remove toJS calls", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: true }).toJS();
      `,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: true });
      `
    );
  });

  test("Ignores files with no toJS", () => {
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
