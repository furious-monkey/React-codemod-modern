const addImportDeclaration = require("./addImportDeclaration");

function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const importDeclaration = root.find(j.ImportDeclaration, {
    source: { value: "react-intl" },
  });
  const hasMultipleSpecifiers =
    importDeclaration.find(j.ImportSpecifier).length > 1;
  const importSpecifier = importDeclaration.find(j.ImportSpecifier, {
    imported: { name: "FormattedMessage" },
  });
  const localName = importSpecifier.length
    ? importSpecifier.get(0).node.local.name
    : undefined;

  if (!localName) {
    return root.toSource();
  }

  if (hasMultipleSpecifiers) {
    importSpecifier.remove();
  } else {
    importDeclaration.remove();
  }

  const fixSource = addImportDeclaration(j, root, "i18n", "t");

  return fixSource(
    root
      .find(j.JSXElement, {
        openingElement: { name: { name: localName } },
      })
      .forEach((path) => {
        const idAttribute = j(path.node.openingElement).find(j.JSXAttribute, {
          name: { name: "id" },
        });
        const valuesAttribute = j(path.node.openingElement).find(
          j.JSXAttribute,
          {
            name: { name: "values" },
          }
        );
        const id = idAttribute.length
          ? idAttribute.get(0).node.value
          : undefined;
        const values = valuesAttribute.length
          ? valuesAttribute.get(0).node.value.expression
          : undefined;
        const expression = j.callExpression(
          j.identifier("t"),
          values ? [id, values] : [id]
        );

        j(path).replaceWith(
          path.parentPath.node.type !== "JSXElement"
            ? expression
            : j.jsxExpressionContainer(expression)
        );
      })
      .toSource()
  );
}

module.exports = transformer;
