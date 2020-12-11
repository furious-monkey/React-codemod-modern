const transformer = require("./listOf");
const { testTransformer } = require("../testUtils");

describe("fromJS", () => {
  test("Remove List.of calls", () => {
    testTransformer(
      transformer,
      `
        import { List } from "immutable";

        const a = List.of(1, 2, 3);
      `,
      `
        import { List } from "immutable";

        const a = [1, 2, 3];
      `
    );
  });

  test("Ignores files with no List.of calls", () => {
    testTransformer(
      transformer,
      `
        import { List } from "immutable";

        const a = List([1, 2, 3]);
      `,
      `
        import { List } from "immutable";

        const a = List([1, 2, 3]);
      `
    );
  });
});
