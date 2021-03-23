import { readFileSync, writeFileSync } from 'fs';
import { generateClient } from '@typoas/generator';
import { createPrinter, NewLineKind, SourceFile } from 'typescript';

const getStringFromSourceFile = (src: SourceFile): string => {
  const printer = createPrinter({ newLine: NewLineKind.LineFeed });

  return printer.printFile(src);
};

const specs = JSON.parse(
  readFileSync(__dirname + '/../samples/github.json', 'utf8'),
);

console.time('generation');
const src = generateClient(specs, 'GithubClient');
console.timeEnd('generation');

console.time('printing');
const data = getStringFromSourceFile(src);
console.timeEnd('printing');

console.time('writing');
writeFileSync(__dirname + '/../src/client.ts', data, 'utf8');
console.timeEnd('writing');
