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

/**
 * Trim string to a maximum length.
 */
function cleanText(text: string): string {
  return text.trim();
}

export function addJSDocToNode(node: Node, text: string): void {
  const cleanedText = cleanText(text);
  if (!cleanedText) {
    return;
  }

  const jsDoc = factory.createJSDocComment(cleanedText, []);
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
