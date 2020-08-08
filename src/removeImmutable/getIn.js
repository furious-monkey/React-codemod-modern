function getIn(j, object, key, fallback) {
  const firstIdentifier = j.identifier(key[0].value);

  if (key.length > 1) {
    return getIn(
      j,
      j.optionalMemberExpression(object, firstIdentifier),
      key.slice(1),
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
      const [key, fallback] = path.node.arguments;
      j(path).replaceWith(
        getIn(j, path.node.callee.object, key.elements, fallback)
      );
    })
    .toSource();
}

module.exports = transformer;
