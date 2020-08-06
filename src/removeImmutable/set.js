function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  return root
    .find(j.CallExpression, {
      callee: { property: { name: "set" } },
      arguments: { 0: { type: "Literal" } },
    })
    .forEach((path) => {
      const innerSetCalls = j(path).find(j.CallExpression, {
        callee: { property: { name: "set" } },
        arguments: { 0: { type: "Literal" } },
      });

      const paths = [path, ...innerSetCalls.paths()].reverse();
      const object = paths[0].node.callee.object;
      const properties = paths.map((path) =>
        j.objectProperty(
          j.identifier(path.node.arguments[0].value),
          path.node.arguments[1]
        )
      );

      j(path).replaceWith(
        j.objectExpression([j.spreadElement(object), ...properties])
      );
    })
    .toSource();
}

module.exports = transformer;
