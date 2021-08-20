import { generateClient } from '@typoas/generator';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { load } from 'js-yaml';
import { URL } from 'url';

type OpenAPI = Parameters<typeof generateClient>[0];

export async function loadRemoteFile(url: URL): Promise<string> {
  const http =
    url.protocol === 'http' ? await import('http') : await import('https');

  return new Promise((resolve, reject) => {
    const request = http.request(url, (response) => {
      const allChunks: Buffer[] = [];

      response.on('data', (chunk) => allChunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(allChunks).toString()));
      response.on('error', reject);
    });

    request.end();
    request.on('error', reject);
  });
}

export async function loadFile(input: string): Promise<string> {
  if (!existsSync(input)) {
    throw new Error(`Error: File '${input}' does not exist`);
  }
  return readFile(input, { encoding: 'utf-8' });
}

export async function loadSpec(input: string): Promise<OpenAPI> {
  let rawSpecs: string;
  if (input.startsWith('http://') || input.startsWith('https://')) {
    rawSpecs = await loadRemoteFile(new URL(input));
  } else {
    rawSpecs = await loadFile(input);
  }
  return (await load(rawSpecs, { json: true })) as OpenAPI;
}
