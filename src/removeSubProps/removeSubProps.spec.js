const transformer = require("./removeSubProps");
const { testTransformer } = require("../testUtils");

describe("removeSubProps", () => {
  test("Remove from simple expressions", () => {
    testTransformer(
      transformer,
      `
        import { Button } from "lib";

        const m = Button.size.SMALL;
      `,
      `
        import { Button } from "lib";

        const m = "Button.size.SMALL";
      `
    );
  });

  test("Supports import renaming", () => {
    testTransformer(
      transformer,
      `
        import { Button as Button2 } from "lib";

        const m = Button2.size.SMALL;
      `,
      `
        import { Button as Button2 } from "lib";

        const m = "Button.size.SMALL";
      `
    );
  });

  test("Supports 2 nestinging", () => {
    testTransformer(
      transformer,
      `
        import { Button } from "lib";

        const m = Button.size;
      `,
      `
        import { Button } from "lib";

        const m = "Button.size";
      `
    );
  });

  test("Supports 4 nestinging", () => {
    testTransformer(
      transformer,
      `
        import { Button } from "lib";

        const m = Button.size.xl.BIG;
      `,
      `
        import { Button } from "lib";

        const m = "Button.size.xl.BIG";
      `
    );
  });

  test("Remove from JSX", () => {
    testTransformer(
      transformer,
      `
        import { Button } from "lib";

        return <Button size={Button.size.SMALL} />;
      `,
      `
        import { Button } from "lib";

        return <Button size="Button.size.SMALL" />;
      `
    );
  });
});
