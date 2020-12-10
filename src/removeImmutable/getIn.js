function getFirstIdentifier({ j, key, line }) {
  const { type, value } = key[0];
  const parsedValue = parseInt(value);
  const isIndex = Number.isFinite(parsedValue);

  if (type === "Literal" && typeof value === "string" && !isIndex) {
    return { firstIdentifier: j.identifier(value), computed: false };
  }

  if (type === "Literal" && isIndex) {
    if (value < 0) {
      throw new Error(
        `Negative index for "getIn" is not supported on line ${line}`
      );
    }

    return { firstIdentifier: j.numericLiteral(parsedValue), computed: true };
  }

  return { firstIdentifier: key[0], computed: true };
}

function getIn(j, object, key, line, fallback) {
  const { firstIdentifier, computed } = getFirstIdentifier({
    j,
    key,
    line,
  });

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
