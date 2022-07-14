const addImportDeclaration = require("../removeReactIntl/addImportDeclaration");

const moveFromPackageName = "import1";
const moveToPackageName = "import2";
const moveExports = ["a", "b"];

function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const importDeclaration = root.find(j.ImportDeclaration, {
    source: { value: moveFromPackageName },
  });
  const hasSpecifiersNotToBeMoved = importDeclaration
    .find(j.ImportSpecifier)
    .some(
      (importSpecifier) =>
        !moveExports.includes(importSpecifier.node.imported.name)
    );
  const importSpecifiersToBeMoved = importDeclaration
    .find(j.ImportSpecifier)
    .filter((importSpecifier) =>
      moveExports.includes(importSpecifier.node.imported.name)
    );

  if (importSpecifiersToBeMoved.length) {
    const fixSource = addImportDeclaration(
      j,
      root,
      moveToPackageName,
      importSpecifiersToBeMoved.nodes().map((node) => node.imported.name)
    );

    if (hasSpecifiersNotToBeMoved) {
      importSpecifiersToBeMoved.remove();
    } else {
      importDeclaration.remove();
    }

    return fixSource(root.toSource());
  }

  return root.toSource();
}

transformer.displayName = "refactorImports";

module.exports = transformer;
