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
