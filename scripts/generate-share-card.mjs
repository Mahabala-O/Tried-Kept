import { createServer } from 'vite';
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
const vite = await createServer({ configFile: false, server: { middlewareMode: true, ws: false }, resolve: { alias: { '@': process.cwd() } }, esbuild: { jsx: 'automatic' } });
try {
  const { shareCardSvg } = await vite.ssrLoadModule('/scripts/create-share-card.tsx');
  const svg=shareCardSvg();
  await mkdir('public/social',{recursive:true});
  await writeFile('public/social/tried-and-kept-card-v1.svg',svg);
  await sharp(Buffer.from(svg)).png().toFile('public/social/tried-and-kept-card-v1.png');
} finally { await vite.close(); }
