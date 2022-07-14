const { testTransformer } = require("../testUtils");
const addImportDeclaration = require("./addImportDeclaration");

function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  const fixSource = addImportDeclaration(j, root, "i18n", ["t"]);

  return fixSource(root.toSource({ quote: "single" }));
}

describe("addImportDeclaration", () => {
  test("adds import", () => {
    testTransformer(
      transformer,
      `
        import React from 'react';

        console.log('test');
      `,
      `
        import React from 'react';
        import { t } from 'i18n';

        console.log('test');
      `
    );
  });

  test("Doesn`t add import if it already exists", () => {
    testTransformer(
      transformer,
      `
        import React from 'react';
        import { t } from 'i18n';

        console.log('test');
    `,
      `
        import React from 'react';
        import { t } from 'i18n';

        console.log('test');
    `
    );
  });

  test("Adds import before style import", () => {
    testTransformer(
      transformer,
      `
        import React from 'react';

        import style from './a.css';

        console.log('test');
    `,
      `
        import React from 'react';
        import { t } from 'i18n';

        import style from './a.css';

        console.log('test');
    `
    );
  });
});
