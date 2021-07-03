import {
  createPrinter,
  EmitHint,
  factory,
  NewLineKind,
  Node,
  NodeFlags,
  SyntaxKind,
} from 'typescript';

export const getStringFromNode = (node: Node): string => {
  const printer = createPrinter({ newLine: NewLineKind.LineFeed });
  const resultFile = factory.createSourceFile(
    [],
    factory.createToken(SyntaxKind.EndOfFileToken),
    NodeFlags.Const,
  );
  return printer.printNode(EmitHint.Unspecified, node, resultFile);
};
