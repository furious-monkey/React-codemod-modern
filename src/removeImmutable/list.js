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
      const args = path.node.arguments;
      j(path).replaceWith(args.length ? args[0] : j.arrayExpression([]));
    })
    .toSource();
}

module.exports = transformer;
