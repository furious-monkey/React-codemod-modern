const transformer = require("./toEqualImmutable");
const { testTransformer } = require("../testUtils");

describe("toEqualImmutable", () => {
  test("Remove toEqualImmutable calls", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        expect(fromJS({ a: true })).toEqualImmutable({ a: true });
      `,
      `
        import { fromJS } from "immutable";

        expect(fromJS({ a: true })).toEqual({ a: true });
      `
    );
  });

  test("Ignores files with no toEqualImmutable", () => {
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
