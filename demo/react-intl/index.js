import React from "react";
import { FormattedMessage } from "react-intl";

const m = formatMessage({ id: "app.greeting" }, { name: "Eric" });
const App = () => (
  <div>
    <FormattedMessage id="app.title" values={{ name: "Todo" }} />
  </div>
);
