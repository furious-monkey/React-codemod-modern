function transformer(file, api, options) {
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
    .toSource(options);
}

transformer.displayName = "toEqualImmutable";

module.exports = transformer;
