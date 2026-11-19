# Tried & Kept

A tennis gear guide built from `tennis_gear_buyer_research.pdf`. Players start from a pro, a product, or their own gear, then see what others tried, kept and returned.

## Run it

Requires Node 22.13 or newer.

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:3000. In development, confirmation emails appear in an on-screen test inbox. Data is stored in `data/app.db`.

## Check it

```bash
npm run typecheck
```

```bash
npm test
```

```bash
npm run build
```

## Add affiliate links

Retailer buttons pass through `/go/[offerId]`, which counts the click and redirects. Once a program approves you, copy `.env.example` to `.env.local` and set that retailer's template. `{url}` is replaced with the encoded product page:

```
AFFILIATE_TEMPLATE_NIKE=https://your-network.example/click?id=YOUR_ID&u={url}
```

Without a template, the button goes to the plain retailer page and earns nothing. To add a retailer, add it to `retailers` in `lib/catalog.ts`, then add offers to its products.

## Add gear and pros

All catalog data lives in `lib/catalog.ts`. Leave a value `null` when you have no source for it, and the app labels it as a gap. Pro gear needs a date and a source.

## Images and GIFs

`lib/media.ts` records portraits, GIFs, image credits, and original photo URLs. All 8 catalog pros have a portrait and an official-channel GIF. The 14 licensed photos are served from `public/media/photos` as WebP images at 320, 640, and 1280 pixels; credits remain next to each image and on `/credits`.

All 23 products have a labelled original illustration in `public/media/products`. Regenerate these from the editable drawing components after adding products:

```bash
node scripts/export-product-art.mjs
```

Exact-model photos with approved rights can be added to `productPhotos`. GIFs use GIPHY's embed player; paused clips show a credited player portrait or original court art. Image load failures fall back to local court art. The media tests check coverage for every catalog product and pro, including every local image and responsive rendition.

## Deploy on Railway

The app stores data in SQLite, so it needs a Railway volume and runs as a single replica.

1. In Railway, create a project from the GitHub repo `Mahabala-O/Tried-Kept`. Railpack builds it with Node 22.
2. On the service, add a volume mounted at `/data`. The app finds it through `RAILWAY_VOLUME_MOUNT_PATH` and stores `app.db` there.
3. In Settings, set Healthcheck Path to `/api/health`. Under Networking, click Generate Domain.
4. In Variables, set:
   - `APP_URL` to `https://${{RAILWAY_PUBLIC_DOMAIN}}`
   - `MAIL_API_URL` to `https://api.resend.com/emails`
   - `MAIL_API_KEY` to your Resend API key
   - `MAIL_FROM` to a sender address. `onboarding@resend.dev` works for testing, but only delivers to your own Resend account email. Verify a domain in Resend before inviting anyone else.
   - Affiliate templates, once a program approves you.
5. Deploy, then open `/api/health` on the new domain.

Signup is refused in production until the mail variables are set. Each deploy has a few seconds of downtime, because Railway does not let two deploys share a volume.
