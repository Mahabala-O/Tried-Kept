/** Export the site's editable vector art to complete, self-contained image assets. */
import { createServer } from 'vite';
import { access, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const vite = await createServer({ configFile: false, server: { middlewareMode: true, ws: false }, resolve: { alias: { '@': process.cwd() } }, esbuild: { jsx: 'automatic' } });
try {
  const { exportArt } = await vite.ssrLoadModule('/scripts/product-art-source.tsx');
  await mkdir('public/media/products', { recursive: true });
  for (const asset of exportArt()) {
    const target = path.join('public/media', asset.path);
    if (process.argv.includes('--missing') && await access(target).then(() => true, () => false)) continue;
    await writeFile(target, asset.svg);
  }
} finally { await vite.close(); }
