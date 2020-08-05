function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const importDeclaration = root.find(j.ImportDeclaration, {
    source: { value: "immutable" },
  });
  const localName = importDeclaration
    .find(j.ImportSpecifier, { imported: { name: "List" } })
    .get(0).node.local.name;

  return j(file.source)
    .find(j.CallExpression, {
      callee: { name: localName },
    })
    .forEach((path) => {
      j(path).replaceWith(path.node.arguments[0]);
    })
    .toSource();
}

module.exports = transformer;
