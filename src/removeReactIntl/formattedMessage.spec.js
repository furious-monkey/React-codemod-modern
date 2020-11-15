const transformer = require("./formattedMessage");
const { testTransformer } = require("../testUtils");

describe("FormattedMessage", () => {
  test("Remove component usage", () => {
    testTransformer(
      transformer,
      `
        import React from 'react';
        import { FormattedMessage } from "react-intl";

        const m = <FormattedMessage id="app.greeting" />;
      `,
      `
        import React from 'react';
        import { t } from "i18n";

        const m = t("app.greeting");
      `
    );
  });

  test("Handles if component is rendered inside JSX", () => {
    testTransformer(
      transformer,
      `
        import React from 'react';
        import { FormattedMessage } from "react-intl";

        const App = () => <div><FormattedMessage id="app.greeting" /></div>;
    `,
      `
        import React from 'react';
        import { t } from "i18n";

        const App = () => <div>{t("app.greeting")}</div>;
    `
    );
  });

  test("Ignores files with no FormattedMessage", () => {
    testTransformer(
      transformer,
      `
        import React from 'react';
        import { a } from "react-intl";

        const m = '1';
    `,
      `
        import React from 'react';
        import { a } from "react-intl";

        const m = '1';
    `
    );
  });
});
