const transformer = require("./list");
const { testTransformer } = require("../testUtils");

describe("list", () => {
  test("Remove List calls", () => {
    testTransformer(
      transformer,
      `
        import { List, Map } from "immutable";

        const m = List([]);
      `,
      `
        import { Map } from "immutable";

        const m = [];
      `
    );
  });

  test("List is replaced with empty array if called wihout paremeters", () => {
    testTransformer(
      transformer,
      `
        import { List, Map } from "immutable";

        const m = List();
      `,
      `
        import { Map } from "immutable";

        const m = [];
      `
    );
  });

  test("Removes import completly if nothing else is imported", () => {
    testTransformer(
      transformer,
      `
        import { List } from "immutable";

        const m = List([]);
      `,
      `
        const m = [];
      `
    );
  });
});
