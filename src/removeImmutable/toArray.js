function transformer(file, api, options) {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.CallExpression, {
      callee: { property: { name: "toArray" } },
    })
    .forEach((path) => {
      j(path).replaceWith(path.value.callee.object);
    })
    .toSource(options);
}

transformer.displayName = "toArray";

module.exports = transformer;
