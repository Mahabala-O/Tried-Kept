import { renderToStaticMarkup } from 'react-dom/server';
import { products, productLabel } from '@/lib/catalog';
import ShoeArt, { shoeModelFor } from '@/components/art/ShoeArt';
import RacquetArt from '@/components/art/RacquetArt';
import CourtArt from '@/components/art/CourtArt';
import { paletteFor } from '@/components/art/palette';
import ApparelArt, { apparelShape } from '@/components/art/ApparelArt';

export function exportArt() {
  const assets = products.map(product => {
    const palette = paletteFor(product.slug);
    const bg = product.category === 'shoe' ? shoeModelFor(product.slug).colors.bg : palette.bg;
    const drawing = product.category === 'shoe'
      ? <ShoeArt seed={product.slug} />
      : product.category === 'racquet'
        ? <RacquetArt seed={product.slug} frame={palette.main} accent={palette.accent} grip={palette.detail} />
        : <ApparelArt shape={apparelShape(product.category, product.name)} />;
    const svg = renderToStaticMarkup(
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="640" height="480" role="img">
        <title>{`${productLabel(product)} — illustration`}</title>
        <rect width="640" height="480" rx="24" fill={bg} />
        <ellipse cx="320" cy="400" rx="195" ry="18" fill="#0E2A2A" opacity=".09" />
        <svg x={product.category === 'shoe' ? 30 : 160} y="30" width={product.category === 'shoe' ? 580 : 320} height="390">{drawing}</svg>
      </svg>
    );
    return { path: `products/${product.slug}.svg`, svg };
  });
  assets.push({ path: 'tennis-court.svg', svg: renderToStaticMarkup(<CourtArt />).replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"') });
  return assets;
}
