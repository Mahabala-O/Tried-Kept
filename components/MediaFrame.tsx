import type { CSSProperties, ReactNode } from "react";
import GiphyClip from "@/components/art/GiphyClip";
import PlayerArt from "@/components/art/PlayerArt";
import ProductArt from "@/components/art/ProductArt";
import { getPro, type Product } from "@/lib/catalog";
import { gifEmbedUrl, productPhotos, proMedia, type Gif, type Photo } from "@/lib/media";

type FrameProps = {
  photo?: Photo | null;
  gif?: Gif | null;
  /** Shown when there is no photo or GIF. Use original art from components/art. */
  fallback: ReactNode;
  /** CSS aspect ratio such as "4 / 3". Defaults to the media's own shape, or 4 / 3 for art. */
  ratio?: string;
  /** How a photo fills the box. Product shots look best with contain. */
  fit?: "cover" | "contain";
  /** Load right away, for media above the fold. */
  eager?: boolean;
  /** Drop the box border, when the frame sits inside a bordered card. */
  plain?: boolean;
  /** The sizes attribute for a photo's srcset. */
  sizes?: string;
  /** A visible line under the credit, such as "Shows the player, not the gear". */
  note?: string;
  className?: string;
};

/** Commons serves these thumbnail widths without extra rendering. */
const COMMONS_WIDTHS = [330, 500, 960, 1280];

/** A srcset for a Commons 1280px thumbnail URL, or undefined for any other host. */
export function commonsSrcSet(photo: Photo): string | undefined {
  if (!photo.src.startsWith("https://upload.wikimedia.org/") || !photo.src.includes("/1280px-")) return undefined;
  return COMMONS_WIDTHS.filter((w) => w <= photo.width)
    .map((w) => `${photo.src.replace("/1280px-", `/${w}px-`)} ${w}w`)
    .join(", ");
}

export function PhotoCredit({ photo, note }: { photo: Photo; note?: string }) {
  const { credit } = photo;
  return (
    <figcaption className="media-credit">
      Photo: {credit.author} ·{" "}
      <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer license">
        {credit.license}
      </a>{" "}
      ·{" "}
      <a href={credit.sourceUrl} target="_blank" rel="noopener noreferrer">
        Source
      </a>
      {note && <span className="media-note">{note}</span>}
    </figcaption>
  );
}

export function GifCredit({ gif, note }: { gif: Gif; note?: string }) {
  return (
    <figcaption className="media-credit">
      <a href={gif.pageUrl} target="_blank" rel="noopener noreferrer">
        GIF via GIPHY · {gif.channel}
      </a>
      {note && <span className="media-note">{note}</span>}
    </figcaption>
  );
}

/** A plain img for a credited photo, with Commons' smaller widths for phones. */
export function PhotoImg({ photo, eager = false, sizes = "(min-width: 900px) 50vw, 100vw" }: { photo: Photo; eager?: boolean; sizes?: string }) {
  const srcSet = commonsSrcSet(photo);
  return (
    <img
      src={photo.src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      width={photo.width}
      height={photo.height}
      alt={photo.alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      referrerPolicy="no-referrer"
      {...(eager ? { fetchPriority: "high" as const } : {})}
    />
  );
}

/**
 * One box for any picture: a credited photo, a credited GIF, or original art.
 * The box keeps its aspect ratio before anything loads, so nothing shifts.
 */
export default function MediaFrame({ photo, gif, fallback, ratio, fit = "cover", eager = false, plain = false, sizes, note, className }: FrameProps) {
  const classes = ["media-frame", plain ? "media-plain" : "", className ?? ""].filter(Boolean).join(" ");
  const media = gif ?? photo ?? null;
  const shape = ratio ?? (media ? `${media.width} / ${media.height}` : "4 / 3");
  const style = { "--ratio": shape, "--fit": fit } as CSSProperties;

  if (gif) {
    return (
      <figure className={classes}>
        <div className="media-box" style={style}>
          <GiphyClip embedUrl={gifEmbedUrl(gif)} alt={gif.alt} playerName={gif.playerName} channel={gif.channel} />
        </div>
        <GifCredit gif={gif} note={note} />
      </figure>
    );
  }

  if (photo) {
    return (
      <figure className={classes}>
        <div className="media-box" style={style}>
          <PhotoImg photo={photo} eager={eager} sizes={sizes} />
        </div>
        <PhotoCredit photo={photo} note={note} />
      </figure>
    );
  }

  return (
    <div className={classes}>
      <div className="media-box" style={style}>
        {fallback}
      </div>
    </div>
  );
}

/** The exact model's photo when lib/media.ts has one, otherwise labeled original art. */
export function ProductImage({
  product,
  ratio = "4 / 3",
  eager,
  plain,
  className,
}: {
  product: Product;
  ratio?: string;
  eager?: boolean;
  plain?: boolean;
  className?: string;
}) {
  return (
    <MediaFrame
      photo={productPhotos[product.slug] ?? null}
      fallback={<ProductArt product={product} />}
      ratio={ratio}
      fit="contain"
      eager={eager}
      plain={plain}
      className={className}
    />
  );
}

/** Labeled original art of a generic player, never a likeness of a real one. */
export function PlayerIllustration({ name, artBg = "#2457E6" }: { name: string; artBg?: string }) {
  return (
    <div className="art-frame" style={{ "--art-bg": artBg } as CSSProperties} role="img" aria-label={`Illustration of a tennis player, not a photo of ${name}`}>
      <span className="art-label" aria-hidden="true">
        <span className="art-label-long">Illustration</span>
        <span className="art-label-short">Art</span>
      </span>
      <PlayerArt bg="none" />
    </div>
  );
}

/**
 * The pro's own GIF or portrait from lib/media.ts. With prefer="gif" a clip wins over the
 * portrait. With prefer="art", or without either, a generic illustrated player labeled as art.
 */
export function ProImage({
  slug,
  prefer = "photo",
  ratio = "1 / 1",
  eager,
  plain,
  className,
  note,
  artBg = "#2457E6",
}: {
  slug: string;
  prefer?: "photo" | "gif" | "art";
  /** Background behind the fallback illustration. */
  artBg?: string;
  ratio?: string;
  eager?: boolean;
  plain?: boolean;
  /** A visible line under the credit, shown only with a real photo or GIF. */
  note?: string;
  className?: string;
}) {
  const media = prefer === "art" ? undefined : proMedia[slug];
  const gif = media?.gifs[0] ?? null;
  const photo = media?.portrait ?? null;
  const name = getPro(slug)?.name ?? "this player";
  const chosen = prefer === "gif" ? { gif, photo: gif ? null : photo } : { gif: photo ? null : gif, photo };

  return (
    <MediaFrame
      gif={chosen.gif}
      photo={chosen.photo}
      ratio={ratio}
      eager={eager}
      plain={plain}
      note={note}
      className={className}
      fallback={<PlayerIllustration name={name} artBg={artBg} />}
    />
  );
}
