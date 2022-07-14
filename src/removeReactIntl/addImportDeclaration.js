function addImportDeclaration(j, root, source, specifiers) {
  if (
    root.find(j.ImportDeclaration, {
      source: { value: source },
    }).length
  ) {
    return (source) => source;
  }

  const newDeclaration = j.importDeclaration(
    specifiers.map(specifier => j.importSpecifier(j.identifier(specifier))),
    j.literal(source)
  );

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

  const declarationSource = j(declaration).toSource();

  return (source) =>
    source.replace(`${declarationSource}\r\n\r\n`, `${declarationSource}\r\n`);
}

module.exports = addImportDeclaration;
