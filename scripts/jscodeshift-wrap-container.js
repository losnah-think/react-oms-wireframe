const path = require('path');

module.exports = function(fileInfo, api) {
  try {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);
    const filePath = fileInfo.path;

    // skip tests
    if (/\.test\./.test(filePath)) return null;

    // skip if file already contains Container JSX
    const hasContainerJSX = root.find(j.JSXElement, {
      openingElement: { name: { type: 'JSXIdentifier', name: 'Container' } }
    }).size() > 0;
    if (hasContainerJSX) return null;

    // compute relative import path to src/design-system
    const repoRoot = process.cwd();
    const designSystemPath = path.join(repoRoot, 'src', 'design-system');
    let rel = path.relative(path.dirname(filePath), designSystemPath);
    rel = rel.split(path.sep).join('/');
    if (!rel.startsWith('.')) rel = './' + rel;

    // find import declarations that reference design-system
    const importDecls = root.find(j.ImportDeclaration).filter(p => {
      return p.node && p.node.source && typeof p.node.source.value === 'string' && p.node.source.value.includes('design-system');
    });

    // if there is already an import that imports Container, skip
    if (importDecls.size() > 0) {
      const hasContainer = importDecls.find(j.ImportSpecifier, { imported: { name: 'Container' } }).size() > 0;
      if (hasContainer) return null;
    }

    // find first return statement whose argument is JSX (or parenthesized JSX)
    const returns = root.find(j.ReturnStatement).filter(p => {
      const arg = p.node && p.node.argument;
      if (!arg) return false;
      if (arg.type === 'JSXElement' || arg.type === 'JSXFragment') return true;
      if (arg.type === 'ParenthesizedExpression' && arg.expression && (arg.expression.type === 'JSXElement' || arg.expression.type === 'JSXFragment')) return true;
      return false;
    });

    if (returns.size() === 0) return null;

    const retPath = returns.get(0);
    if (!retPath || !retPath.node) return null;
    let arg = retPath.node.argument;
    if (arg && arg.type === 'ParenthesizedExpression') arg = arg.expression;

    // create Container JSX wrapper
    const containerOpening = j.jsxOpeningElement(j.jsxIdentifier('Container'), [j.jsxAttribute(j.jsxIdentifier('maxWidth'), j.literal('full'))]);
    const containerClosing = j.jsxClosingElement(j.jsxIdentifier('Container'));
    const containerElement = j.jsxElement(containerOpening, containerClosing, [arg], false);

    // replace the return argument with the container
    retPath.node.argument = containerElement;

    // add import: either append to existing design-system import(s) or add a new import after last import
    if (importDecls.size() > 0) {
      importDecls.forEach(p => {
        p.node.specifiers = p.node.specifiers || [];
        const exists = p.node.specifiers.some(s => s.type === 'ImportSpecifier' && s.imported && s.imported.name === 'Container');
        if (!exists) p.node.specifiers.push(j.importSpecifier(j.identifier('Container')));
      });
    } else {
      const importDecl = j.importDeclaration([j.importSpecifier(j.identifier('Container'))], j.literal(rel));
      const body = root.get().value.program.body;
      let lastImportIndex = -1;
      for (let i = 0; i < body.length; i++) if (body[i].type === 'ImportDeclaration') lastImportIndex = i;
      body.splice(lastImportIndex + 1, 0, importDecl);
    }

    return root.toSource({ quote: 'single' });
  } catch (err) {
    return null; // on failure, skip file
  }
};
