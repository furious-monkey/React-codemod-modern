function getFirstIdentifier({ j, key }) {
  const { type, value } = key[0];
  const parsedValue = parseInt(value);
  const isIndex = Number.isFinite(parsedValue);

  if (type === "StringLiteral" && typeof value === "string" && !isIndex) {
    return { firstIdentifier: j.identifier(value), computed: false };
  }

  if (["NumericLiteral", "StringLiteral"].includes(type) && isIndex) {
    if (value < 0) {
      throw new Error(`Negative index is not supported`);
    }

    return { firstIdentifier: j.numericLiteral(parsedValue), computed: true };
  }

  return { firstIdentifier: key[0], computed: true };
}

function getNestedIdentifier({ j, object, depth, key }) {
  const { firstIdentifier, computed } = getFirstIdentifier({
    j,
    key,
  });

  const expression = depth
    ? j.optionalMemberExpression(object, firstIdentifier, computed)
    : j.memberExpression(object, firstIdentifier, computed);

  if (key.length > 1) {
    return getNestedIdentifier({
      j,
      object: expression,
      depth: depth + 1,
      key: key.slice(1),
    });
  }

  return expression;
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
      depth: 0,
      key: key.type === "ArrayExpression" ? key.elements : [key],
    }),
  ];

  return j.callExpression(value, args);
}

function getPropertyKey({ key, level }) {
  if (key.type === "ArrayExpression") {
    const { type, value } = key.elements[level];
    const parsedValue = parseInt(value);
    const isIndex = Number.isFinite(parsedValue);

    if (type === "StringLiteral" && typeof value === "string" && !isIndex) {
      return value;
    }

    if (["NumericLiteral", "StringLiteral"].includes(type) && isIndex) {
      return parsedValue;
    }

    return key.elements[level];
  }

  const { type, value } = key;

  const parsedValue = parseInt(value);
  const isIndex = Number.isFinite(parsedValue);

  if (type === "StringLiteral" && typeof value === "string" && !isIndex) {
    return value;
  }

  if (["NumericLiteral", "StringLiteral"].includes(type) && isIndex) {
    return parsedValue;
  }

  return key;
}

function transformProperty({ j, key, level }) {
  if (key.type === "ArrayExpression") {
    const { type, value } = key.elements[level];
    const parsedValue = parseInt(value);
    const isIndex = Number.isFinite(parsedValue);

    if (type === "StringLiteral" && typeof value === "string" && !isIndex) {
      return j.identifier(value);
    }

    if (["NumericLiteral", "StringLiteral"].includes(type) && isIndex) {
      if (value < 0) {
        throw new Error(
          `Negative index for "get" is not supported on line ${path.node.loc.start.line}`
        );
      }

      return j.numericLiteral(parsedValue);
    }

    return key.elements[level];
  }

  const { type, value } = key;

  const parsedValue = parseInt(value);
  const isIndex = Number.isFinite(parsedValue);

  if (type === "StringLiteral" && typeof value === "string" && !isIndex) {
    return j.identifier(value);
  }

  if (["NumericLiteral", "StringLiteral"].includes(type) && isIndex) {
    if (value < 0) {
      throw new Error(
        `Negative index for "get" is not supported on line ${path.node.loc.start.line}`
      );
    }

    return j.numericLiteral(parsedValue);
  }

  return key;
}

function getProperties({ j, object, mutationCalls, level }) {
  return mutationCalls
    .map((path) => {
      const [key, value] = path.node.arguments;
      const literal =
        key.type === "ArrayExpression"
          ? key.elements[level].type === "StringLiteral" &&
            !Number.isFinite(parseInt(key.elements[level].value))
          : key.type === "StringLiteral" &&
            !Number.isFinite(parseInt(key.value));

      return {
        key,
        value: getNewValue({ j, mutationCall: path, value, key, object }),
        level,
        propertyId: getPropertyKey({ key, level }),
        computed: !literal,
      };
    })
    .filter(
      ({ propertyId }, index, array) =>
        array.findIndex((item) => item.propertyId === propertyId) === index
    );
}

function transformLevel({ j, object, mutationCalls, level }) {
  const properties = getProperties({ j, object, mutationCalls, level }).map(
    ({ key, value, computed }) => {
      const result = j.objectProperty(
        transformProperty({ j, key, level }),
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
            depth: 0,
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
    ["StringLiteral", "NumericLiteral", "Identifier"].includes(
      node.arguments[0].type
    )
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
    ["StringLiteral", "NumericLiteral", "Identifier"].includes(
      node.arguments[0].type
    )
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

function transformer(file, api, options) {
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
    .toSource(options);
}

transformer.displayName = "mapMutations";

module.exports = transformer;
