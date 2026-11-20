import type { Product } from "./catalog";
import type { ProductPhoto } from "./product-photos";
import type { GearBrief } from "./editorial";

export const APPAREL_CHECKED = "2026-11-19";
// Exact retail variants, read from the linked manufacturer pages. These are not pro kit identifications.
const entries = [
  {
    key: "socks",
    slug: "nike-everyday-plus-cushioned-crew-6-pack",
    brand: "Nike",
    name: "Everyday Plus Cushioned Crew Socks (6 pairs)",
    category: "sock",
    line: "Unisex",
    sku: "SX6897-010",
    price: 28,
    color: "Black/White",
    summary:
      "A six-pair training pack with heel and forefoot padding. This is an everyday sports sock, not a tennis-specific or pro-issued model.",
    facts: [
      ["Height", "Crew"],
      ["Pack", "6 pairs"],
      ["Cushioning", "Heel & forefoot"],
      ["Fabric", "Cotton/polyester blend; percentages vary by color"],
    ],
    strengths: [
      "Padding under the heel and forefoot; reinforced heel and toe.",
      "A six-pair pack for a regular training rotation.",
    ],
    cautions: [
      "Training design; no independent tennis wear test is included.",
      "Material percentages vary by color; check the label and the sock\u2019s effect on shoe fit.",
    ],
    check:
      "Try them with your match shoes. Check toe space, heel hold and whether the added padding makes the shoe feel too tight.",
    src: "https://static.nike.com/a/images/t_PDP_480_v1/f_auto,q_auto:eco,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/0c7302c0-9d23-4170-bca0-e67dd522add4/U+NK+ED+PLS+CSH+CRW+6PR+-+132.png",
    url: "https://www.nike.com/t/everyday-plus-cushioned-training-crew-socks-6-pairs-xGOLbiOE/SX6897-010",
  },
  {
    key: "thorlo",
    slug: "thorlo-tx-maximum-cushion-crew",
    brand: "Thorlo",
    name: "TX Maximum Cushion Crew Tennis Socks",
    category: "sock",
    line: "Unisex",
    sku: "TX",
    price: 16.99,
    color: "White",
    summary:
      "A tennis-specific crew with thick padding, including over the toes. Check how that extra volume fits inside your shoes.",
    facts: [
      ["Height", "Crew"],
      ["Cushioning", "Maximum"],
      ["Fabric", "85% acrylic / 12% nylon / 3% elastic"],
      ["Made in", "USA, with domestic and imported yarns"],
    ],
    strengths: [
      "Tennis-specific padding extends over the toes.",
      "Crew height with a published size guide.",
    ],
    cautions: [
      "Maximum padding adds volume; check fit with your own shoes.",
      "The brand\u2019s protection claims are not an independent test or a guarantee against blisters.",
    ],
    check:
      "Wear them with your tennis shoes and do a few gentle split steps. Check toe room and heel movement before deciding whether the cushioning suits you.",
    src: "https://thorlo.com/cdn/shop/files/TX0000-white-1_1200x1200.jpg?v=1693593918",
    url: "https://thorlo.com/collections/mens-tennis-socks/products/tx0000-unisex-tennis-maximum-cushion-crew-socks",
  },
  {
    key: "top",
    slug: "nikecourt-victory-mens-tennis-top",
    brand: "Nike",
    name: "NikeCourt Victory Dri-FIT Tennis Top",
    category: "clothing",
    line: "Men's",
    sku: "IM6086-677",
    price: 38.97,
    color: "Team Red/Black/White",
    summary:
      "A standard-fit polyester tennis tee with a seam layout intended to allow the shoulders to move through a swing.",
    facts: [
      ["Fit", "Standard"],
      ["Fabric", "100% polyester"],
      ["Sleeves", "Short"],
      ["Care", "Machine wash"],
    ],
    strengths: [
      "Lightweight knit and Dri-FIT moisture management, according to Nike.",
      "Back shoulder seams are positioned for swinging and serving.",
    ],
    cautions: [
      "Manufacturer description only; drying speed has not been independently tested here.",
      "Check shoulder freedom and hem coverage in your own size.",
    ],
    check:
      "Raise both arms into a serve position and rotate through a forehand. Check whether the hem rides up or the shoulder seams pull.",
    src: "https://static.nike.com/a/images/t_PDP_480_v1/f_auto,q_auto:eco,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/c8733bc4-7897-467e-80e6-dbb707cb8554/M+NKCT+DF+VICTORY+TOP+PRT.png",
    url: "https://www.nike.com/t/nikecourt-victory-mens-dri-fit-tennis-top-Lt1JGkUU/IM6086-677",
  },
  {
    key: "shorts",
    slug: "nikecourt-advantage-6-inch-tennis-shorts",
    brand: "Nike",
    name: "NikeCourt Advantage 6-inch Tennis Shorts",
    category: "clothing",
    line: "Men's",
    sku: "IB1071-573",
    price: 65.97,
    color: "Dark Raisin/White",
    photo: 1,
    summary:
      "Six-inch woven tennis shorts with stretch, a drawcord waist and pockets designed to hold spare balls.",
    facts: [
      ["Inseam", "6 inches"],
      ["Fabric", "89% polyester / 11% spandex"],
      ["Pockets", "Mesh-lined; ball storage"],
      ["Waist", "Elastic with drawcord"],
    ],
    strengths: [
      "Four-way stretch woven fabric and a drawcord waist.",
      "Dedicated ball-storage pockets.",
    ],
    cautions: [
      "A six-inch inseam gives less coverage than longer tennis shorts.",
      "Ball retention and thigh freedom need checking in your own size.",
    ],
    check:
      "Put a tennis ball in each pocket, then squat and make a few gentle lateral steps. Check pocket bounce and whether the waistband stays secure.",
    src: "https://static.nike.com/a/images/t_PDP_480_v1/f_auto,q_auto:eco/5326c832-72b5-4b29-8a74-c4a91e0eb3be/M+NKCT+DF+ADVTG+SHRT+6IN+PRT.png",
    url: "https://www.nike.com/t/nikecourt-advantage-mens-dri-fit-6-tennis-shorts-vjtqRgZG/IB1071-573",
  },
  {
    key: "womensTop",
    slug: "nike-victory-womens-tennis-top",
    brand: "Nike",
    name: "Victory Dri-FIT Short-Sleeve Tennis Top",
    category: "clothing",
    line: "Women's",
    sku: "IB3776-010",
    price: 55,
    color: "Black/White",
    summary:
      "A slim-fit stretch top for tennis. The closer silhouette makes your own size and range-of-motion check especially useful.",
    facts: [
      ["Fit", "Slim"],
      ["Fabric", "79% polyester / 21% spandex"],
      ["Sleeves", "Short"],
      ["Care", "Machine wash"],
    ],
    strengths: [
      "Stretch fabric and Dri-FIT moisture management, according to Nike.",
      "A close-fitting silhouette rather than a loose training tee.",
    ],
    cautions: [
      "Slim fit may feel restrictive if you prefer more room.",
      "The listing does not establish independent comfort or drying performance.",
    ],
    check:
      "Try a serve reach and a full shoulder turn. Check the chest, armholes and hem while wearing the underlayers you use on court.",
    src: "https://static.nike.com/a/images/t_PDP_480_v1/f_auto,q_auto:eco/08a817ac-d6b8-4acb-a8c0-12454f554f13/W+NK+DF+VCTRY+SS+TOP.png",
    url: "https://www.nike.com/t/victory-womens-dri-fit-short-sleeve-tennis-top-ROlVhWwQ/IB3776-010",
  },
  {
    key: "skirt",
    slug: "nike-victory-high-waisted-tennis-skirt",
    brand: "Nike",
    name: "Victory High-Waisted Tennis Skirt",
    category: "clothing",
    line: "Women's",
    sku: "HV9951-010",
    price: 80,
    color: "Black/White",
    photo: 3,
    summary:
      "A pleated high-waisted tennis skirt with built-in shorts and pockets on both legs.",
    facts: [
      ["Fit", "Standard; high waist"],
      ["Liner", "Built-in stretch shorts"],
      ["Storage", "Pockets on both legs"],
      ["Fabric", "Polyester outer; polyester/spandex shorts"],
    ],
    strengths: [
      "Built-in shorts add coverage and storage.",
      "Two leg pockets for small essentials or spare balls.",
    ],
    cautions: [
      "Liner grip, waistband feel and length depend on your own fit.",
      "The page lists multiple fabric compositions; check the garment label.",
    ],
    check:
      "Try a low ready position, a serve reach and gentle side steps with a ball in the liner pocket. Check ride-up and waistband movement.",
    src: "https://static.nike.com/a/images/t_PDP_480_v1/f_auto,q_auto:eco,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/fadfb994-5401-47ff-8f38-3cf904dc7b0f/W+NK+DF+VCTRY+SKRT+HR+PLTED.png",
    url: "https://www.nike.com/t/victory-womens-dri-fit-high-waisted-tennis-skirt-SxOz9Os3",
  },
] as const;

