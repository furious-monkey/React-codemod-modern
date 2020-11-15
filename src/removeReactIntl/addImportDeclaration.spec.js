const { testTransformer } = require("../testUtils");
const addImportDeclaration = require("./addImportDeclaration");

function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  addImportDeclaration(
    j,
    root,
    j.importDeclaration(
      [j.importSpecifier(j.identifier("t"))],
      j.literal("i18n")
    )
  );

  return root.toSource();
}

describe("addImportDeclaration", () => {
  test("adds import", () => {
    testTransformer(
      transformer,
      `
        import React from 'react';

        const m = <FormattedMessage id="app.greeting" />;
      `,
      `
        import React from 'react';

        import { t } from "i18n";

        const m = <FormattedMessage id="app.greeting" />;
      `
    );
  });

  test("Doesn`t add import if it already exists", () => {
    testTransformer(
      transformer,
      `
        import React from 'react';
        import { t } from "i18n";
        import { FormattedMessage } from "react-intl";

        const m = <FormattedMessage id="app.greeting" />;
    `,
      `
        import React from 'react';
        import { t } from "i18n";
        import { FormattedMessage } from "react-intl";

        const m = <FormattedMessage id="app.greeting" />;
    `
    );
  });

  test("Adds import before style import", () => {
    testTransformer(
      transformer,
      `
        import React from 'react';
        import { FormattedMessage } from "react-intl";

        import style from './a.css';

        const m = <FormattedMessage id="app.greeting" />;
    `,
      `
        import React from 'react';
        import { FormattedMessage } from "react-intl";

        import { t } from "i18n";

        import style from './a.css';

        const m = <FormattedMessage id="app.greeting" />;
    `
    );
  });
});
