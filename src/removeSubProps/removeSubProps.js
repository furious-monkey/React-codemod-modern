function firstIsUppercase(str) {
  if (str.length === 0) {
    return false;
  }

  return str.charAt(0).toUpperCase() === str.charAt(0);
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
      return spec.local.name;
    });

  return root
    .find(
      j.MemberExpression,
      (path) =>
        path.object.type === "Identifier" &&
        importSpecifiers.includes(path.object.name) &&
        !firstIsUppercase(path.property.name)
    )
    .forEach((path) => {
      const objectName = path.value.object.name;
      const propertyName = path.value.property.name;
      const parentPropertyName = path.parentPath.value.property.name;
      const value = [objectName, propertyName, parentPropertyName].join(".");

      if (path.parentPath.parentPath.value.type === "JSXExpressionContainer") {
        j(path.parentPath.parentPath).replaceWith(j.literal(value));
      } else {
        j(path.parentPath).replaceWith(j.literal(value));
      }
    })
    .toSource(options);
}

transformer.displayName = "fromJS";

module.exports = transformer;
