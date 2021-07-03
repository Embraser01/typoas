import {
  addSyntheticLeadingComment,
  createPrinter,
  factory,
  Node,
  SyntaxKind,
  EmitHint,
  NodeFlags,
} from 'typescript';

const jsDocPrinter = createPrinter();

export function addJSDocToNode(node: Node): void {
  const jsDoc = factory.createJSDocComment('Test', []);

  const src = factory.createSourceFile(
    [],
    factory.createToken(SyntaxKind.EndOfFileToken),
    NodeFlags.Const,
  );
  const output = jsDocPrinter
    .printNode(EmitHint.Unspecified, jsDoc, src)
    .trim()
    .replace(/^\/\*|\*\/$/g, '');

  addSyntheticLeadingComment(
    node,
    SyntaxKind.MultiLineCommentTrivia,
    output,
    true,
  );
}
