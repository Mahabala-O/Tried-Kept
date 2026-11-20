import { expandedProMedia } from "./expanded-media";
import { productPhotos } from "./product-photos";
export { productPhotos } from "./product-photos";

/**
 * Credited imagery. Every entry records who made it, its rights information, and
 * where it came from, and the UI shows that credit. Nothing here may show a
 * different model or person than the one it is attached to. When an entry is
 * missing, components fall back to original art from components/art.
 *
 * Photos: Wikimedia Commons files, license and author checked against the Commons
 * API on 2026-11-19. Photos are served locally as responsive WebP renditions,
 * with the original URL and author/license retained for provenance.
 *
 * GIFs: published on GIPHY by the official tournament or tour account named in
 * `channel`. They are shown only through GIPHY's own iframe embed (gifEmbedUrl),
 * the way GIPHY documents for showing a GIF on a site. We never hard-link,
 * proxy or re-host GIPHY's media files, and we always credit the channel and
 * link `pageUrl`. The footage rights stay with the tournaments and
 * broadcasters. Keep GIFs away from product claims.
 *
 * Products: manufacturer-hosted product photos retain their brand copyright and
 * source attribution. Entries without a verified match use local original art.
 */

export type Credit = {
  kind?: "manufacturer";
  author: string;
  /** Short license name, e.g. "CC BY-SA 4.0". */
  license: string;
  licenseUrl: string;
  /** Page where the file and its license can be checked. */
  sourceUrl: string;
};

export type Photo = {
  src: string;
  /** Original download URL, retained for provenance when a photo is served locally. */
  originalSrc?: string;
  width: number;
  height: number;
  alt: string;
  /** Visible qualification when the photo shows another colorway or a model within a line. */
  caption?: string;
  /** Preserve the subject when a portrait is displayed in a wider card. */
  objectPosition?: string;
  credit: Credit;
};

export type Gif = {
  id: string;
  width: number;
  height: number;
  alt: string;
  /** Official account that published it, e.g. "ATP Tour". */
  channel: string;
  /** Page on GIPHY to credit and link. */
  pageUrl: string;
  /** Who appears in it, when it is a specific player. */
  playerName?: string;
};

export type ProMedia = { portrait?: Photo; gifs: Gif[] };

