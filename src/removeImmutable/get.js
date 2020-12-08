function getExpression(j, path) {
  const value = path.node.arguments[0].value;

  if (typeof value === "string") {
    return j.memberExpression(
      path.node.callee.object,
      j.identifier(path.node.arguments[0].value)
    );
  }

  if (typeof value === "number") {
    return j.memberExpression(
      path.node.callee.object,
      j.numericLiteral(path.node.arguments[0].value),
      true
    );
  }

  throw new Error(`Cannot transform "get" on line ${path.node.loc.start.line}`);
}

function transformer(file, api) {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.CallExpression, {
      callee: { property: { name: "get" } },
      arguments: { 0: { type: "Literal" } },
    })
    .forEach((path) => {
      const hasFallback = path.node.arguments.length > 1;

      const expression = getExpression(j, path);

      j(path).replaceWith(
        hasFallback
          ? j.logicalExpression("??", expression, path.node.arguments[1])
          : expression
      );
    })
    .toSource();
}

module.exports = transformer;
