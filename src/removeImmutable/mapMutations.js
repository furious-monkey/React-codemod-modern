function getIn(j, object, key) {
  const firstIdentifier = j.identifier(key[0]);

  if (key.length > 1) {
    return getIn(
      j,
      j.optionalMemberExpression(object, firstIdentifier),
      key.slice(1)
    );
  }

  return j.memberExpression(object, firstIdentifier);
}

function transformLevel(j, object, callExpressions, level) {
  const properties = callExpressions
    .map((path) => {
      const [key, value] = path.node.arguments;
      return {
        key,
        value,
        propertyName:
          key.type === "ArrayExpression"
            ? key.elements[level].value
            : key.value,
      };
    })
    .filter(
      ({ propertyName }, index, array) =>
        array.findIndex((item) => item.propertyName === propertyName) === index
    )
    .map(({ key, value, propertyName }) => {
      return j.objectProperty(
        j.identifier(propertyName),
        key.type === "ArrayExpression" && key.elements.length > level + 1
          ? transformLevel(
              j,
              object,
              callExpressions.filter((path) => {
                const mutationKey = path.node.arguments[0];
                return (
                  mutationKey.type === "ArrayExpression" &&
                  mutationKey.elements[level].value ===
                    key.elements[level].value
                );
              }),
              level + 1
            )
          : value
      );
    });

  return j.objectExpression([
    j.spreadElement(
      level === 0
        ? object
        : getIn(
            j,
            object,
            callExpressions[0].node.arguments[0].elements
              .map((element) => element.value)
              .slice(0, level)
          )
    ),
    ...properties,
  ]);
}

function isSetCall(node) {
  return (
    node.callee.property &&
    node.callee.property.name === "set" &&
    node.arguments.length &&
    node.arguments[0].type === "Literal"
  );
}

function isSetInCall(node) {
  return (
    node.callee.property &&
    node.callee.property.name === "setIn" &&
    node.arguments.length &&
    node.arguments[0].type === "ArrayExpression"
  );
}

function findMutationCalls(j, root) {
  return root.find(
    j.CallExpression,
    (node) => isSetCall(node) || isSetInCall(node)
  );
}

function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  return findMutationCalls(j, root)
    .forEach((path) => {
      const mutationCalls = [
        path,
        ...findMutationCalls(j, j(path)).paths(),
      ].reverse();
      j(path).replaceWith(
        transformLevel(j, mutationCalls[0].node.callee.object, mutationCalls, 0)
      );
    })
    .toSource();
}

module.exports = transformer;
