const transformer = require("./refactorImports");
const { testTransformer } = require("../testUtils");

describe("refactorImports", () => {
  test("Changes import for matching exports", () => {
    testTransformer(
      transformer,
      `
        import { a, b, c, d } from "import1";
      `,
      `
        import { c, d } from "import1";
        import { a, b } from "import2";
      `
    );
  });

  test("Removes import if it's empty", () => {
    testTransformer(
      transformer,
      `
        import { a, b } from "import1";
      `,
      `
        import { a, b } from "import2";
      `
    );
  });

  test("Keeps not matching exports intact", () => {
    testTransformer(
      transformer,
      `
        import { c, d } from "import1";
      `,
      `
        import { c, d } from "import1";
      `
    );
  });

  test("Keeps not matching files intact", () => {
    testTransformer(
      transformer,
      `
        import { a, b } from "import3";
      `,
      `
        import { a, b } from "import3";
      `
    );
  });
});
