const addImportDeclaration = require("./addImportDeclaration");

function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const calls = root.find(j.CallExpression, {
    callee: { name: "formatMessage" },
    arguments: {
      0: {
        type: "ObjectExpression",
        properties: { 0: { key: { name: "id" } } },
      },
    },
  });

  if (!calls.length) {
    return root.toSource();
  }

  const fixSource = addImportDeclaration(j, root, "i18n", "t");

  return fixSource(
    calls
      .forEach((path) => {
        const id = path.node.arguments[0].properties[0].value;
        const values = path.node.arguments[1];
        const expression = j.callExpression(
          j.identifier("t"),
          values ? [id, values] : [id]
        );

        j(path).replaceWith(expression);
      })
      .toSource()
  );
}

module.exports = transformer;
