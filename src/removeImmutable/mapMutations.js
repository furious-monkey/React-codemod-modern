function transformLevel(j, callExpressions, path) {
  const object = callExpressions[0].node.callee.object;
  const properties = callExpressions.map((path) =>
    j.objectProperty(
      j.identifier(path.node.arguments[0].value),
      path.node.arguments[1]
    )
  );

  return j.objectExpression([j.spreadElement(object), ...properties]);
}

function findMutationCalls(j, root) {
  return root.find(j.CallExpression, {
    callee: { property: { name: "set" } },
    arguments: { 0: { type: "Literal" } },
  });
}

function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  return findMutationCalls(j, root)
    .forEach((path) => {
      j(path).replaceWith(
        transformLevel(
          j,
          [path, ...findMutationCalls(j, j(path)).paths()].reverse(),
          []
        )
      );
    })
    .toSource();
}

module.exports = transformer;
