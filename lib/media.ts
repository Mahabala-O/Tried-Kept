/**
 * Licensed imagery. Every entry records who made it, under which license, and
 * where it came from, and the UI shows that credit. Nothing here may show a
 * different model or person than the one it is attached to. When an entry is
 * missing, components fall back to original art from components/art.
 *
 * Photos: Wikimedia Commons files, license and author checked against the Commons
 * API on 2026-11-19. Each src is the 1280px rendition, loaded straight from
 * upload.wikimedia.org; MediaFrame adds a srcset of Commons' standard widths.
 *
 * GIFs: published on GIPHY by the official tournament or tour account named in
 * `channel`. They are shown only through GIPHY's own iframe embed (gifEmbedUrl),
 * the way GIPHY documents for showing a GIF on a site. We never hard-link,
 * proxy or re-host GIPHY's media files, and we always credit the channel and
 * link `pageUrl`. The footage rights stay with the tournaments and
 * broadcasters. Keep GIFs away from product claims.
 *
 * Products: no photo of an exact catalog model and generation was found under an
 * open license, so productPhotos is empty and product pages use original art.
 */

export type Credit = {
  author: string;
  /** Short license name, e.g. "CC BY-SA 4.0". */
  license: string;
  licenseUrl: string;
  /** Page where the file and its license can be checked. */
  sourceUrl: string;
};

export type Photo = {
  src: string;
  width: number;
  height: number;
  alt: string;
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
  "carlos-alcaraz": {
    portrait: {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Carlos_Alcaraz_serving_while_playing_Jan-Lennard_Struff_%28Wimbledon_2025%29.jpg/1280px-Carlos_Alcaraz_serving_while_playing_Jan-Lennard_Struff_%28Wimbledon_2025%29.jpg",
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
};

/** Keyed by product slug. Only a photo of that exact model belongs here. */
export const productPhotos: Record<string, Photo> = {};

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
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/The_Bryan_Brothers_triumphant_at_the_US_Open_%289662618045%29.jpg/1280px-The_Bryan_Brothers_triumphant_at_the_US_Open_%289662618045%29.jpg",
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
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Roland_Garros_2013_-_balle_de_match.jpg/1280px-Roland_Garros_2013_-_balle_de_match.jpg",
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
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Kei_Nishikori_1%2C_Wimbledon_2013_-_Diliff.jpg/1280px-Kei_Nishikori_1%2C_Wimbledon_2013_-_Diliff.jpg",
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
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/2013_Australian_Open_-_Guillaume_Rufin.jpg/1280px-2013_Australian_Open_-_Guillaume_Rufin.jpg",
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
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Blue_%2845135693732%29.jpg/1280px-Blue_%2845135693732%29.jpg",
      width: 1280,
      height: 1918,
      alt: "A wall of bright blue tennis balls lined up in neat rows against a purple backdrop at the 2018 US Open",
      credit: {
        author: "Carine06",
        ...CC_BY_SA_2,
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Blue_(45135693732).jpg",
      },
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Carlos_Alcaraz_-_Roland_Garros_2025_-_serving.jpg/1280px-Carlos_Alcaraz_-_Roland_Garros_2025_-_serving.jpg",
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
