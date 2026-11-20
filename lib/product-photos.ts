import { expandedProductPhotos } from "./expanded-media";
import { apparelPhotos } from "./apparel";
/** Manufacturer-hosted product photography, checked 2026-11-19.
 * Copyright stays with the named brand; these are not Creative Commons images.
 * Keep the source attribution and pictured-variant notes with each image.
 */
import type { Photo } from "./media";

export type ProductPhoto = Photo & { picturedVariant: string; checkedOn: string };

export const productPhotos: Record<string, ProductPhoto> = {
  ...apparelPhotos,
  ...expandedProductPhotos,
  "nike-vapor-12": {
      "src": "https://static.nike.com/a/images/t_default/5a7432d7-57c1-4541-841a-50aec9bccc41/M+ZOOM+VAPOR+12+HC.png",
      "width": 400,
      "height": 400,
      "alt": "Nike vapor 12 product photograph — FV5552-001 · Black/Dark Smoke Grey/White",
      "picturedVariant": "FV5552-001 · Black/Dark Smoke Grey/White",
      "checkedOn": "2026-11-19",
      "credit": {
          "kind": "manufacturer",
          "author": "Nike",
          "license": "Copyright retained by manufacturer",
          "licenseUrl": "https://www.nike.com/t/vapor-12-mens-hard-court-tennis-shoes-45fp1Une/FV5552-001",
          "sourceUrl": "https://www.nike.com/t/vapor-12-mens-hard-court-tennis-shoes-45fp1Une/FV5552-001"
      },
      "caption": "Pictured: FV5552-001. The recorded specifications and price refer to FV5552-003."
  },
  "nike-vapor-pro-3": {
      "src": "https://static.nike.com/a/images/t_default/c30cc9fd-e597-4b85-82f9-4f69bd396aeb/M+ZOOM+VAPOR+PRO+3+HC.png",
      "width": 400,
      "height": 400,
      "alt": "Nike vapor pro 3 product photograph — FZ2161-101 · White/Black",
      "picturedVariant": "FZ2161-101 · White/Black",
      "checkedOn": "2026-11-19",
      "credit": {
          "kind": "manufacturer",
          "author": "Nike",
          "license": "Copyright retained by manufacturer",
          "licenseUrl": "https://www.nike.com/t/vapor-pro-3-mens-hard-court-tennis-shoes-SpZRz675/FZ2161-101",
          "sourceUrl": "https://www.nike.com/t/vapor-pro-3-mens-hard-court-tennis-shoes-SpZRz675/FZ2161-101"
      }
  },
  "nike-gp-challenge-1-5": {
      "src": "https://static.nike.com/a/images/t_default/fbf09f61-e365-4db1-b6a8-3231c63abd3a/M+ZOOM+GP+CHALLENGE+1.5+HC.png",
      "width": 400,
      "height": 400,
      "alt": "Nike gp challenge 1 5 product photograph — IQ5180-002 · Smoky Blue/Light Bone/New Slate/White",
      "picturedVariant": "IQ5180-002 · Smoky Blue/Light Bone/New Slate/White",
      "checkedOn": "2026-11-19",
      "credit": {
          "kind": "manufacturer",
          "author": "Nike",
          "license": "Copyright retained by manufacturer",
          "licenseUrl": "https://www.nike.com/gb/t/gp-challenge-1-5-mens-hard-court-tennis-shoes-RDcr7rh6/IQ5180-002",
          "sourceUrl": "https://www.nike.com/gb/t/gp-challenge-1-5-mens-hard-court-tennis-shoes-RDcr7rh6/IQ5180-002"
      }
  },
  "asics-gel-resolution-x-wide-mens": {
      "src": "https://images.asics.com/is/image/asics/1041A487_104_SL_LT_GLB?$sfcc-product$=",
      "width": 683,
      "height": 512,
      "alt": "ASICS gel resolution x wide mens product photograph — 1041A487-104 · Men’s wide · White/Dark Aubergine",
      "picturedVariant": "1041A487-104 · Men’s wide · White/Dark Aubergine",
      "checkedOn": "2026-11-19",
      "credit": {
          "kind": "manufacturer",
          "author": "ASICS",
          "license": "Copyright retained by manufacturer",
          "licenseUrl": "https://www.asics.com/us/en-us/gel-resolution-x-wide/p/ANA_1041A487-104.html",
          "sourceUrl": "https://www.asics.com/us/en-us/gel-resolution-x-wide/p/ANA_1041A487-104.html"
      }
  },
  "asics-gel-resolution-x-wide-womens": {
      "src": "https://images.asics.com/is/image/asics/1042A278_102_SL_LT_GLB?$sfcc-product$=",
      "width": 683,
      "height": 512,
      "alt": "ASICS gel resolution x wide womens product photograph — 1042A278-102 · Women’s wide · White/Monument Blue",
      "picturedVariant": "1042A278-102 · Women’s wide · White/Monument Blue",
      "checkedOn": "2026-11-19",
      "credit": {
          "kind": "manufacturer",
          "author": "ASICS",
          "license": "Copyright retained by manufacturer",
          "licenseUrl": "https://www.asics.com/us/en-us/gel-resolution-x-wide/p/ANA_1042A278-102.html",
          "sourceUrl": "https://www.asics.com/us/en-us/gel-resolution-x-wide/p/ANA_1042A278-102.html"
      }
  },
  "asics-gel-resolution-9": {
      "src": "https://assets.asics.com/system/media_libraries/18598/file.JPG",
      "width": 877,
      "height": 375,
      "alt": "ASICS gel resolution 9 product photograph — GEL-Resolution 9 · launch colorway",
      "picturedVariant": "GEL-Resolution 9 · launch colorway",
      "checkedOn": "2026-11-19",
      "credit": {
          "kind": "manufacturer",
          "author": "ASICS",
          "license": "Copyright retained by manufacturer",
          "licenseUrl": "https://corp.asics.com/jp/press/article/2022-12-13-1",
          "sourceUrl": "https://corp.asics.com/jp/press/article/2022-12-13-1"
      }
  },
  "asics-solution-speed-ff-4": {
      "src": "https://assets.asics.com/system/media_libraries/25394/file.jpg",
      "width": 3307,
      "height": 2408,
      "alt": "ASICS solution speed ff 4 product photograph — SOLUTION SPEED FF 4 · 1041A532",
      "picturedVariant": "SOLUTION SPEED FF 4 · 1041A532",
      "caption": "Pictured: manufacturer launch colorway. Recorded U.S. price and SKU refer to White/Black 1041A532-100.",
      "checkedOn": "2026-11-19",
      "credit": {
          "kind": "manufacturer",
          "author": "ASICS",
          "license": "Copyright retained by manufacturer",
          "licenseUrl": "https://corp3.asics.com/jp/press/article/2026-01-08_solution-speed-ff-4",
          "sourceUrl": "https://corp3.asics.com/jp/press/article/2026-01-08_solution-speed-ff-4"
      }
  },
  "yonex-ezone-98-2025": {
      "src": "https://us.yonex.com/cdn/shop/files/ALL_08EZ98_839-1.jpg?v=1786149524&width=960",
      "width": 960,
      "height": 1143,
      "alt": "Yonex ezone 98 2025 product photograph — 08EZ98 · 8th generation · Espresso Brown",
      "picturedVariant": "08EZ98 · 8th generation · Espresso Brown",
      "checkedOn": "2026-11-19",
      "credit": {
          "kind": "manufacturer",
          "author": "Yonex",
          "license": "Copyright retained by manufacturer",
          "licenseUrl": "https://us.yonex.com/products/ezone-98",
          "sourceUrl": "https://us.yonex.com/products/ezone-98"
      }
  },
  "yonex-ezone-100": {
      "src": "https://us.yonex.com/cdn/shop/files/ALL_08EZ100_839-1.jpg?v=1785871338&width=960",
      "width": 960,
      "height": 1143,
      "alt": "Yonex ezone 100 product photograph — 08EZ100 · Espresso Brown",
      "picturedVariant": "08EZ100 · Espresso Brown",
      "checkedOn": "2026-11-19",
      "credit": {
          "kind": "manufacturer",
          "author": "Yonex",
          "license": "Copyright retained by manufacturer",
          "licenseUrl": "https://us.yonex.com/products/ezone-100",
          "sourceUrl": "https://us.yonex.com/products/ezone-100"
      }
  },
  "yonex-eclipsion-5": {
      "src": "https://us.yonex.com/cdn/shop/files/ALL_SHTE5MAC_115-1.jpg?v=1787870486&width=960",
      "width": 960,
      "height": 1143,
      "alt": "Yonex eclipsion 5 product photograph — SHTE5MAC · Men’s all-court",
      "picturedVariant": "SHTE5MAC · Men’s all-court",
      "checkedOn": "2026-11-19",
      "credit": {
          "kind": "manufacturer",
          "author": "Yonex",
          "license": "Copyright retained by manufacturer",
          "licenseUrl": "https://us.yonex.com/products/eclipsion-5-mens-2026",
          "sourceUrl": "https://us.yonex.com/products/eclipsion-5-mens-2026"
      }
  },
  "k-swiss-hypercourt-express-2": {
      "src": "https://kswiss.com/cdn/shop/files/06613-102-m-hypercourt-express-2-whiteblack-2800154.png?v=1775215043&width=960",
      "width": 960,
      "height": 720,
      "alt": "K-Swiss hypercourt express 2 product photograph — 06613-102-M · White/Black",
      "picturedVariant": "06613-102-M · White/Black",
      "checkedOn": "2026-11-19",
      "credit": {
          "kind": "manufacturer",
          "author": "K-Swiss",
          "license": "Copyright retained by manufacturer",
          "licenseUrl": "https://kswiss.com/products/06613-102-m",
          "sourceUrl": "https://kswiss.com/products/06613-102-m"
      }
  },
  "k-swiss-hypercourt-express-3": {
      "src": "https://kswiss.com/cdn/shop/files/04603-002-m-hypercourt-express-3-blackwhite-6055812.png?v=1775199812&width=960",
      "width": 960,
      "height": 720,
      "alt": "K-Swiss hypercourt express 3 product photograph — 04603-002-M · Black/White",
      "picturedVariant": "04603-002-M · Black/White",
      "checkedOn": "2026-11-19",
      "credit": {
          "kind": "manufacturer",
          "author": "K-Swiss",
          "license": "Copyright retained by manufacturer",
          "licenseUrl": "https://kswiss.com/products/04603-002-m",
          "sourceUrl": "https://kswiss.com/products/04603-002-m"
      }
  },
  "on-the-roger-pro-3-clay": {
      "src": "https://images.ctfassets.net/hnk2vsx53n6l/44dTrnr5lSJjNoJJqApmnE/67f3373fcb694a670116122b4c607076/8c7f954d4a64ea9df16b4268f5927e16a44755cf.png?w=960&fm=webp",
      "width": 960,
      "height": 960,
      "alt": "On the roger pro 3 clay product photograph — 3MG10802890 · Men’s clay · Black/Pink",
      "picturedVariant": "3MG10802890 · Men’s clay · Black/Pink",
      "checkedOn": "2026-11-19",
      "credit": {
          "kind": "manufacturer",
          "author": "On",
          "license": "Copyright retained by manufacturer",
          "licenseUrl": "https://www.on.com/en-us/products/the-roger-pro-3-clay-m-3mg1080/mens/black-pink-shoes-3MG10802890",
          "sourceUrl": "https://www.on.com/en-us/products/the-roger-pro-3-clay-m-3mg1080/mens/black-pink-shoes-3MG10802890"
      }
  },
  "head-speed-sinner-2026": {
      "src": "https://cdn-mdb.head.com/CDN3/D/232116/1/683x911/speed-sinner-2026.webp",
      "width": 683,
      "height": 911,
      "alt": "HEAD speed sinner 2026 product photograph — 232116 · Speed Sinner 2026",
      "picturedVariant": "232116 · Speed Sinner 2026",
      "checkedOn": "2026-11-19",
      "credit": {
          "kind": "manufacturer",
          "author": "HEAD",
          "license": "Copyright retained by manufacturer",
          "licenseUrl": "https://www.head.com/en_US/product/speed-sinner-2026-232116",
          "sourceUrl": "https://www.head.com/en_US/product/speed-sinner-2026-232116"
      }
  },
  "on-the-roger-pro-fire": {
      "src": "https://images.ctfassets.net/hnk2vsx53n6l/5CwnPZyAPKXd7fEy3BIV0E/811cc9f1209f784268a842e52254571d/f3471f56d7cdad80c8d09d526cb1786e4254bf45.png?w=960&fm=webp",
      "width": 960,
      "height": 960,
      "alt": "On the roger pro fire product photograph — Men’s · Glacier/Black",
      "picturedVariant": "Men’s · Glacier/Black",
      "checkedOn": "2026-11-19",
      "credit": {
          "kind": "manufacturer",
          "author": "On",
          "license": "Copyright retained by manufacturer",
          "licenseUrl": "https://on.ae/products/the-roger-pro-fire",
          "sourceUrl": "https://on.ae/products/the-roger-pro-fire"
      }
  },
  "yonex-vcore-100": {
      "src": "https://us.yonex.com/cdn/shop/files/ALL_08VC100_338-2.jpg?v=1765575203&width=960",
      "width": 960,
      "height": 1143,
      "alt": "Yonex vcore 100 product photograph — 08VC100 · 2026 · Ruby Red",
      "picturedVariant": "08VC100 · 2026 · Ruby Red",
      "checkedOn": "2026-11-19",
      "credit": {
          "kind": "manufacturer",
          "author": "Yonex",
          "license": "Copyright retained by manufacturer",
          "licenseUrl": "https://us.yonex.com/products/08vcore-100",
          "sourceUrl": "https://us.yonex.com/products/08vcore-100"
      }
  },
  "head-boom-2026": {
      "src": "https://cdn-mdb.head.com/CDN3/D/232216/1/683x911/boom-mp-2026.webp",
      "width": 683,
      "height": 911,
      "alt": "HEAD boom 2026 product photograph — 232216 · Boom MP 2026",
      "picturedVariant": "232216 · Boom MP 2026",
      "checkedOn": "2026-11-19",
      "credit": {
          "kind": "manufacturer",
          "author": "HEAD",
          "license": "Copyright retained by manufacturer",
          "licenseUrl": "https://www.head.com/en_US/product/boom-mp-2026-232216",
          "sourceUrl": "https://www.head.com/en_US/product/boom-mp-2026-232216"
      },
      "caption": "Pictured: Boom MP 2026, one model in the Boom line."
  },
  "mizuno-wave-exceed-tour-5": {
      "src": "https://cdn11.bigcommerce.com/s-x6b2pdd9ey/images/stencil/original/image-manager/a5f6fbae-9624-40b6-996e-5765dfec2ed0.jpg?t=1704379049",
      "width": 1980,
      "height": 850,
      "alt": "Mizuno wave exceed tour 5 product photograph — Wave Exceed Tour 5 · Blue/Yellow launch photo",
      "picturedVariant": "Wave Exceed Tour 5 · Blue/Yellow launch photo",
      "checkedOn": "2026-11-19",
      "credit": {
          "kind": "manufacturer",
          "author": "Mizuno",
          "license": "Copyright retained by manufacturer",
          "licenseUrl": "https://usa.mizuno.com/wave-exceed-tour-5/",
          "sourceUrl": "https://usa.mizuno.com/wave-exceed-tour-5/"
      }
  },
  "wilson-blade-v10": {
      "src": "https://img.myshopline.com/image/store/1722911146473/WR207811U-1-BLADE-98-16X19-V10-FRM-GREEN.png?h=960&q=80&w=960",
      "width": 2000,
      "height": 2000,
      "alt": "Wilson blade v10 product photograph — WR207811U · Blade 98 16x19 v10 · Green",
      "picturedVariant": "WR207811U · Blade 98 16x19 v10 · Green",
      "checkedOn": "2026-11-19",
      "credit": {
          "kind": "manufacturer",
          "author": "Wilson",
          "license": "Copyright retained by manufacturer",
          "licenseUrl": "https://mas.wilson.com/products/wilson-blade-100-v10-tennis-racket-unstrung-",
          "sourceUrl": "https://mas.wilson.com/products/wilson-blade-100-v10-tennis-racket-unstrung-"
      },
      "caption": "Pictured: Blade 98 16x19 v10, one model in the Blade v10 line."
  },
};

// The existing range photo depicts this exact retail model and generation.
productPhotos["wilson-blade-98-16x19-v10"] = { ...productPhotos["wilson-blade-v10"], caption: undefined };
