function getIn(j, object, array, fallback) {
  const firstIdentifier = j.identifier(array[0].value);

  if (array.length > 1) {
    return getIn(
      j,
      j.optionalMemberExpression(object, firstIdentifier),
      array.slice(1),
      fallback
    );
  }

  const expression = j.memberExpression(object, firstIdentifier);

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
      j(path).replaceWith(
        getIn(
          j,
          path.node.callee.object,
          path.node.arguments[0].elements,
          path.node.arguments[1]
        )
      );
    })
    .toSource();
}

module.exports = transformer;
