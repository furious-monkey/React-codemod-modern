function transformer(file, api) {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.CallExpression, {
      callee: { property: { name: "get" } },
      arguments: { 0: { type: "Literal" } },
    })
    .forEach((path) => {
      const hasFallback = path.node.arguments.length > 1;
      const expression = j.memberExpression(
        path.node.callee.object,
        j.identifier(path.node.arguments[0].value)
      );

      j(path).replaceWith(
        hasFallback
          ? j.logicalExpression("??", expression, path.node.arguments[1])
          : expression
      );
    })
    .toSource();
}

module.exports = transformer;
