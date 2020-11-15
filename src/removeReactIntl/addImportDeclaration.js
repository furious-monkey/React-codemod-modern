function addImportDeclaration(j, root, newDeclaration) {
  if (
    root.find(j.ImportDeclaration, {
      source: { value: newDeclaration.source.value },
    }).length
  ) {
    return;
  }

  const importDeclarations = root.find(j.ImportDeclaration);
  const lastDeclaration = importDeclarations.at(-1).paths()[0];
  const beforeLastDeclaration =
    importDeclarations.length > 1 && importDeclarations.at(-2).paths()[0];
  const lastDeclarationSource = lastDeclaration.node.source.value;
  const declaration =
    beforeLastDeclaration &&
    (lastDeclarationSource.endsWith(".css") ||
      lastDeclarationSource.endsWith(".less"))
      ? beforeLastDeclaration
      : lastDeclaration;

  declaration.insertAfter(newDeclaration);
}

module.exports = addImportDeclaration;