const CC_BY_2 = { license: "CC BY 2.0", licenseUrl: "https://creativecommons.org/licenses/by/2.0/" };
const CC_BY_4 = { license: "CC BY 4.0", licenseUrl: "https://creativecommons.org/licenses/by/4.0/" };
const PD_USGOV = { license: "Public domain", licenseUrl: "https://commons.wikimedia.org/wiki/Template:PD-USGov" };
const CC_BY_SA_2 = { license: "CC BY-SA 2.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/" };
const CC_BY_SA_3 = { license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/" };
const CC_BY_SA_4 = { license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/" };

function giphy(
  id: string,
  pageSlug: string,
  width: number,
  height: number,
  channel: string,
  alt: string,
  playerName?: string,
): Gif {
  return {
    id,
    width,
    height,
    alt,
    channel,
    pageUrl: `https://giphy.com/gifs/${pageSlug}`,
    ...(playerName ? { playerName } : {}),
  };
}

/** GIPHY's own embed player for a GIF, the path GIPHY documents for showing a GIF on a site. */
export function gifEmbedUrl(gif: Pick<Gif, "id">): string {
  return `https://giphy.com/embed/${gif.id}`;
}

/** Keyed by pro slug from lib/catalog.ts. */
export const proMedia: Record<string, ProMedia> = {
  ...expandedProMedia,
  "carlos-alcaraz": {
    portrait: {
      src: "/media/photos/carlos-alcaraz-1280.webp",
      originalSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Carlos_Alcaraz_serving_while_playing_Jan-Lennard_Struff_%28Wimbledon_2025%29.jpg/1280px-Carlos_Alcaraz_serving_while_playing_Jan-Lennard_Struff_%28Wimbledon_2025%29.jpg",
      width: 1280,
      height: 720,
      alt: "Carlos Alcaraz in all-white kit tossing the ball up to serve on a sunlit Wimbledon grass court, his shadow stretching across the baseline",
      credit: {
        author: "12121343A",
        ...CC_BY_SA_4,
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Carlos_Alcaraz_serving_while_playing_Jan-Lennard_Struff_(Wimbledon_2025).jpg",
      },
    },
    gifs: [
      giphy(
        "fSdkcLNIRvZnZsnFa5",
        "tennistv-tennis-roar-alcaraz-fSdkcLNIRvZnZsnFa5",
        480,
        480,
        "Tennis TV",
        "Carlos Alcaraz, in an orange sleeveless top, screams 'vamos' in celebration as the crowd behind him cheers.",
        "Carlos Alcaraz",
      ),
      giphy(
        "1llUeASqGTEnFkAIer",
        "tennistv-tennis-roar-alcaraz-1llUeASqGTEnFkAIer",
        480,
        270,
        "Tennis TV",
        "Carlos Alcaraz, in a blue patterned shirt, roars and pumps his fist after winning a point at the Miami Open.",
        "Carlos Alcaraz",
      ),
      giphy(
        "PFyOHq6uzxlvjdaHFD",
        "usopen-sports-sport-us-open-tennis-PFyOHq6uzxlvjdaHFD",
        480,
        480,
        "US Open",
        "Carlos Alcaraz, in a pink sleeveless top, purses his lips and looks toward the camera at the US Open while fans in the stands raise their arms.",
        "Carlos Alcaraz",
      ),
      giphy(
        "3kOGJtGoZ80Q30OCjc",
        "wimbledon-tennis-wimbledon-final-championship-3kOGJtGoZ80Q30OCjc",
        480,
        268,
        "Wimbledon",
        "Carlos Alcaraz throws his arms wide toward his cheering player box on Centre Court after winning the 2024 Wimbledon men's final.",
        "Carlos Alcaraz",
      ),
    ],
  },
  "jannik-sinner": {
    portrait: {
      src: "/media/photos/jannik-sinner-1280.webp",
      originalSrc: "https://upload.wikimedia.org/wikipedia/commons/6/64/Jannik_Sinner_2025_US_Open.jpg",
      width: 1200,
      height: 1600,
      alt: "Jannik Sinner in a white cap and rust-red shirt, racquet raised beside his face, watching the ball during the 2025 US Open final",
      credit: {
        author: "The White House",
        ...PD_USGOV,
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Jannik_Sinner_2025_US_Open.jpg",
      },
    },
    gifs: [
      giphy(
        "hdTSiALy2nap2C5F9E",
        "wimbledon-jannik-sinner-wimbledon-2025-hdTSiALy2nap2C5F9E",
        480,
        270,
        "Wimbledon",
        "Jannik Sinner, in white, holds the Wimbledon men's trophy on Centre Court in 2025 as the crowd applauds behind him.",
        "Jannik Sinner",
      ),
      giphy(
        "0XnYEeYKNfywhv8xnG",
        "tennistv-sinner-jannik-pumped-0XnYEeYKNfywhv8xnG",
        450,
        450,
        "Tennis TV",
        "Jannik Sinner, in a white cap and shirt, clenches his fist and nods after winning a point on an indoor court.",
        "Jannik Sinner",
      ),
    ],
  },
  "casper-ruud": {
    portrait: {
      src: "/media/photos/casper-ruud-1280.webp",
      originalSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Casper_Ruud%2C_ATP_Basel_2025.jpg/1280px-Casper_Ruud%2C_ATP_Basel_2025.jpg",
      width: 1280,
      height: 720,
      alt: "Casper Ruud, in a white shirt and orange shorts, crouching low to play a forehand on the blue indoor court at the 2025 Swiss Indoors in Basel",
      credit: {
        author: "Skyscraper2010",
        ...CC_BY_SA_4,
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Casper_Ruud,_ATP_Basel_2025.jpg",
      },
    },
    gifs: [
      giphy(
        "i4gFRctIJzJzFXJQIk",
        "tennistv-tennis-rune-ruud-i4gFRctIJzJzFXJQIk",
        480,
        480,
        "Tennis TV",
        "Casper Ruud, in a lilac shirt, walks to the net to shake hands after a match on clay in Rome, with Holger Rune behind him.",
        "Casper Ruud",
      ),
    ],
  },
  "ben-shelton": {
    portrait: {
      src: "/media/photos/ben-shelton-1280.webp",
      originalSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Ben_Shelton_forehand.png/1280px-Ben_Shelton_forehand.png",
      width: 1280,
      height: 902,
      alt: "Ben Shelton, in grey with pink shoes, stretching low for a forehand on the blue indoor court in Basel",
      credit: {
        author: "LHC88",
        ...CC_BY_4,
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Ben_Shelton_forehand.png",
      },
    },
    gifs: [
      giphy(
        "I8fSr6sIkWv8y8CjpM",
        "tennistv-ben-shelton-celebration-phone-I8fSr6sIkWv8y8CjpM",
        450,
        450,
        "Tennis TV",
        "Ben Shelton, in a black sleeveless top, holds his hand to his ear like a phone and hangs up, his signature celebration.",
        "Ben Shelton",
      ),
    ],
  },
  "aryna-sabalenka": {
    portrait: {
      src: "/media/photos/aryna-sabalenka-1280.webp",
      originalSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Aryna_Sabalenka_at_2025_Miami_Open_01.jpg/1280px-Aryna_Sabalenka_at_2025_Miami_Open_01.jpg",
      width: 1280,
      height: 1006,
      alt: "Aryna Sabalenka, in a black top and grey skirt, lining up a forehand on a blue hard court at the 2025 Miami Open",
      credit: {
        author: "Vbrunophotog",
        ...CC_BY_SA_4,
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Aryna_Sabalenka_at_2025_Miami_Open_01.jpg",
      },
    },
    gifs: [
      giphy(
        "KGwcLGddYoH1qRTyEa",
        "wta-omg-celebration-yay-KGwcLGddYoH1qRTyEa",
        480,
        480,
        "WTA",
        "Aryna Sabalenka, wide-eyed and grinning, throws both arms up in a studio shoot against a grey backdrop.",
        "Aryna Sabalenka",
      ),
      giphy(
        "fxHPZ1W8eU74uo2CBd",
        "wta-tennis-sabalenka-aryna-fxHPZ1W8eU74uo2CBd",
        480,
        480,
        "WTA",
        "Aryna Sabalenka laughs and dances in a studio shoot against a grey backdrop.",
        "Aryna Sabalenka",
      ),
    ],
  },
  "coco-gauff": {
    portrait: {
      src: "/media/photos/coco-gauff-1280.webp",
      originalSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Gauff_-_US_Open_2026.jpg/1280px-Gauff_-_US_Open_2026.jpg",
      width: 1280,
      height: 1919,
      alt: "Coco Gauff, in a pale yellow top, fully stretched to serve on Arthur Ashe Stadium at the 2026 US Open as fans watch from the stands",
      credit: {
        author: "Nrbelex",
        ...CC_BY_SA_4,
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Gauff_-_US_Open_2026.jpg",
      },
    },
    gifs: [
      giphy(
        "fUkgo7VXRXyCfMAPyQ",
        "tennischannel-coco-gauff-fUkgo7VXRXyCfMAPyQ",
        480,
        270,
        "Tennis Channel",
        "Coco Gauff, in navy, looks up and steadies herself between points on the clay at Roland-Garros.",
        "Coco Gauff",
      ),
    ],
  },
  "iga-swiatek": {
    portrait: {
      src: "/media/photos/iga-swiatek-1280.webp",
      objectPosition: "50% 10%",
      originalSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Iga_%C5%9Awi%C4%85tek_%282023_US_Open%29_39_%28cropped%29.jpg/1280px-Iga_%C5%9Awi%C4%85tek_%282023_US_Open%29_39_%28cropped%29.jpg",
      width: 1280,
      height: 1646,
      alt: "Iga Swiatek, in a light blue cap and black kit, turning her shoulders with her left arm out as she sets up a shot at the 2023 US Open",
      credit: {
        author: "Hameltion",
        ...CC_BY_SA_4,
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Iga_%C5%9Awi%C4%85tek_(2023_US_Open)_39_(cropped).jpg",
      },
    },
    gifs: [
      giphy(
        "QgyaSoPPzLX8RveoyT",
        "wimbledon-wimbledon-2025-iga-witek-QgyaSoPPzLX8RveoyT",
        480,
        270,
        "Wimbledon",
        "Iga Swiatek, in a white cap, kisses the Venus Rosewater Dish after winning the 2025 Wimbledon women's title.",
        "Iga Swiatek",
      ),
      giphy(
        "Piz7JsGtqaUZbYhwcK",
        "wta-tennis-iga-swiatek-Piz7JsGtqaUZbYhwcK",
        480,
        480,
        "WTA",
        "Iga Swiatek, in a black sleeveless top, grins and gives two shaka signs in a studio shoot.",
        "Iga Swiatek",
      ),
    ],
  },
  "elena-rybakina": {
    portrait: {
      src: "/media/photos/elena-rybakina-1280.webp",
      originalSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Elena_Rybakina_-_Roland_Garros_2025_-_backhand_wide.jpg/1280px-Elena_Rybakina_-_Roland_Garros_2025_-_backhand_wide.jpg",
      width: 1280,
      height: 960,
      alt: "Elena Rybakina, in a navy dress and white visor, swinging a two-handed backhand on the clay at Roland-Garros 2025",
      credit: {
        author: "Kuberzog",
        ...CC_BY_SA_4,
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Elena_Rybakina_-_Roland_Garros_2025_-_backhand_wide.jpg",
      },
    },
    gifs: [
      giphy(
        "IN8Dh8LIrBOtNUcfXQ",
        "tennischannel-IN8Dh8LIrBOtNUcfXQ",
        480,
        270,
        "Tennis Channel",
        "Wide view of Elena Rybakina at the far baseline during her Wimbledon match against Alize Cornet, who is recovering near the net.",
        "Elena Rybakina",
      ),
    ],
  },
};




/** Every catalog product has an image file; these are illustrations, not photos. */
export function productIllustrationSrc(slug: string): string {
  return `/media/products/${slug}.svg`;
}

/** Locally hosted photo sizes avoid external thumbnail rate limits. */
export function photoSrcSet(photo: Photo): string | undefined {
  if (!photo.src.startsWith("/media/photos/") || !photo.src.endsWith("-1280.webp")) return undefined;
  return [320, 640, 1280].filter(w => w <= photo.width)
    .map(w => `${photo.src.replace("-1280.webp", `-${w}.webp`)} ${w}w`).join(", ");
}

/** General tennis moments for the home page. Not tied to any product claim. */
export const homeMedia: { gifs: Gif[]; photos: Photo[] } = {
  gifs: [
    giphy(
      "Q9lA26CjFnbNbhCSNy",
      "wta-tennis-pumped-muguruza-Q9lA26CjFnbNbhCSNy",
      480,
      480,
      "WTA",
      "Garbine Muguruza pumps her fist and shouts in celebration on a blue US Open court.",
      "Garbine Muguruza",
    ),
    giphy(
      "bk0g3Mu6Sq6DvMRUfH",
      "wimbledon-excited-fan-what-a-catch-bk0g3Mu6Sq6DvMRUfH",
      480,
      270,
      "Wimbledon",
      "A delighted spectator at Wimbledon 2021 catches a tennis ball one-handed in the stands as the people around her applaud.",
    ),
    giphy(
      "ZCNx2Xy2V4QiZYUkFH",
      "wimbledon-tennis-bautista-agut-roberto-ZCNx2Xy2V4QiZYUkFH",
      480,
      270,
      "Wimbledon",
      "Roberto Bautista Agut leaps off the grass to hit an overhead on a sunny Wimbledon court in front of a full crowd.",
      "Roberto Bautista Agut",
    ),
    giphy(
      "DCXYam1LyChrp5nwLK",
      "Roland-Garros-tennis-paris-roland-garros-DCXYam1LyChrp5nwLK",
      480,
      270,
      "Roland-Garros",
      "Stefanos Tsitsipas clenches his fist in celebration during a night match at Roland-Garros 2021.",
      "Stefanos Tsitsipas",
    ),
    giphy(
      "2iR29Hbqxfu35LwzTX",
      "wimbledon-tennis-wimbledon-final-championship-2iR29Hbqxfu35LwzTX",
      480,
      272,
      "Wimbledon",
      "Spectators in the Wimbledon stands clap and wave an Italian flag during the 2024 women's final.",
    ),
    // Largest clip (about 1.7 MB), so it stays last.
    giphy(
      "KB87xZJNiIe8ezaf5c",
      "wimbledon-celebration-roger-federer-KB87xZJNiIe8ezaf5c",
      480,
      270,
      "Wimbledon",
      "Roger Federer raises his hand to a packed Wimbledon crowd as fans on their feet clap, cheer and film the moment.",
      "Roger Federer",
    ),
  ],
  photos: [
    {
      src: "/media/photos/bryan-brothers-1280.webp",
      originalSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/The_Bryan_Brothers_triumphant_at_the_US_Open_%289662618045%29.jpg/1280px-The_Bryan_Brothers_triumphant_at_the_US_Open_%289662618045%29.jpg",
      width: 1280,
      height: 853,
      alt: "Bob and Mike Bryan, in matching yellow shirts, leap into a mid-air chest bump on a blue US Open hard court while their opponents stand at the net",
      credit: {
        author: "Boss Tweed",
        ...CC_BY_2,
        sourceUrl: "https://commons.wikimedia.org/wiki/File:The_Bryan_Brothers_triumphant_at_the_US_Open_(9662618045).jpg",
      },
    },
    {
      src: "/media/photos/clay-ball-1280.webp",
      originalSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Roland_Garros_2013_-_balle_de_match.jpg/1280px-Roland_Garros_2013_-_balle_de_match.jpg",
      width: 1280,
      height: 960,
      alt: "A yellow Roland-Garros tennis ball resting on the white baseline of an orange clay court in dappled sunlight",
      credit: {
        author: "Yann Caradec",
        ...CC_BY_SA_2,
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Roland_Garros_2013_-_balle_de_match.jpg",
      },
    },
    {
      src: "/media/photos/kei-nishikori-1280.webp",
      originalSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Kei_Nishikori_1%2C_Wimbledon_2013_-_Diliff.jpg/1280px-Kei_Nishikori_1%2C_Wimbledon_2013_-_Diliff.jpg",
      width: 1280,
      height: 1920,
      alt: "Kei Nishikori, in white with a headband, lunging full stretch for a low forehand on a Wimbledon grass court, the ball just off his strings",
      credit: {
        author: "Diliff",
        ...CC_BY_SA_3,
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Kei_Nishikori_1,_Wimbledon_2013_-_Diliff.jpg",
      },
    },
    {
      src: "/media/photos/guillaume-rufin-1280.webp",
      originalSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/2013_Australian_Open_-_Guillaume_Rufin.jpg/1280px-2013_Australian_Open_-_Guillaume_Rufin.jpg",
      width: 1280,
      height: 1920,
      alt: "Guillaume Rufin, in a bright yellow shirt, arching back to serve on the blue hard court of Rod Laver Arena, with the ball high above and the crowd in the stands behind",
      credit: {
        author: "Brendan Dennis",
        ...CC_BY_SA_3,
        sourceUrl: "https://commons.wikimedia.org/wiki/File:2013_Australian_Open_-_Guillaume_Rufin.jpg",
      },
    },
    {
      src: "/media/photos/blue-balls-1280.webp",
      originalSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Blue_%2845135693732%29.jpg/1280px-Blue_%2845135693732%29.jpg",
      width: 960,
      height: 1439,
      alt: "A wall of bright blue tennis balls lined up in neat rows against a purple backdrop at the 2018 US Open",
      credit: {
        author: "Carine06",
        ...CC_BY_SA_2,
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Blue_(45135693732).jpg",
      },
    },
    {
      src: "/media/photos/alcaraz-clay-1280.webp",
      originalSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Carlos_Alcaraz_-_Roland_Garros_2025_-_serving.jpg/1280px-Carlos_Alcaraz_-_Roland_Garros_2025_-_serving.jpg",
      width: 1280,
      height: 853,
      alt: "Carlos Alcaraz in a black-and-white striped shirt and black shorts reaching up to serve on the orange clay at Roland-Garros 2025",
      credit: {
        author: "Kuberzog",
        ...CC_BY_SA_4,
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Carlos_Alcaraz_-_Roland_Garros_2025_-_serving.jpg",
      },
    },
  ],
};

export type CreditEntry = {
  /** Who or what the picture shows, for a heading. */
  label: string;
  photo: Photo;
  /** Where on the site it appears. */
  usedOn: string;
};

/**
 * Every photo the site renders, labeled with a display name. Names come from
 * `names` (slug to name), so this file does not need to import the catalog.
 */
export function allCredits(names: { pro?: (slug: string) => string | undefined; product?: (slug: string) => string | undefined } = {}): CreditEntry[] {
  const out: CreditEntry[] = [];
  for (const [slug, media] of Object.entries(proMedia)) {
    if (media.portrait) out.push({ label: names.pro?.(slug) ?? slug, photo: media.portrait, usedOn: "Pro page" });
  }
  for (const [slug, photo] of Object.entries(productPhotos)) {
    out.push({ label: names.product?.(slug) ?? slug, photo, usedOn: "Product page" });
  }
  for (const photo of homeMedia.photos) out.push({ label: "On court", photo, usedOn: "Home page" });
  return out;
}
