const transformer = require("./formattedMessage");
const { testTransformer } = require("../testUtils");

describe("FormattedMessage", () => {
  test("Remove component usage", () => {
    testTransformer(
      transformer,
      `
        import { FormattedMessage } from "react-intl";

        const m = <FormattedMessage id="app.greeting" />
      `,
      `
        import { t } from "i18n";

        const m = t("app.greeting")
      `
    );
  });

  test("Handles if component is rendered inside JSX", () => {
    testTransformer(
      transformer,
      `
      import { FormattedMessage } from "react-intl";

      const App = () => <div><FormattedMessage id="app.greeting" /></div>;
    `,
      `
      import { t } from "i18n";

      const App = () => <div>{t("app.greeting")}</div>;
    `
    );
  });
});
