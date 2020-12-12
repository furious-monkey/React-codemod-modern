const transformer = require("./fromJS");
const { testTransformer } = require("../testUtils");

describe("fromJS", () => {
  test("Remove fromJS calls", () => {
    testTransformer(
      transformer,
      `
        import { fromJS, Map } from "immutable";

        const m = fromJS({ a: true });
      `,
      `
        import { Map } from "immutable";

        const m = { a: true };
      `
    );
  });

  test("Removes import completly if nothing else is imported", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS({ a: true });
      `,
      `
        const m = { a: true };
      `
    );
  });

  test("Ignores files with no fromJS", () => {
    testTransformer(
      transformer,
      `
        const m = { a: true };

        export enum Fruit {
          Apple,
          Orange,
          Banana
        }
      `,
      `
        const m = { a: true };

        export enum Fruit {
          Apple,
          Orange,
          Banana
        }
      `
    );
  });
});
