import Link from "next/link";
import BallArt from "@/components/art/BallArt";
import ProductPhoto from "@/components/ProductPhoto";
import { PhotoCredit } from "@/components/MediaFrame";
import { getProduct, productLabel } from "@/lib/catalog";
import { productPhotos } from "@/lib/media";
import s from "./keeper-court.module.css";

const gear = [
  { slug: "nike-vapor-12", category: "shoe", label: "Shoes", style: "shoe" },
  {
    slug: "babolat-pure-aero-98-gen9",
    category: "racquet",
    label: "Racquets",
    style: "racquet",
  },
] as const;

/** A little tennis scene with two real destinations. All motion settles within 4.2 seconds. */
export default function KeeperCourt() {
  return (
    <figure className={s.figure} aria-label="The keeper court" data-home-court>
      <div className={s.court}>
        <span className={s.label}>The keeper court</span>
        <svg
          className={s.lines}
          viewBox="0 0 560 450"
          fill="none"
          aria-hidden="true"
        >
          <path d="M32 54H528V412H32ZM80 54V412M480 54V412M80 150H480M80 316H480M280 150V316" />
          <path d="M20 234H540" strokeDasharray="5 7" />
          <path
            className={s.trail}
            d="M28 364Q110 62 276 128T512 376"
            strokeDasharray="3 9"
          />
        </svg>
        {gear.map((item) => {
          const product = getProduct(item.slug)!;
          return (
            <div className={`${s.gear} ${s[item.style]}`} key={item.slug}>
              <div className={s.picture}>
                <ProductPhoto
                  product={product}
                  photo={productPhotos[item.slug]}
                  eager
                />
              </div>
              <Link
                href={`/gear?category=${item.category}`}
                className={s.destination}
                aria-label={`Explore ${item.label.toLowerCase()}`}
              >
                {item.label}
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
          );
        })}
        <span className={s.ball} aria-hidden="true" data-court-motion>
          <BallArt />
        </span>
        <span className={s.baseline} aria-hidden="true">
          Made for your kind of tennis.
        </span>
      </div>
      <figcaption className={s.credits}>
        <details>
          <summary>Product photos &amp; pictured models</summary>
          <div className={s.creditList}>
            {gear.map(({ slug }) => (
              <span key={slug}>
                <Link href={`/gear/${slug}`}>
                  {productLabel(getProduct(slug)!)}
                </Link>
                {" · "}
                <PhotoCredit photo={productPhotos[slug]} as="span" />
              </span>
            ))}
          </div>
        </details>
      </figcaption>
    </figure>
  );
}
