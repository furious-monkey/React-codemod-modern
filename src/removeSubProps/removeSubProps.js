function firstIsUppercase(str) {
  if (str.length === 0) {
    return false;
  }

  return str.charAt(0).toUpperCase() === str.charAt(0);
}

function getPropertyChain(path) {
  if (path.parentPath.value.type === "MemberExpression") {
    return [path.value.property.name, ...getPropertyChain(path.parentPath)];
  }

  return [path.value.property.name];
}

function getTopOfPropertyChain(path) {
  if (path.parentPath.value.type === "MemberExpression") {
    return getTopOfPropertyChain(path.parentPath);
  }

  return path;
}

function transformer(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const importDeclaration = root.find(j.ImportDeclaration, {
    source: { value: "lib" },
  });
  const importSpecifiers = importDeclaration
    .find(j.ImportSpecifier)
    .nodes()
    .map((spec) => {
      return [spec.imported.name, spec.local.name];
    });

  return root
    .find(
      j.MemberExpression,
      (path) =>
        path.object.type === "Identifier" &&
        importSpecifiers.find((spec) => path.object.name === spec[1]) &&
        !firstIsUppercase(path.property.name)
    )
    .forEach((path) => {
      const objectName = importSpecifiers.find(
        (spec) => path.value.object.name === spec[1]
      )[0];
      const value = [objectName, ...getPropertyChain(path)].join(".");
      const topPath = getTopOfPropertyChain(path);

      if (topPath.parentPath.value.type === "JSXExpressionContainer") {
        j(topPath.parentPath).replaceWith(j.literal(value));
      } else {
        j(topPath).replaceWith(j.literal(value));
      }
    })
    .toSource(options);
}

transformer.displayName = "fromJS";

module.exports = transformer;
