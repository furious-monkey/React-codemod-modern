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
      console.log(id);
      j(path).replaceWith(j.callExpression(j.identifier("t"), [id]));
    })
    .toSource();
}

module.exports = transformer;
