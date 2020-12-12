function getFirstIdentifier({ j, key, line }) {
  const { type, value } = key[0];
  const parsedValue = parseInt(value);
  const isIndex = Number.isFinite(parsedValue);

  if (type === "StringLiteral" && typeof value === "string" && !isIndex) {
    return { firstIdentifier: j.identifier(value), computed: false };
  }

  if (["NumericLiteral", "StringLiteral"].includes(type) && isIndex) {
    if (value < 0) {
      throw new Error(
        `Negative index for "getIn" is not supported on line ${line}`
      );
    }

    return { firstIdentifier: j.numericLiteral(parsedValue), computed: true };
  }

  return { firstIdentifier: key[0], computed: true };
}

function hasIn(j, object, depth, key, line) {
  const { firstIdentifier, computed } = getFirstIdentifier({
    j,
    key,
    line,
  });

  const expression = depth
    ? j.optionalMemberExpression(object, firstIdentifier, computed)
    : j.memberExpression(object, firstIdentifier, computed);

  if (key.length > 1) {
    return hasIn(j, expression, depth + 1, key.slice(1), line);
  }

  return j.unaryExpression("!", j.unaryExpression("!", expression, true), true);
}

function transformer(file, api) {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.CallExpression, {
      callee: { property: { name: "hasIn" } },
      arguments: { 0: { type: "ArrayExpression" } },
    })
    .forEach((path) => {
      if (path.name === "object") {
        return;
      }

      const [key] = path.node.arguments;

      j(path).replaceWith(
        hasIn(
          j,
          path.node.callee.object,
          0,
          key.elements,
          path.node.loc.start.line
        )
      );
    })
    .toSource();
}

transformer.displayName = "hasIn";

module.exports = transformer;
