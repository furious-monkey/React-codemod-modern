function getNestedIdentifier({ j, object, key }) {
  const firstIdentifier = j.identifier(key[0]);

  if (key.length > 1) {
    return getNestedIdentifier({
      j,
      object: j.optionalMemberExpression(object, firstIdentifier),
      key: key.slice(1),
    });
  }

  return j.memberExpression(object, firstIdentifier);
}

function transformValue({ j, key, level, object, mutationCalls, value }) {
  return key.type === "ArrayExpression" && key.elements.length > level + 1
    ? transformLevel({
        j,
        object,
        mutationCalls: mutationCalls.filter((path) => {
          const mutationKey = path.node.arguments[0];
          return (
            mutationKey.type === "ArrayExpression" &&
            mutationKey.elements[level].value === key.elements[level].value
          );
        }),
        level: level + 1,
      })
    : value;
}

function getNewValue({ j, mutationCall, value, key, object }) {
  if (
    !["update", "updateIn"].includes(mutationCall.node.callee.property.name)
  ) {
    return value;
  }

  const args = [
    getNestedIdentifier({
      j,
      object,
      key:
        key.type === "ArrayExpression"
          ? key.elements.map((element) => element.value)
          : [key.value],
    }),
  ];

  return j.callExpression(value, args);
}

function getProperties({ j, object, mutationCalls, level }) {
  return mutationCalls
    .map((path) => {
      const [key, value] = path.node.arguments;
      return {
        key,
        value: getNewValue({ j, mutationCall: path, value, key, object }),
        propertyName:
          key.type === "ArrayExpression"
            ? key.elements[level].value
            : key.value,
      };
    })
    .filter(
      ({ propertyName }, index, array) =>
        array.findIndex((item) => item.propertyName === propertyName) === index
    );
}

function transformLevel({ j, object, mutationCalls, level }) {
  const properties = getProperties({ j, object, mutationCalls, level }).map(
    ({ key, value, propertyName }) => {
      return j.objectProperty(
        j.identifier(propertyName),
        transformValue({ j, key, level, object, mutationCalls, value })
      );
    }
  );

  return j.objectExpression([
    j.spreadElement(
      level === 0
        ? object
        : getNestedIdentifier({
            j,
            object,
            key: mutationCalls[0].node.arguments[0].elements
              .map((element) => element.value)
              .slice(0, level),
          })
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

function isUpdateCall(node) {
  return (
    node.callee.property &&
    node.callee.property.name === "update" &&
    node.arguments.length &&
    node.arguments[0].type === "Literal"
  );
}

function isUpdateInCall(node) {
  return (
    node.callee.property &&
    node.callee.property.name === "updateIn" &&
    node.arguments.length &&
    node.arguments[0].type === "ArrayExpression"
  );
}

function findMutationCalls(j, root) {
  return root.find(
    j.CallExpression,
    (node) =>
      isSetCall(node) ||
      isSetInCall(node) ||
      isUpdateCall(node) ||
      isUpdateInCall(node)
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
        transformLevel({
          j,
          object: mutationCalls[0].node.callee.object,
          mutationCalls,
          level: 0,
        })
      );
    })
    .toSource();
}

module.exports = transformer;
