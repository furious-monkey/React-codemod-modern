function transformer(file, api) {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.CallExpression, {
      callee: { property: { name: "toArray" } },
    })
    .forEach((path) => {
      j(path).replaceWith(path.value.callee.object);
    })
    .toSource();
}

transformer.name = "toArray";

module.exports = transformer;
