const transformer = require("./list");
const { testTransformer } = require("../testUtils");

describe("list", () => {
  test("Remove List calls", () => {
    testTransformer(
      transformer,
      `
        import { List } from "immutable";

        const m = List([]);
      `,
      `
        import { List } from "immutable";

        const m = [];
      `
    );
  });

  test("List is replaced with empty array if called wihout paremeters", () => {
    testTransformer(
      transformer,
      `
        import { List } from "immutable";

        const m = List();
      `,
      `
        import { List } from "immutable";

        const m = [];
      `
    );
  });
});