export const apparelProducts: Product[] = entries.map((item) => {
  const source = { label: `${item.brand} · ${item.name}`, url: item.url };
  return {
    slug: item.slug,
    name: item.name,
    brand: item.brand,
    category: item.category,
    line: item.line,
    surface: null,
    wideVariant: false,
    priceUsd: item.price,
    priceCheckedOn: APPAREL_CHECKED,
    sku: item.sku,
    forefootWidthMm: null,
    weightG: null,
    cushioning: null,
    summary: item.summary,
    specs: [
      ...item.facts.map(([label, value]) => ({ label, value, source })),
      { label: "U.S. listed price", value: `$${item.price}`, source },
      { label: "Style", value: item.sku, source },
    ],
    offers: [
      {
        id: `${item.slug}-brand`,
        retailerId: item.brand === "Thorlo" ? "thorlo" : "nike",
        url: item.url,
        checkedOn: APPAREL_CHECKED,
      },
    ],
    sources: [source],
  };
});
export const apparelPhotos: Record<string, ProductPhoto> = Object.fromEntries(
  entries.map((item) => [
    item.slug,
    {
      src: item.src,
      width: item.key === "thorlo" ? 1200 : 480,
      height: item.key === "thorlo" ? 1200 : 600,
      alt: `${item.brand} ${item.name} in ${item.color}; manufacturer retail photo`,
      picturedVariant: `${item.sku} · ${item.color}`,
      checkedOn: APPAREL_CHECKED,
      credit: {
        kind: "manufacturer",
        author: item.brand,
        license: "Copyright retained by manufacturer",
        licenseUrl: item.url,
        sourceUrl: item.url,
      },
    },
  ]),
);
export const apparelBriefs: Record<string, GearBrief> = Object.fromEntries(
  entries.map((item) => [
    item.slug,
    {
      verdict:
        item.category === "sock"
          ? "Start with the sock–shoe fit."
          : "Check the fit through a full swing.",
      suits: item.summary,
      strengths: [...item.strengths],
      cautions: [...item.cautions],
      priorities: [],
      evidence: [
        {
          kind: "Manufacturer specification",
          summary:
            "Published construction and fit details. The try-on suggestions are editorial checks, not measured wear-test results.",
          source: { label: `${item.brand} · ${item.name}`, url: item.url },
        },
      ],
      tryThis: item.check,
    },
  ]),
);
