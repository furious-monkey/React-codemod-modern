function getIn(j, object, key, line, fallback) {
  const { type, value, name } = key[0];
  const parsedValue = parseInt(value);
  const isIndex = Number.isFinite(parsedValue);

  const computed = isIndex || type === "Identifier";
  const firstIdentifier =
    type === "Literal" && (typeof value === "number" || isIndex)
      ? j.numericLiteral(parsedValue)
      : j.identifier(type === "Identifier" ? name : value);

  if (type === "Literal" && !["number", "string"].includes(typeof value)) {
    throw new Error(`Cannot transform "getIn" on line ${line}`);
  }

  if (type === "Literal" && isIndex && value < 0) {
    throw new Error(
      `Negative index for "get" is not supported on line ${path.node.loc.start.line}`
    );
  }

  if (key.length > 1) {
    return getIn(
      j,
      j.optionalMemberExpression(object, firstIdentifier, computed),
      key.slice(1),
      line,
      fallback
    );
  }

  const expression = j.memberExpression(object, firstIdentifier, computed);

  return fallback
    ? j.parenthesizedExpression(j.logicalExpression("??", expression, fallback))
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

      j(path).replaceWith(
        getIn(
          j,
          path.node.callee.object,
          key.elements,
          path.node.loc.start.line,
          fallback
        )
      );
    })
    .toSource();
}

transformer.displayName = "getIn";

module.exports = transformer;
