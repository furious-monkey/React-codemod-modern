import React from "react";

const m = formatMessage({ id: "app.greeting" }, { name: "Eric" });
const App = () => (
  <div>
    <FormattedMessage id="app.title" values={{ name: "Todo" }} />
  </div>
);
