function transformer(file, api) {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.CallExpression, {
      callee: { property: { name: "toEqualImmutable" } },
    })
    .forEach((path) => {
      j(path).replaceWith(
        j.callExpression(
          j.memberExpression(path.node.callee.object, j.identifier("toEqual")),
          path.node.arguments
        )
      );
    })
    .toSource();
}

transformer.displayName = "toEqualImmutable";

module.exports = transformer;
