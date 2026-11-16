import type {UtilityReference} from './utility-data.ts';
export interface PublisherMapRegistration {id:string;provider?:"cs2tricks"|"csnades";mapId:string;levelId:string;artwork:string;sourceImage:string;sourceImageSha256:string;artworkSha256:string;sourceImageWidth?:number;sourceImageHeight?:number;logicalWidth?:number;logicalHeight?:number;transform:{scaleX:number;scaleY:number;translateX:number;translateY:number};checkedAt:string;evidence:string;reviewImage:string}
export const PUBLISHER_MAP_REGISTRATIONS: PublisherMapRegistration[] = [
  {
    "id": "cs2tricks-mirage-main-20261109",
    "mapId": "mirage",
    "levelId": "main",
    "artwork": "/maps/mirage.svg",
    "sourceImage": "https://www.cs2tricks.com/minimap/mirage.webp",
    "sourceImageSha256": "0c7441fc3034f9e5dbe9e50f9b3642631cdbdc4a77f60f35612428015ebe2a06",
    "artworkSha256": "296afd4af266486cf19a81201f38d45091b5e6911a95be1a87330d6bd7ba8046",
    "transform": {
      "scaleX": 0.8322872340425531,
      "scaleY": 0.8315168866459627,
      "translateX": 94.95338818705672,
      "translateY": 90.35326086956523
    },
    "checkedAt": "2026-11-09",
    "evidence": "Whole-radar scale/translation alignment, then visual overlay review of site outlines, junctions, doors and long exterior edges. Publisher image2000px; logical1000; app1000. Not a measured impact or effect radius.",
    "reviewImage": "docs/map-registration-publisher/mirage-review.png"
  },
  {
    "id": "cs2tricks-dust2-main-20261109",
    "mapId": "dust2",
    "levelId": "main",
    "artwork": "/maps/dust2.svg",
    "sourceImage": "https://www.cs2tricks.com/minimap/dust2.webp",
    "sourceImageSha256": "cda6de71f6a89ee0ab992ab02fb49d041016c73141044f06e68400ea74c2f6a3",
    "artworkSha256": "ae4e029057aea36ac33376d5cdf9d1765b70d1059eb87f4ef6cdfd1b06d9ee56",
    "transform": {
      "scaleX": 0.991875,
      "scaleY": 0.9843048128342246,
      "translateX": 5.208333333333333,
      "translateY": 5.645262366310161
    },
    "checkedAt": "2026-11-09",
    "evidence": "Whole-radar scale/translation alignment, then visual overlay review of site outlines, junctions, doors and long exterior edges. Publisher image2000px; logical1000; app1000. Not a measured impact or effect radius.",
    "reviewImage": "docs/map-registration-publisher/dust2-review.png"
  },
  {
    "id": "cs2tricks-inferno-main-20261109",
    "mapId": "inferno",
    "levelId": "main",
    "artwork": "/maps/inferno.svg",
    "sourceImage": "https://www.cs2tricks.com/minimap/inferno.webp",
    "sourceImageSha256": "7928203ed45488fef7c6d080f2441a343de6e8b33156b6a59bc44c44f7cfea51",
    "artworkSha256": "19c6def41e9ccc8bf1f8eb1af9ceab10c8839a2f29c88457ff295db6aa1c78d3",
    "transform": {
      "scaleX": 0.9104771505376343,
      "scaleY": 0.9036141304347827,
      "translateX": 57.442176299283155,
      "translateY": 35.028872282608695
    },
    "checkedAt": "2026-11-09",
    "evidence": "Whole-radar scale/translation alignment, then visual overlay review of site outlines, junctions, doors and long exterior edges. Publisher image2000px; logical1000; app1000. Not a measured impact or effect radius.",
    "reviewImage": "docs/map-registration-publisher/inferno-review.png"
  },
  {
    "id": "cs2tricks-nuke-upper-20261109",
    "mapId": "nuke",
    "levelId": "upper",
    "artwork": "/maps/nuke.svg",
    "sourceImage": "https://www.cs2tricks.com/minimap/nuke.webp",
    "sourceImageSha256": "7c2f6dc10a835a561acb9cb85c26fee60a1044a028b3a06e97b22d93827a4618",
    "artworkSha256": "b5d7db39cc01e30dbc66f7697b2386de3538bc2d859e53a75ac8536b71ec5372",
    "transform": {
      "scaleX": 0.955789695945946,
      "scaleY": 0.9538020833333334,
      "translateX": 44.8338963963964,
      "translateY": 21.267361111111086
    },
    "checkedAt": "2026-11-09",
    "evidence": "Whole-radar scale/translation alignment, then visual overlay review of site outlines, junctions, doors and long exterior edges. Publisher image2000px; logical1000; app1000. Not a measured impact or effect radius.",
    "reviewImage": "docs/map-registration-publisher/nuke-review.png"
  },
  {
    "id": "cs2tricks-ancient-main-20261109",
    "mapId": "ancient",
    "levelId": "main",
    "artwork": "/maps/ancient.svg",
    "sourceImage": "https://www.cs2tricks.com/minimap/ancient.webp",
    "sourceImageSha256": "6f8da4bc0b1f7d606dcbe484c246b456c1da62b8da2ce93d85e5df993103688c",
    "artworkSha256": "20cd3ba00d5b63475c95da3056ed332fe0434762317967fb29c56bf054bb9e2b",
    "transform": {
      "scaleX": 0.8582294861963189,
      "scaleY": 0.8590393518518518,
      "translateX": 57.52981611068507,
      "translateY": 66.20129243827161
    },
    "checkedAt": "2026-11-09",
    "evidence": "Whole-radar scale/translation alignment, then visual overlay review of site outlines, junctions, doors and long exterior edges. Publisher image2000px; logical1000; app1000. Not a measured impact or effect radius.",
    "reviewImage": "docs/map-registration-publisher/ancient-review.png"
  },
  {
    "id": "cs2tricks-anubis-main-20261109",
    "mapId": "anubis",
    "levelId": "main",
    "artwork": "/maps/anubis.svg",
    "sourceImage": "https://www.cs2tricks.com/minimap/anubis.webp",
    "sourceImageSha256": "3d52c055322a2fa78f40e36c1ad3418e83e86f050b0b5465f5128ee596f8c413",
    "artworkSha256": "99ae93d3c660c567ff13f5028ddf0395ce15f728aae3af0c3b148c089f7c2beb",
    "transform": {
      "scaleX": 0.9049999999999999,
      "scaleY": 0.93125,
      "translateX": 51.432291666666664,
      "translateY": 61.848958333333336
    },
    "checkedAt": "2026-11-09",
    "evidence": "Whole-radar scale/translation alignment, then visual overlay review of site outlines, junctions, doors and long exterior edges. Publisher image2000px; logical1000; app1000. Northern spawn geometry differs between artwork revisions; the source points represent callout areas. Not a measured impact or effect radius.",
    "reviewImage": "docs/map-registration-publisher/anubis-review.png"
  },
  {
    "id": "cs2tricks-cache-main-20261109",
    "mapId": "cache",
    "levelId": "main",
    "artwork": "/maps/cache.svg",
    "sourceImage": "https://www.cs2tricks.com/minimap/cache.webp",
    "sourceImageSha256": "a8997c48569835431279636b22b25dc69f469ede5ba8e5cd7620a31a6a736b67",
    "artworkSha256": "8107ffb12c794832c689cf6cb8326fa8168b60b723c232064dc79bc8ca5a3a34",
    "transform": {
      "scaleX": 0.9368419312169312,
      "scaleY": 0.9140909090909091,
      "translateX": 21.19157848324515,
      "translateY": 50.426136363636374
    },
    "checkedAt": "2026-11-09",
    "evidence": "Whole-radar scale/translation alignment, then visual overlay review of site outlines, junctions, doors and long exterior edges. Publisher image2000px; logical1000; app1000. Not a measured impact or effect radius.",
    "reviewImage": "docs/map-registration-publisher/cache-review.png"
  },
  {
    "id": "cs2tricks-vertigo-upper-20261109",
    "mapId": "vertigo",
    "levelId": "upper",
    "artwork": "/maps/de_vertigo_radar_psd.png",
    "sourceImage": "https://www.cs2tricks.com/minimap/vertigo.webp",
    "sourceImageSha256": "88537df9b41467b449be3fe6a839cb3012a7254ed3965df3473ee33f50d4f3c9",
    "artworkSha256": "3cfa3f044ed5883098e78ab63939a3c9e39fc2c0c2100e59acf4e2c3fa09df43",
    "transform": {
      "scaleX": 0.7727675898203592,
      "scaleY": 0.7644301470588235,
      "translateX": 71.39626996007983,
      "translateY": 115.6460631127451
    },
    "checkedAt": "2026-11-09",
    "evidence": "Whole-radar scale/translation alignment, then visual overlay review of site outlines, junctions, doors and long exterior edges. Publisher image2000px; logical1000; app1000. Not a measured impact or effect radius.",
    "reviewImage": "docs/map-registration-publisher/vertigo-review.png"
  },
  {
    "id": "cs2tricks-nuke-lower-20261109",
    "mapId": "nuke",
    "levelId": "lower",
    "artwork": "/maps/de_nuke_lower_radar_psd.png",
    "sourceImage": "https://www.cs2tricks.com/minimap/nuke_2.webp",
    "sourceImageSha256": "004c0bee285123bbe18255caf1715b1f19efedd34f94b207350d570a036eca2a",
    "artworkSha256": "040c958f141d0365ca9125388bc20228b0df0ac6abd1fe78d743ecfa1be4bb64",
    "transform": {
      "scaleX": 0.955789695945946,
      "scaleY": 0.9538020833333334,
      "translateX": 44.8338963963964,
      "translateY": 21.267361111111086
    },
    "checkedAt": "2026-11-09",
    "evidence": "Whole-radar scale/translation alignment, then visual overlay review of site outlines, junctions, doors and long exterior edges. Publisher image2000px; logical1000; app1000. Both publisher floors share the same full-map frame; translucent upper background excluded from foreground fitting. Not a measured impact or effect radius.",
    "reviewImage": "docs/map-registration-publisher/nuke_2-review.png"
  },
  {
    "id": "cs2tricks-vertigo-lower-20261109",
    "mapId": "vertigo",
    "levelId": "lower",
    "artwork": "/maps/de_vertigo_lower_radar_psd.png",
    "sourceImage": "https://www.cs2tricks.com/minimap/vertigo_2.webp",
    "sourceImageSha256": "cf8e8d52420a75442315d5d5fedf3659407fa9ef857f004c03570536bf9d99e1",
    "artworkSha256": "89ab966da946061906ab0d8876b9b45761291e8080149246611e12de526cd673",
    "transform": {
      "scaleX": 0.7727675898203592,
      "scaleY": 0.7644301470588235,
      "translateX": 71.39626996007983,
      "translateY": 115.6460631127451
    },
    "checkedAt": "2026-11-09",
    "evidence": "Whole-radar scale/translation alignment, then visual overlay review of site outlines, junctions, doors and long exterior edges. Publisher image2000px; logical1000; app1000. Both publisher floors share the same full-map frame; translucent upper background excluded from foreground fitting. Not a measured impact or effect radius.",
    "reviewImage": "docs/map-registration-publisher/vertigo_2-review.png"
  },
  {
    "id": "csnades-nuke-upper-20261109",
    "provider": "csnades",
    "mapId": "nuke",
    "levelId": "upper",
    "artwork": "/maps/nuke.svg",
    "sourceImage": "https://assets.csnades.gg/nuke_game_radar_9276ffd1a4.webp",
    "sourceImageWidth": 1558,
    "sourceImageHeight": 848,
    "logicalWidth": 1000,
    "logicalHeight": 1000,
    "sourceImageSha256": "80408cb9e43cacb7fa5c8722228eb9d3d65d661c1121b45f4105b57cfe81ea1c",
    "artworkSha256": "b5d7db39cc01e30dbc66f7697b2386de3538bc2d859e53a75ac8536b71ec5372",
    "transform": {
      "scaleX": 0.9535869565217392,
      "scaleY": 0.525086511299435,
      "translateX": 39.5118602807971,
      "translateY": 247.40732771304147
    },
    "checkedAt": "2026-11-09",
    "evidence": "Original nonsquare publisher radar, with DOM-proven independent x/10% and y/10% coordinates over its image rectangle. Registered to app logical1000 by whole-radar alignment and checked overlay: bombsite outlines, boxes, doors, junctions and exterior edges. Pins identify named destination areas, not measured effect footprints.",
    "reviewImage": "docs/map-registration-publisher/csnades-nuke-review.png"
  },
  {
    "id": "csnades-nuke-lower-20261109",
    "provider": "csnades",
    "mapId": "nuke",
    "levelId": "lower",
    "artwork": "/maps/de_nuke_lower_radar_psd.png",
    "sourceImage": "https://assets.csnades.gg/nuke_game_radar_lower_b42d4863bf.webp",
    "sourceImageWidth": 1558,
    "sourceImageHeight": 848,
    "logicalWidth": 1000,
    "logicalHeight": 1000,
    "sourceImageSha256": "cb9068e61d053c4522a0296b71aae7fa45e67a7769ef8c1c8e99d3eb40ede1fa",
    "artworkSha256": "040c958f141d0365ca9125388bc20228b0df0ac6abd1fe78d743ecfa1be4bb64",
    "transform": {
      "scaleX": 0.9535869565217392,
      "scaleY": 0.525086511299435,
      "translateX": 39.5118602807971,
      "translateY": 247.40732771304147
    },
    "checkedAt": "2026-11-09",
    "evidence": "Original nonsquare publisher radar, with DOM-proven independent x/10% and y/10% coordinates over its image rectangle. Registered to app logical1000 by whole-radar alignment and checked overlay: bombsite outlines, boxes, doors, junctions and exterior edges. Source floors share one frame; foreground-only lower-mask fit rejected because other-floor shading changes opacity. Pins identify named destination areas, not measured effect footprints.",
    "reviewImage": "docs/map-registration-publisher/csnades-nuke_2-review.png"
  },
  {
    "id": "csnades-cache-main-20261109",
    "provider": "csnades",
    "mapId": "cache",
    "levelId": "main",
    "artwork": "/maps/cache.svg",
    "sourceImage": "https://assets.csnades.gg/cache_game_radar_78bfffc917.webp",
    "sourceImageWidth": 2048,
    "sourceImageHeight": 1596,
    "logicalWidth": 1000,
    "logicalHeight": 1000,
    "sourceImageSha256": "cd856a343a50ea78bb9a2737a08a2d9c07185b28683eec4279d172ce22130a58",
    "artworkSha256": "8107ffb12c794832c689cf6cb8326fa8168b60b723c232064dc79bc8ca5a3a34",
    "transform": {
      "scaleX": 0.9662798838797814,
      "scaleY": 0.7462926136363637,
      "translateX": 7.307320127504554,
      "translateY": 137.13304924242422
    },
    "checkedAt": "2026-11-09",
    "evidence": "Original nonsquare publisher radar, with DOM-proven independent x/10% and y/10% coordinates over its image rectangle. Registered to app logical1000 by whole-radar alignment and checked overlay: bombsite outlines, boxes, doors, junctions and exterior edges. Pins identify named destination areas, not measured effect footprints.",
    "reviewImage": "docs/map-registration-publisher/csnades-cache-review.png"
  },
  {
    "id": "csnades-vertigo-upper-20261109",
    "provider": "csnades",
    "mapId": "vertigo",
    "levelId": "upper",
    "artwork": "/maps/de_vertigo_radar_psd.png",
    "sourceImage": "https://assets.csnades.gg/vertigo_game_radar_fdb7e7081d.webp",
    "sourceImageWidth": 1135,
    "sourceImageHeight": 1219,
    "logicalWidth": 1000,
    "logicalHeight": 1000,
    "sourceImageSha256": "75311a57a4e18dba5a2450e21e560e7c3e8aada4472f713e257bb892421eff6d",
    "artworkSha256": "3cfa3f044ed5883098e78ab63939a3c9e39fc2c0c2100e59acf4e2c3fa09df43",
    "transform": {
      "scaleX": 0.6906249999999997,
      "scaleY": 0.7443749999999998,
      "translateX": 103.84114583333333,
      "translateY": 119.62890625
    },
    "checkedAt": "2026-11-09",
    "evidence": "Original nonsquare publisher radar, with DOM-proven independent x/10% and y/10% coordinates over its image rectangle. Registered to app logical1000 by whole-radar alignment and checked overlay: bombsite outlines, boxes, doors, junctions and exterior edges. Pins identify named destination areas, not measured effect footprints.",
    "reviewImage": "docs/map-registration-publisher/csnades-vertigo-review.png"
  },
  {
    "id": "csnades-vertigo-lower-20261109",
    "provider": "csnades",
    "mapId": "vertigo",
    "levelId": "lower",
    "artwork": "/maps/de_vertigo_lower_radar_psd.png",
    "sourceImage": "https://assets.csnades.gg/vertigo_game_radar_2_1f01133fe9.webp",
    "sourceImageWidth": 1135,
    "sourceImageHeight": 1219,
    "logicalWidth": 1000,
    "logicalHeight": 1000,
    "sourceImageSha256": "2845a4f721fd349ac6ac2d962398ecf5f2078743831a355764db15f7b48822d7",
    "artworkSha256": "89ab966da946061906ab0d8876b9b45761291e8080149246611e12de526cd673",
    "transform": {
      "scaleX": 0.6906249999999997,
      "scaleY": 0.7443749999999998,
      "translateX": 103.84114583333333,
      "translateY": 119.62890625
    },
    "checkedAt": "2026-11-09",
    "evidence": "Original nonsquare publisher radar, with DOM-proven independent x/10% and y/10% coordinates over its image rectangle. Registered to app logical1000 by whole-radar alignment and checked overlay: bombsite outlines, boxes, doors, junctions and exterior edges. Source floors share one frame; foreground-only lower-mask fit rejected because other-floor shading changes opacity. Pins identify named destination areas, not measured effect footprints.",
    "reviewImage": "docs/map-registration-publisher/csnades-vertigo_2-review.png"
  },
  {
    "id": "csnades-dust2-main-20261109",
    "provider": "csnades",
    "mapId": "dust2",
    "levelId": "main",
    "artwork": "/maps/dust2.svg",
    "sourceImage": "https://assets.csnades.gg/dust2_game_radar_1b998342f2.webp",
    "sourceImageWidth": 1516,
    "sourceImageHeight": 1619,
    "logicalWidth": 1000,
    "logicalHeight": 1000,
    "sourceImageSha256": "f8e4cf3cd1894b3cb4c00dc702bd84ce8c3fdbd2f4d822fece02d4fe3a23266d",
    "artworkSha256": "ae4e029057aea36ac33376d5cdf9d1765b70d1059eb87f4ef6cdfd1b06d9ee56",
    "transform": {
      "scaleX": 0.9275436827956989,
      "scaleY": 0.9839923128342245,
      "translateX": 41.1486335125448,
      "translateY": 10.472370766488414
    },
    "checkedAt": "2026-11-09",
    "evidence": "Original nonsquare publisher radar, with DOM-proven independent x/10% and y/10% coordinates over its image rectangle. Registered to app logical1000 by whole-radar alignment and checked overlay: bombsite outlines, boxes, doors, junctions and exterior edges. Pins identify named destination areas, not measured effect footprints.",
    "reviewImage": "docs/map-registration-publisher/csnades-dust2-review.png"
  }
];

/** Only a destination endpoint from a matching public guide can be projected. */
export function projectPublisherDestination(guide: UtilityReference): {x:number;y:number}|null {
 const point=guide.markerSource;if(!point||!guide.source)return null;
 const registration=PUBLISHER_MAP_REGISTRATIONS.find(row=>row.id===point.registrationId&&row.mapId===guide.mapId&&row.levelId===guide.levelId);
 if(!registration)return null;
 try{
  const url=new URL(guide.source);
  if(registration.provider==='csnades'){
   if(url.origin!=='https://csnades.gg'||!url.pathname.startsWith(`/${guide.mapId}/`))return null;
  }else if(url.origin!=='https://www.cs2tricks.com'||!url.pathname.startsWith(`/nades/${guide.mapId}/`))return null;
 }catch{return null;}
 const t=registration.transform;const x=point.x*t.scaleX+t.translateX,y=point.y*t.scaleY+t.translateY;
 return Number.isFinite(x)&&Number.isFinite(y)&&x>=0&&x<=1000&&y>=0&&y<=1000?{x:Math.round(x*100)/100,y:Math.round(y*100)/100}:null;
}
