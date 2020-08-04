function transformer(file, api) {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.CallExpression, {
      callee: { name: "fromJs" },
      arguments: { "0": { type: "ObjectExpression" } },
    })
    .forEach((path) => {
      j(path).replaceWith(path.node.arguments[0]);
    })
    .toSource();
}

module.exports = transformer;
