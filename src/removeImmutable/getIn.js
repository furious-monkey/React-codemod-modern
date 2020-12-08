function getIn(j, object, key, fallback) {
  const value = key[0].value;
  const computed = typeof value === "number";
  const firstIdentifier = computed
    ? j.numericLiteral(value)
    : j.identifier(value);

  if (key.length > 1) {
    return getIn(
      j,
      j.optionalMemberExpression(object, firstIdentifier, computed),
      key.slice(1),
      fallback
    );
  }

  const expression = j.memberExpression(object, firstIdentifier, computed);

  return fallback
    ? j.logicalExpression("??", expression, fallback)
    : expression;
}

function transformer(file, api) {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.CallExpression, {
      callee: { property: { name: "getIn" } },
      arguments: { 0: { type: "ArrayExpression" } },
    })
    .forEach((path) => {
      const [key, fallback] = path.node.arguments;

      if (!["string", "number"].includes(typeof key.elements[0].value)) {
        throw new Error(
          `Cannot transform "get" on line ${path.node.loc.start.line}`
        );
      }

      j(path).replaceWith(
        getIn(j, path.node.callee.object, key.elements, fallback)
      );
    })
    .toSource();
}

module.exports = transformer;
