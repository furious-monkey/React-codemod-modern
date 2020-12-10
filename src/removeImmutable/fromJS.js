function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const importDeclaration = root.find(j.ImportDeclaration, {
    source: { value: "immutable" },
  });
  const hasMultipleSpecifiers =
    importDeclaration.find(j.ImportSpecifier).length > 1;
  const importSpecifier = importDeclaration.find(j.ImportSpecifier, {
    imported: { name: "fromJS" },
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
    .find(j.CallExpression, {
      callee: { name: localName },
    })
    .forEach((path) => {
      j(path).replaceWith(path.node.arguments[0]);
    })
    .toSource();
}

transformer.displayName = "fromJS";

module.exports = transformer;
