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
const srcFile = factory.createSourceFile(
  [],
  factory.createToken(SyntaxKind.EndOfFileToken),
  NodeFlags.Const,
);

export function addJSDocToNode(node: Node, text: string): void {
  if (!text.trim()) {
    return;
  }

  const jsDoc = factory.createJSDocComment(text, []);

  const output = jsDocPrinter
    .printNode(EmitHint.Unspecified, jsDoc, srcFile)
    .trim()
    .replace(/^\/\*|\*\/$/g, '');

  addSyntheticLeadingComment(
    node,
    SyntaxKind.MultiLineCommentTrivia,
    output,
    true,
  );
}
