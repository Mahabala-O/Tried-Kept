import type { Metadata } from "next";
import Link from "next/link";
import BallArt from "@/components/art/BallArt";
import { PhotoImg } from "@/components/MediaFrame";
import ResilientImage from "@/components/ResilientImage";
import { getPro, getProduct } from "@/lib/catalog";
import { allCredits, homeMedia, proMedia, type CreditEntry, type Gif } from "@/lib/media";

export const metadata: Metadata = {
  title: "Credits",
  description: "Who made the photos and GIFs on Tried & Kept, and under which license.",
};

const rowStyle = { display: "grid", gridTemplateColumns: "88px minmax(0, 1fr)", gap: 14, alignItems: "start" } as const;
const thumbStyle = { position: "relative", width: 88, aspectRatio: "1 / 1", overflow: "hidden", borderRadius: 12 } as const;

function CreditLine({ entry }: { entry: CreditEntry }) {
  const { photo } = entry;
  const { credit } = photo;
  return (
    <li className="card" style={rowStyle}>
      <div className="media-box" style={thumbStyle}>
        <PhotoImg photo={photo} sizes="88px" />
      </div>
      <div className="stack" style={{ gap: 6 }}>
        <p>
          <strong>{entry.label}</strong> <span className="tag">{entry.usedOn}</span>
        </p>
        <p className="small muted" style={{ overflowWrap: "anywhere" }}>
          {photo.alt}
        </p>
        <p className="small muted">
          By {credit.author} ·{" "}
          <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer license">
            {credit.license}
          </a>{" "}
          ·{" "}
          <a href={credit.sourceUrl} target="_blank" rel="noopener noreferrer">
            Source
          </a>
        </p>
      </div>
    </li>
  );
}

/** Credit rows use the player's portrait or original court art as a visual. */
function GifLine({ gif, label, usedOn }: { gif: Gif; label: string; usedOn: string }) {
  const portrait = Object.entries(proMedia).find(([slug]) => getPro(slug)?.name === gif.playerName)?.[1].portrait;
  return (
    <li className="card" style={rowStyle}>
      <div className="media-box" style={thumbStyle}>
        {portrait ? <PhotoImg photo={portrait} sizes="88px" /> :
          <ResilientImage src="/media/tennis-court.svg" alt="Illustrated tennis court" width={88} height={88} loading="lazy" />}
      </div>
      <div className="stack" style={{ gap: 6 }}>
        <p>
          <strong>{label}</strong> <span className="tag">{usedOn}</span>
        </p>
        <p className="small muted" style={{ overflowWrap: "anywhere" }}>
          {gif.alt}
        </p>
        <p className="small muted">
          Published by {gif.channel} ·{" "}
          <a href={gif.pageUrl} target="_blank" rel="noopener noreferrer">
            View on GIPHY
          </a>
        </p>
      </div>
    </li>
  );
}

const listStyle = { listStyle: "none", margin: 0, padding: 0 } as const;

export default function CreditsPage() {
  const photos = allCredits({ pro: (slug) => getPro(slug)?.name, product: (slug) => getProduct(slug)?.name });
  const proGifs = Object.entries(proMedia).flatMap(([slug, media]) =>
    // The first clip also leads the pro spotlight on the home page.
    media.gifs.map((gif, i) => ({ gif, label: getPro(slug)?.name ?? gif.playerName ?? "Pro clip", usedOn: i === 0 ? "Pro and home pages" : "Pro page" })),
  );
  const homeGifs = homeMedia.gifs.map((gif) => ({ gif, label: gif.playerName ?? "In the stands" }));
  const nothingYet = photos.length === 0 && proGifs.length === 0 && homeGifs.length === 0;

  return (
    <div className="wrap page">
      <div className="stack">
        <span className="eyebrow">Credits</span>
        <h1>Who made the pictures</h1>
        <p className="lede">
          Every photo and GIF on this site is credited where it appears and listed here with its license. Pictures marked
          Illustration are original art made for this site, and never show a real product or person.
        </p>
      </div>

      {nothingYet && (
        <div className="card">
          <BallArt bounce className="credits-ball" />
          <h2>Nothing to credit yet</h2>
          <p className="muted">
            Right now every picture is original art. Licensed photos and GIFs will be listed here as they are added.
          </p>
        </div>
      )}

      {photos.length > 0 && (
        <section className="stack" aria-labelledby="photo-credits">
          <h2 id="photo-credits">Photos</h2>
          <ul className="grid" style={listStyle}>
            {photos.map((entry, i) => (
              <CreditLine key={`${entry.photo.credit.sourceUrl}-${i}`} entry={entry} />
            ))}
          </ul>
        </section>
      )}

      {proGifs.length > 0 && (
        <section className="stack" aria-labelledby="pro-gif-credits">
          <h2 id="pro-gif-credits">Pro GIFs</h2>
          <ul className="grid" style={listStyle}>
            {proGifs.map(({ gif, label, usedOn }) => (
              <GifLine key={gif.id} gif={gif} label={label} usedOn={usedOn} />
            ))}
          </ul>
        </section>
      )}

      {homeGifs.length > 0 && (
        <section className="stack" aria-labelledby="home-gif-credits">
          <h2 id="home-gif-credits">Home page GIFs</h2>
          <ul className="grid" style={listStyle}>
            {homeGifs.map(({ gif, label }) => (
              <GifLine key={gif.id} gif={gif} label={label} usedOn="Home page" />
            ))}
          </ul>
        </section>
      )}

      <p className="small muted">
        <Link href="/disclosure">How this site works</Link>, including where our facts come from.
      </p>
    </div>
  );
}
