function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const importDeclaration = root.find(j.ImportDeclaration, {
    source: { value: "immutable" },
  });
  const importSpecifier = importDeclaration.find(j.ImportSpecifier, {
    imported: { name: "List" },
  });
  const localName = importSpecifier.length
    ? importSpecifier.get(0).node.local.name
    : undefined;

  return root
    .find(j.CallExpression, {
      callee: {
        type: "MemberExpression",
        object: {
          type: "Identifier",
          name: localName,
        },
        property: { type: "Identifier", name: "of" },
      },
    })
    .forEach((path) => {
      j(path).replaceWith(j.arrayExpression(path.node.arguments));
    })
    .toSource();
}

transformer.displayName = "List.of";

module.exports = transformer;
