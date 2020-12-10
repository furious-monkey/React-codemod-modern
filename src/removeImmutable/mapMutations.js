function getNestedIdentifier({ j, object, key }) {
  const { type, value, name } = key[0];
  const computed = typeof value === "number" || type === "Identifier";
  const firstIdentifier =
    type === "Literal" && typeof value === "number"
      ? j.numericLiteral(value)
      : j.identifier(type === "Identifier" ? name : value);

  if (type === "Literal" && !["number", "string"].includes(typeof value)) {
    throw new Error(`Cannot transform "getIn" on line ${line}`);
  }

  if (type === "Literal" && typeof value === "number" && value < 0) {
    throw new Error(
      `Negative index for "get" is not supported on line ${path.node.loc.start.line}`
    );
  }

  if (key.length > 1) {
    return getNestedIdentifier({
      j,
      object: j.optionalMemberExpression(object, firstIdentifier, computed),
      key: key.slice(1),
    });
  }

  return j.memberExpression(object, firstIdentifier, computed);
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
      key: key.type === "ArrayExpression" ? key.elements : [key],
    }),
  ];

  return j.callExpression(value, args);
}

function getProperties({ j, object, mutationCalls, level }) {
  return mutationCalls
    .map((path) => {
      const [key, value] = path.node.arguments;
      const computed =
        key.type === "ArrayExpression"
          ? key.elements[level].type === "Identifier"
          : key.type === "Identifier";

      return {
        key,
        value: getNewValue({ j, mutationCall: path, value, key, object }),
        propertyName:
          key.type === "ArrayExpression"
            ? key.elements[level].type === "Literal"
              ? key.elements[level].value
              : key.elements[level].name
            : key.type === "Literal"
            ? key.value
            : key.name,
        computed,
      };
    })
    .filter(
      ({ propertyName }, index, array) =>
        array.findIndex((item) => item.propertyName === propertyName) === index
    );
}

function transformLevel({ j, object, mutationCalls, level }) {
  const properties = getProperties({ j, object, mutationCalls, level }).map(
    ({ key, value, propertyName, computed }) => {
      const result = j.objectProperty(
        j.identifier(propertyName),
        transformValue({ j, key, level, object, mutationCalls, value })
      );

      result.computed = computed;

      return result;
    }
  );

  return j.objectExpression([
    j.spreadElement(
      level === 0
        ? object
        : getNestedIdentifier({
            j,
            object,
            key: mutationCalls[0].node.arguments[0].elements.slice(0, level),
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
    (node.arguments[0].type === "Literal" ||
      node.arguments[0].type === "Identifier")
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
    (node.arguments[0].type === "Literal" ||
      node.arguments[0].type === "Identifier")
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
