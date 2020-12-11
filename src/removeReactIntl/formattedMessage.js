const addImportDeclaration = require("./addImportDeclaration");

function getId(j, jsxElement) {
  const idAttribute = j(jsxElement.node.openingElement).find(j.JSXAttribute, {
    name: { name: "id" },
  });
  const id = idAttribute.length ? idAttribute.get(0).node.value : undefined;

  if (id.type === "StringLiteral") {
    return j.literal(id.value);
  }

  if (id.type === "JSXExpressionContainer") {
    return id.expression;
  }

  return id;
}

function getValues(j, jsxElement) {
  const valuesAttribute = j(jsxElement.node.openingElement).find(
    j.JSXAttribute,
    {
      name: { name: "values" },
    }
  );
  const values = valuesAttribute.length
    ? valuesAttribute.get(0).node.value.expression
    : undefined;
  return values;
}

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

  const elements = root.find(j.JSXElement, {
    openingElement: { name: { name: localName } },
  });

  if (!localName || !elements.length) {
    return root.toSource();
  }

  if (hasMultipleSpecifiers) {
    importSpecifier.remove();
  } else {
    importDeclaration.remove();
  }

  const fixSource = addImportDeclaration(j, root, "i18n", "t");

  return fixSource(
    elements
      .forEach((path) => {
        const id = getId(j, path);
        const values = getValues(j, path);
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
      .toSource({ quote: "single" })
  );
}

module.exports = transformer;
