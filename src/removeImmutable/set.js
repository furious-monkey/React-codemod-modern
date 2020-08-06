function set(j, object, key, value) {
  const spread = j.spreadElement(object);
  const property = j.objectProperty(j.identifier(key), value);

  return j.objectExpression([spread, property]);
}

function transformer(file, api) {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.CallExpression, {
      callee: { property: { name: "set" } },
      arguments: { 0: { type: "Literal" } },
    })
    .forEach((path) => {
      j(path).replaceWith(
        set(
          j,
          path.node.callee.object,
          path.node.arguments[0].value,
          path.node.arguments[1]
        )
      );
    })
    .toSource();
}

module.exports = transformer;
