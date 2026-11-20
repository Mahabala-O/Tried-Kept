import type { CSSProperties, ReactNode } from "react";
import GiphyClip from "@/components/art/GiphyClip";
import PlayerArt from "@/components/art/PlayerArt";
import ResilientImage from "@/components/ResilientImage";
import ProductPhoto from "@/components/ProductPhoto";
import { getPro, type Product } from "@/lib/catalog";
import {
  gifEmbedUrl,
  photoSrcSet,
  productIllustrationSrc,
  productPhotos,
  proMedia,
  type Gif,
  type Photo,
} from "@/lib/media";

type FrameProps = {
  autoPlay?: boolean;
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
  photoFallbackSrc?: string;
  photoContent?: ReactNode;
  className?: string;
};

/** Commons serves these thumbnail widths without extra rendering. */
const COMMONS_WIDTHS = [330, 500, 960, 1280];

/** A srcset for a Commons 1280px thumbnail URL, or undefined for any other host. */
export function commonsSrcSet(photo: Photo): string | undefined {
  if (
    !photo.src.startsWith("https://upload.wikimedia.org/") ||
    !photo.src.includes("/1280px-")
  )
    return undefined;
  return COMMONS_WIDTHS.filter((w) => w <= photo.width)
    .map((w) => `${photo.src.replace("/1280px-", `/${w}px-`)} ${w}w`)
    .join(", ");
}

