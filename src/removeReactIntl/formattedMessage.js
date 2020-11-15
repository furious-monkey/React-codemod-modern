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

  if (localName) {
    if (hasMultipleSpecifiers) {
      importSpecifier.remove();
    } else {
      importDeclaration.remove();
    }

    addImportDeclaration(
      j,
      root,
      j.importDeclaration(
        [j.importSpecifier(j.identifier("t"))],
        j.literal("i18n")
      )
    );
  }

  return root
    .find(j.JSXElement, {
      openingElement: { name: { name: localName } },
    })
    .forEach((path) => {
      const idAttribute = j(path.node.openingElement).find(j.JSXAttribute, {
        name: { name: "id" },
      });
      const id = idAttribute.length ? idAttribute.get(0).node.value : undefined;
      const expression = j.callExpression(j.identifier("t"), [id]);

      j(path).replaceWith(
        path.parentPath.node.type !== "JSXElement"
          ? expression
          : j.jsxExpressionContainer(expression)
      );
    })
    .toSource();
}

module.exports = transformer;
