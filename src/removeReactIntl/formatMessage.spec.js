const transformer = require("./formatMessage");
const { testTransformer } = require("../testUtils");

describe("formatMessage", () => {
  test("Removes formatMessage", () => {
    testTransformer(
      transformer,
      `
        import React from "react";

        const m = formatMessage({ id: 'app.greeting' });
      `,
      `
        import React from "react";
        import { t } from "i18n";

        const m = t('app.greeting');
      `
    );
  });

  test("Removes formatMessage with second parameter", () => {
    testTransformer(
      transformer,
      `
        import React from "react";

        const m = formatMessage({ id: 'app.greeting' }, { name: 'Eric' });
      `,
      `
        import React from "react";
        import { t } from "i18n";

        const m = t('app.greeting', { name: 'Eric' });
      `
    );
  });

  test("Ignores files with no formatMessage", () => {
    testTransformer(
      transformer,
      `
        import React from 'react';

        const m = '1';
    `,
      `
        import React from 'react';

        const m = '1';
    `
    );
  });
});