export function PhotoCredit({
  photo,
  note,
  as: Tag = "figcaption",
}: {
  photo: Photo;
  note?: string;
  as?: "figcaption" | "span";
}) {
  const { credit } = photo;
  if (credit.kind === "manufacturer") {
    return (
      <Tag className="media-credit">
        Product photo:{" "}
        <a href={credit.sourceUrl} target="_blank" rel="noopener noreferrer">
          {credit.author}
        </a>
        {photo.caption && <span className="media-note">{photo.caption}</span>}
        {note && <span className="media-note">{note}</span>}
      </Tag>
    );
  }
  return (
    <Tag className="media-credit">
      Photo: {credit.author} ·{" "}
      <a
        href={credit.licenseUrl}
        target="_blank"
        rel="noopener noreferrer license"
      >
        {credit.license}
      </a>{" "}
      ·{" "}
      <a href={credit.sourceUrl} target="_blank" rel="noopener noreferrer">
        Source
      </a>
      {note && <span className="media-note">{note}</span>}
    </Tag>
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

/** A resilient image for a credited photo, with smaller responsive files for phones. */
export function PhotoImg({
  photo,
  eager = false,
  sizes = "(min-width: 900px) 50vw, 100vw",
  fallbackSrc,
}: {
  photo: Photo;
  eager?: boolean;
  sizes?: string;
  fallbackSrc?: string;
}) {
  const srcSet = photoSrcSet(photo) ?? commonsSrcSet(photo);
  return (
    <ResilientImage
      src={photo.src}
      fallbackSrc={fallbackSrc}
      fallbackLabel={fallbackSrc ? "Illustration" : undefined}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      width={photo.width}
      height={photo.height}
      style={
        photo.objectPosition
          ? { objectPosition: photo.objectPosition }
          : undefined
      }
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
export default function MediaFrame({
  autoPlay,
  photo,
  gif,
  fallback,
  ratio,
  fit = "cover",
  eager = false,
  plain = false,
  sizes,
  note,
  photoFallbackSrc,
  photoContent,
  className,
}: FrameProps) {
  const classes = ["media-frame", plain ? "media-plain" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
  const media = gif ?? photo ?? null;
  const shape = ratio ?? (media ? `${media.width} / ${media.height}` : "4 / 3");
  const style = {
    "--ratio": shape,
    "--fit": fit,
    ...(photo?.credit.kind === "manufacturer"
      ? { backgroundColor: "#fff" }
      : {}),
  } as CSSProperties;

  if (gif) {
    const poster =
      photo ??
      Object.entries(proMedia).find(
        ([slug]) => getPro(slug)?.name === gif.playerName,
      )?.[1].portrait;
    return (
      <figure className={classes}>
        <div className="media-box" style={style}>
          <GiphyClip
            autoPlay={autoPlay}
            embedUrl={gifEmbedUrl(gif)}
            alt={gif.alt}
            playerName={gif.playerName}
            channel={gif.channel}
            posterSrc={poster?.src}
            posterAlt={poster?.alt}
            posterPosition={poster?.objectPosition}
            posterSrcSet={
              poster
                ? (photoSrcSet(poster) ?? commonsSrcSet(poster))
                : undefined
            }
            posterSizes={sizes ?? "(min-width: 900px) 50vw, 100vw"}
          />
        </div>
        <GifCredit gif={gif} note={note} />
        {poster && <PhotoCredit photo={poster} />}
      </figure>
    );
  }

  if (photo) {
    return (
      <figure className={classes}>
        <div className="media-box" style={style}>
          {photoContent ?? (
            <PhotoImg
              photo={photo}
              eager={eager}
              sizes={sizes}
              fallbackSrc={photoFallbackSrc}
            />
          )}
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
  children,
}: {
  product: Product;
  ratio?: string;
  eager?: boolean;
  plain?: boolean;
  className?: string;
  /** Compact row content. The credit and variant note stay below both columns. */
  children?: ReactNode;
}) {
  const photo = productPhotos[product.slug];
  return (
    <figure
      className={[
        "media-frame",
        children ? "product-media-row" : "",
        plain ? "media-plain" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <ProductVisual product={product} ratio={ratio} eager={eager} />
      {children && <div className="product-media-content">{children}</div>}
      {photo && <PhotoCredit photo={photo} />}
    </figure>
  );
}

/** Image-only building block; its callers provide the credit at a readable width. */
function ProductVisual({
  product,
  ratio,
  eager,
}: {
  product: Product;
  ratio: string;
  eager?: boolean;
}) {
  const photo = productPhotos[product.slug];
  return (
    <div
      className="media-box"
      style={{ "--ratio": ratio, "--fit": "contain" } as CSSProperties}
    >
      {photo ? (
        <ProductPhoto product={product} photo={photo} eager={eager} />
      ) : (
        <div
          className="art-frame"
          style={{ "--art-bg": "var(--cream)" } as CSSProperties}
        >
          <ResilientImage
            src={productIllustrationSrc(product.slug)}
            width={640}
            height={480}
            alt={`Illustration of ${product.brand} ${product.name}; not a product photo`}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
          />
          <span className="art-label" aria-hidden="true">
            <span className="art-label-long">Illustration</span>
            <span className="art-label-short">Art</span>
          </span>
        </div>
      )}
    </div>
  );
}

/** Side-by-side pictures with credits spanning the group, never a tiny image column. */
export function ProductImageStrip({
  products,
  className,
  children,
}: {
  products: Product[];
  className?: string;
  children?: ReactNode;
}) {
  return (
    <figure className={`media-frame product-media-strip ${className ?? ""}`}>
      <div
        className="product-media-visuals"
        style={{ "--n": Math.max(products.length, 1) } as CSSProperties}
      >
        {products.map((product) => (
          <ProductVisual key={product.slug} product={product} ratio="1 / 1" />
        ))}
        {children}
      </div>
      <figcaption className="product-media-credits">
        {products.map((product) => {
          const photo = productPhotos[product.slug];
          return photo ? (
            <div key={product.slug} className="media-credit">
              <strong>{product.name}:</strong>{" "}
              <PhotoCredit photo={photo} as="span" />
            </div>
          ) : null;
        })}
      </figcaption>
    </figure>
  );
}

/** Labeled original art of a generic player, never a likeness of a real one. */
export function PlayerIllustration({
  name,
  artBg = "#2457E6",
}: {
  name: string;
  artBg?: string;
}) {
  return (
    <div
      className="art-frame"
      style={{ "--art-bg": artBg } as CSSProperties}
      role="img"
      aria-label={`Illustration of a tennis player, not a photo of ${name}`}
    >
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
  autoPlay,
  slug,
  prefer = "photo",
  ratio = "1 / 1",
  eager,
  plain,
  className,
  note,
  artBg = "#2457E6",
}: {
  autoPlay?: boolean;
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
  const chosen =
    prefer === "gif" ? { gif, photo } : { gif: photo ? null : gif, photo };

  return (
    <MediaFrame
      autoPlay={autoPlay}
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
