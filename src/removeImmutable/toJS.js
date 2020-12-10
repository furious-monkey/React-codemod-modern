function transformer(file, api) {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.CallExpression, {
      callee: { property: { name: "toJS" } },
    })
    .forEach((path) => {
      j(path).replaceWith(path.value.callee.object);
    })
    .toSource();
}

transformer.displayName = "toJS";

module.exports = transformer;
