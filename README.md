# Tried & Kept

A focused tennis gear guide with two public sections: **Catalogue** and **Pros**. Browsing, reading evidence and comparing products do not require an account.

## Public hierarchy

- **Catalogue** `/gear` → a product → its strengths, cautions, sourced facts and retailer links. Comparisons are a tool within the catalogue: `/gear/compare` and `/gear/compare/[slug]`.
- **Pros** `/pros` → a player's equipment and wardrobe → their documented gear stories at `/pros/[slug]/stories/[story]`.

The main navigation contains Catalogue and Pros; the mobile bar adds Home. There is no public login, locker, community, game, report or standalone planner promotion. Existing account data and the account/report backend remain intact for previously saved links. `/discover` and `/switch` return to a relevant pro or product. Older story and comparison URLs redirect to their new canonical locations. The sitemap lists the editorial catalogue and pro pages; account, community and game routes carry noindex metadata.

Twenty-two models have attributed strengths, cautions and try-on or demo checks in the editorial library. Sources distinguish lab testing, retailer playtests, manufacturer statements and individual forum accounts. Preserve those boundaries when adding evidence. Shoe sizing lines, surfaces and racquet measurement bases stay separate. Missing facts remain labeled.

Compact product cards use `ProductImage` with adjacent content as children. Credits and variant notes span the entire row; never put a complete credited figure in a fixed-width thumbnail column. `ProductImageStrip` keeps grouped photo credits full-width. Layout QA should inspect readable column widths and card shapes in addition to document overflow.

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

Run the browser regression suite after a production build:

```bash
npx playwright install chromium webkit
npm run test:browser
```

It starts a local production server with a throwaway database under the system temporary directory. Chromium and WebKit check six widths from 320 to 1280 pixels, full-width captions, enlarged text, navigation targets, comparison choices, category compatibility, the two-section hierarchy and legacy-link redirects. `BROWSER_BASE_URL` can target an already running deployment; these browser tests do not create accounts or submit reports.

## Add affiliate links

Retailer buttons pass through `/go/[offerId]`, which counts the click and redirects. Once a program approves you, copy `.env.example` to `.env.local` and set that retailer's template. `{url}` is replaced with the encoded product page:

```
AFFILIATE_TEMPLATE_NIKE=https://your-network.example/click?id=YOUR_ID&u={url}
```

Without a template, the button goes to the plain retailer page and earns nothing. To add a retailer, add it to `retailers` in `lib/catalog.ts`, then add offers to its products.

## Add gear and pros

The seed catalog lives in `lib/catalog.ts`; the November 19 expansion is in `lib/catalog-expansion.ts`, with focused comparisons in `lib/comparison-library.ts`. Leave a value `null` when you have no source for it, and the app labels it as a gap. Pro gear needs a date, source and evidence label. A checked brand listing is not a match observation. `familyAlternative` marks retail alternatives that must be excluded from model-reference counts.

## Images and GIFs

`lib/media.ts` records portraits, GIFs, image credits, and original photo URLs. All 20 catalog pros have a credited photograph; the original eight also retain official-channel GIFs. New profiles do not receive unrelated clips just to fill a slot. The 26 licensed photos are served from `public/media/photos` as WebP images at 320, 640, and 1280 pixels; credits remain next to each image and on `/credits`.

Manufacturer-hosted photos for 31 products are recorded in `lib/product-photos.ts`, with source links, checked dates, and pictured variants. These retain manufacturer copyright and are not presented as open-license photos. Different colorways and representative models within a racquet line are explicitly captioned.

All 37 products also have a labelled original illustration in `public/media/products`, used when there is no verified photo or a remote image fails. Regenerate these from the editable drawing components after adding products:

```bash
node scripts/export-product-art.mjs
```

Product photos use measured foreground bounds from `lib/product-framing.json` so source margins do not shrink the product. Neutral studio backgrounds blend into the shared warm card background; racquets are angled to use the tile better while preserving the whole product. These are display adjustments; original photographs stay unchanged. To measure a new source, download it for analysis, then run `node scripts/analyze-product-photo.mjs <slug> <local-image> <source-url> -32` for a racquet (omit the final angle for a shoe). Measurements are ignored if the source URL changes.

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

## The first useful moment

The v1 hypothesis is: “I understand what this model does well, what I would give up, and what to compare it with.” A pro's equipment and story can start that exploration; the catalogue supplies the practical detail. Avoid adding a separate questionnaire or account gate to this journey.

Test with five recreational players on a phone: start from a model or pro, reach a useful product comparison, and explain one benefit and one compromise within a minute. This is an unvalidated usability target. Revisit saved collections or community only when repeat visitors demonstrate a need and there is a practical plan to sustain contributions and moderation.

The library contains 20 selected pro profiles. Reference counts include checked brand associations and exclude family alternatives; they are not tour-wide usage or sales rankings.
