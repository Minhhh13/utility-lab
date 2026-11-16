/** Research evidence used by tests/review only; not imported into the app bundle. */
export interface UtilityMapRegistration {
 id:string;mapId:string;levelId:string;artwork:string;artworkSha256:string;sourceUrl:string;sourceViewBox:number;
 transform:{scaleX:number;scaleY:number;translateX:number;translateY:number}|null;checkedAt:string;evidence:string;landmarks:unknown[];
}
export interface UtilityAnchorEvidence {
 anchorId:string;sourceRegionId:string|number;referencePoint:number[];referencePolygon:number[][];registrationId:string;evidence:string;artworkPoint?:number[];
}

export const UTILITY_MAP_REGISTRATIONS:UtilityMapRegistration[] = [
  {
    "id": "mirage-main-totalcs",
    "mapId": "mirage",
    "levelId": "main",
    "artwork": "/maps/mirage.svg",
    "artworkSha256": "296afd4af266486cf19a81201f38d45091b5e6911a95be1a87330d6bd7ba8046",
    "sourceUrl": "https://totalcsgo.com/callouts/mirage",
    "sourceViewBox": 800,
    "transform": {
      "scaleX": 1.25,
      "scaleY": 1.25,
      "translateX": 0,
      "translateY": 0
    },
    "checkedAt": "2026-11-09",
    "evidence": "Visually registered original author callout artwork to the displayed SVG. Same orientation and overview frame; source logical800, SVG1024, app1000. Only individually checked named areas resolve. This is callout registration, not grenade impact validation.",
    "landmarks": [
      "A bombsite outline",
      "B bombsite outline",
      "T spawn outline",
      "CT spawn outline"
    ]
  },
  {
    "id": "dust2-main-totalcs",
    "mapId": "dust2",
    "levelId": "main",
    "artwork": "/maps/dust2.svg",
    "artworkSha256": "ae4e029057aea36ac33376d5cdf9d1765b70d1059eb87f4ef6cdfd1b06d9ee56",
    "sourceUrl": "https://totalcsgo.com/callouts/dust2",
    "sourceViewBox": 800,
    "transform": {
      "scaleX": 1.25,
      "scaleY": 1.25,
      "translateX": 0,
      "translateY": 0
    },
    "checkedAt": "2026-11-09",
    "evidence": "Visually registered original author callout artwork to the displayed SVG. Same orientation and overview frame; source logical800, SVG1024, app1000. Only individually checked named areas resolve. This is callout registration, not grenade impact validation.",
    "landmarks": [
      "A bombsite outline",
      "B bombsite outline",
      "T spawn outline",
      "CT spawn outline"
    ]
  },
  {
    "id": "inferno-main-totalcs",
    "mapId": "inferno",
    "levelId": "main",
    "artwork": "/maps/inferno.svg",
    "artworkSha256": "19c6def41e9ccc8bf1f8eb1af9ceab10c8839a2f29c88457ff295db6aa1c78d3",
    "sourceUrl": "https://totalcsgo.com/callouts/inferno",
    "sourceViewBox": 800,
    "transform": {
      "scaleX": 1.25,
      "scaleY": 1.25,
      "translateX": 0,
      "translateY": 0
    },
    "checkedAt": "2026-11-09",
    "evidence": "Visually registered original author callout artwork to the displayed SVG. Same orientation and overview frame; source logical800, SVG1024, app1000. Only individually checked named areas resolve. This is callout registration, not grenade impact validation.",
    "landmarks": [
      "A bombsite outline",
      "B bombsite outline",
      "T spawn outline",
      "CT spawn outline"
    ]
  },
  {
    "id": "nuke-upper-totalcs",
    "mapId": "nuke",
    "levelId": "upper",
    "artwork": "/maps/nuke.svg",
    "artworkSha256": "b5d7db39cc01e30dbc66f7697b2386de3538bc2d859e53a75ac8536b71ec5372",
    "sourceUrl": "https://totalcsgo.com/callouts/nuke",
    "sourceViewBox": 800,
    "transform": {
      "scaleX": 1.25,
      "scaleY": 1.25,
      "translateX": 0,
      "translateY": 0
    },
    "checkedAt": "2026-11-09",
    "evidence": "Visually registered original author callout artwork to the displayed SVG. Same orientation and overview frame; source logical800, SVG1024, app1000. Only individually checked named areas resolve. This is callout registration, not grenade impact validation.",
    "landmarks": [
      "T spawn orange outline at left",
      "CT spawn blue arc at right",
      "A reactor bombsite central building",
      "Outside silo circle below lobby"
    ]
  },
  {
    "id": "ancient-main-totalcs",
    "mapId": "ancient",
    "levelId": "main",
    "artwork": "/maps/ancient.svg",
    "artworkSha256": "20cd3ba00d5b63475c95da3056ed332fe0434762317967fb29c56bf054bb9e2b",
    "sourceUrl": "https://totalcsgo.com/callouts/ancient",
    "sourceViewBox": 800,
    "transform": {
      "scaleX": 1.25,
      "scaleY": 1.25,
      "translateX": 0,
      "translateY": 0
    },
    "checkedAt": "2026-11-09",
    "evidence": "Visually registered original author callout artwork to the displayed SVG. Same orientation and overview frame; source logical800, SVG1024, app1000. Only individually checked named areas resolve. This is callout registration, not grenade impact validation.",
    "landmarks": [
      "A bombsite outline",
      "B bombsite outline",
      "T spawn outline",
      "CT spawn outline"
    ]
  },
  {
    "id": "anubis-main-totalcs",
    "mapId": "anubis",
    "levelId": "main",
    "artwork": "/maps/anubis.svg",
    "artworkSha256": "99ae93d3c660c567ff13f5028ddf0395ce15f728aae3af0c3b148c089f7c2beb",
    "sourceUrl": "https://totalcsgo.com/callouts/anubis",
    "sourceViewBox": 800,
    "transform": {
      "scaleX": 1.25,
      "scaleY": 1.25,
      "translateX": 0,
      "translateY": 0
    },
    "checkedAt": "2026-11-09",
    "evidence": "Visually registered original author callout artwork to the displayed SVG. Same orientation and overview frame; source logical800, SVG1024, app1000. Only individually checked named areas resolve. This is callout registration, not grenade impact validation.",
    "landmarks": [
      "A bombsite outline",
      "B bombsite outline",
      "T spawn outline",
      "CT spawn outline"
    ]
  },
  {
    "id": "cache-main-totalcs",
    "mapId": "cache",
    "levelId": "main",
    "artwork": "/maps/cache.svg",
    "artworkSha256": "8107ffb12c794832c689cf6cb8326fa8168b60b723c232064dc79bc8ca5a3a34",
    "sourceUrl": "https://totalcsgo.com/callouts/cache",
    "sourceViewBox": 800,
    "transform": {
      "scaleX": 1.25,
      "scaleY": 1.25,
      "translateX": 0,
      "translateY": 0
    },
    "checkedAt": "2026-11-09",
    "evidence": "Visually registered original author callout artwork to the displayed SVG. Same orientation and overview frame; source logical800, SVG1024, app1000. Only individually checked named areas resolve. This is callout registration, not grenade impact validation.",
    "landmarks": [
      "A bombsite outline",
      "B bombsite outline",
      "T spawn outline",
      "CT spawn outline"
    ]
  },
  {
    "id": "nuke-lower-totalcs-inset",
    "mapId": "nuke",
    "levelId": "lower",
    "artwork": "/maps/de_nuke_lower_radar_psd.png",
    "artworkSha256": "040c958f141d0365ca9125388bc20228b0df0ac6abd1fe78d743ecfa1be4bb64",
    "sourceUrl": "https://totalcsgo.com/callouts/nuke",
    "sourceViewBox": 800,
    "transform": {
      "scaleX": 1.25,
      "scaleY": 1.25,
      "translateX": 379,
      "translateY": 275
    },
    "checkedAt": "2026-11-09",
    "evidence": "TotalCS puts lower floor in top-left inset. Independently registered inset to displayed lower radar using B reactor centre, ramp landing door and double-door doorway. Translation is measured from these landmarks, never reused from upper floor. Landmark reading tolerance about4 native pixels.",
    "landmarks": [
      {
        "source": [
          153,
          234
        ],
        "artwork": [
          584,
          581
        ],
        "name": "B reactor centre"
      },
      {
        "source": [
          153,
          108
        ],
        "artwork": [
          584,
          420
        ],
        "name": "Bottom ramp horizontal door bar"
      },
      {
        "source": [
          198,
          201
        ],
        "artwork": [
          642,
          539
        ],
        "name": "B double-door doorway"
      }
    ]
  },
  {
    "id": "ancient-main-atlas",
    "mapId": "ancient",
    "levelId": "main",
    "artwork": "/maps/ancient.svg",
    "artworkSha256": "20cd3ba00d5b63475c95da3056ed332fe0434762317967fb29c56bf054bb9e2b",
    "sourceUrl": "https://cs2.jzr.uz/maps/ancient",
    "sourceViewBox": 1000,
    "transform": {
      "scaleX": 1,
      "scaleY": 1,
      "translateX": 0,
      "translateY": 0
    },
    "checkedAt": "2026-11-09",
    "evidence": "Author published September27,2026. Original polygon viewBox1000 and overview image align directly with displayed1024 SVG scaled1000. Verified CT spawn, circular Donut room, Cave corridor, and Red room boundaries.",
    "landmarks": [
      "CT spawn rectangle",
      "Donut circular central column",
      "Cave corridor beside B",
      "Red upper-mid room"
    ]
  },
  {
    "id": "vertigo-upper-totalcs-landmarks",
    "mapId": "vertigo",
    "levelId": "upper",
    "artwork": "/maps/de_vertigo_radar_psd.png",
    "artworkSha256": "3cfa3f044ed5883098e78ab63939a3c9e39fc2c0c2100e59acf4e2c3fa09df43",
    "sourceUrl": "https://totalcsgo.com/callouts/vertigo",
    "sourceViewBox": 800,
    "transform": null,
    "checkedAt": "2026-11-09",
    "evidence": "Reference is a two-floor composite with legacy geometry. No global transform is asserted. Only independently identified unchanged landmark areas are anchored directly on displayed current upper radar; all disputed callouts stay unresolved.",
    "landmarks": [
      {
        "source": [
          106,
          393
        ],
        "artwork": [
          227,
          242
        ],
        "name": "B plant orange rectangle"
      },
      {
        "source": [
          402,
          603
        ],
        "artwork": [
          721,
          598
        ],
        "name": "A plant orange rectangle"
      },
      {
        "source": [
          427.5,
          716.5
        ],
        "artwork": [
          744,
          784
        ],
        "name": "Sandbags diamond at A ramp edge"
      }
    ]
  }
];

export const UTILITY_ANCHOR_EVIDENCE:UtilityAnchorEvidence[] = [
  {
    "anchorId": "mirage:main:a-site",
    "sourceRegionId": 789,
    "referencePoint": [
      416.5,
      625.5
    ],
    "referencePolygon": [
      [
        380,
        669
      ],
      [
        490,
        650
      ],
      [
        500,
        580
      ],
      [
        378,
        592
      ]
    ],
    "registrationId": "mirage-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "mirage:main:b-site",
    "sourceRegionId": 765,
    "referencePoint": [
      183.5,
      228.5
    ],
    "referencePolygon": [
      [
        147,
        264
      ],
      [
        218,
        267
      ],
      [
        223,
        192
      ],
      [
        147,
        192
      ]
    ],
    "registrationId": "mirage-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "mirage:main:jungle",
    "sourceRegionId": 774,
    "referencePoint": [
      355.5,
      490.5
    ],
    "referencePolygon": [
      [
        301,
        514
      ],
      [
        392,
        522
      ],
      [
        388,
        465
      ],
      [
        295,
        457
      ]
    ],
    "registrationId": "mirage-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "mirage:main:mid-window",
    "sourceRegionId": 798,
    "referencePoint": [
      316.5,
      421.5
    ],
    "referencePolygon": [
      [
        297,
        436
      ],
      [
        334,
        442
      ],
      [
        335,
        352
      ],
      [
        308,
        352
      ]
    ],
    "registrationId": "mirage-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "mirage:main:market-window",
    "sourceRegionId": 811,
    "referencePoint": [
      189.5,
      314.5
    ],
    "referencePolygon": [
      [
        179,
        325
      ],
      [
        216,
        324
      ],
      [
        218,
        303
      ],
      [
        178,
        304
      ]
    ],
    "registrationId": "mirage-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "mirage:main:stairs",
    "sourceRegionId": 796,
    "referencePoint": [
      430.5,
      513.5
    ],
    "referencePolygon": [
      [
        415,
        466
      ],
      [
        434,
        467
      ],
      [
        445,
        525
      ],
      [
        419,
        526
      ]
    ],
    "registrationId": "mirage-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "mirage:main:mid",
    "sourceRegionId": 791,
    "referencePoint": [
      534.5,
      360.5
    ],
    "referencePolygon": [
      [
        357,
        308
      ],
      [
        591,
        305
      ],
      [
        588,
        416
      ],
      [
        443,
        413
      ],
      [
        443,
        392
      ],
      [
        352,
        397
      ]
    ],
    "registrationId": "mirage-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "mirage:main:a-ramp",
    "sourceRegionId": 793,
    "referencePoint": [
      596.5,
      512.5
    ],
    "referencePolygon": [
      [
        540,
        540
      ],
      [
        622,
        539
      ],
      [
        627,
        440
      ],
      [
        593,
        440
      ],
      [
        592,
        486
      ],
      [
        536,
        487
      ]
    ],
    "registrationId": "mirage-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "mirage:main:ticket",
    "sourceRegionId": 797,
    "referencePoint": [
      363.5,
      662.5
    ],
    "referencePolygon": [
      [
        368,
        635
      ],
      [
        387,
        666
      ],
      [
        374,
        688
      ],
      [
        329,
        666
      ]
    ],
    "registrationId": "mirage-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "mirage:main:connector",
    "sourceRegionId": 775,
    "referencePoint": [
      401.5,
      421.5
    ],
    "referencePolygon": [
      [
        375,
        468
      ],
      [
        430,
        472
      ],
      [
        427,
        394
      ],
      [
        375,
        395
      ]
    ],
    "registrationId": "mirage-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "mirage:main:b-short",
    "sourceRegionId": 806,
    "referencePoint": [
      370.5,
      239.5
    ],
    "referencePolygon": [
      [
        290,
        255
      ],
      [
        358,
        257
      ],
      [
        357,
        314
      ],
      [
        404,
        315
      ],
      [
        389,
        219
      ],
      [
        315,
        216
      ],
      [
        313,
        182
      ],
      [
        291,
        182
      ]
    ],
    "registrationId": "mirage-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "mirage:main:ladder-room",
    "sourceRegionId": 799,
    "referencePoint": [
      330.5,
      286.5
    ],
    "referencePolygon": [
      [
        311,
        266
      ],
      [
        349,
        268
      ],
      [
        350,
        302
      ],
      [
        313,
        323
      ]
    ],
    "registrationId": "mirage-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "mirage:main:a-default",
    "sourceRegionId": 805,
    "referencePoint": [
      459.5,
      609.5
    ],
    "referencePolygon": [
      [
        448,
        620
      ],
      [
        471,
        618
      ],
      [
        469,
        597
      ],
      [
        450,
        602
      ]
    ],
    "registrationId": "mirage-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "mirage:main:tetris",
    "sourceRegionId": 768,
    "referencePoint": [
      493.5,
      497.5
    ],
    "referencePolygon": [
      [
        507,
        520
      ],
      [
        519,
        477
      ],
      [
        464,
        480
      ],
      [
        465,
        513
      ]
    ],
    "registrationId": "mirage-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "mirage:main:bench",
    "sourceRegionId": 778,
    "referencePoint": [
      108.5,
      205.5
    ],
    "referencePolygon": [
      [
        83,
        257
      ],
      [
        131,
        259
      ],
      [
        139,
        177
      ],
      [
        81,
        179
      ]
    ],
    "registrationId": "mirage-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "mirage:main:top-mid",
    "sourceRegionId": 803,
    "referencePoint": [
      546.5,
      335.5
    ],
    "referencePolygon": [
      [
        513,
        420
      ],
      [
        593,
        422
      ],
      [
        593,
        290
      ],
      [
        491,
        286
      ]
    ],
    "registrationId": "mirage-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "mirage:main:a-ct",
    "sourceRegionId": 772,
    "referencePoint": [
      346.5,
      641.5
    ],
    "referencePolygon": [
      [
        261,
        650
      ],
      [
        392,
        682
      ],
      [
        373,
        618
      ],
      [
        289,
        600
      ],
      [
        242,
        609
      ]
    ],
    "registrationId": "mirage-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "mirage:main:ct-spawn",
    "sourceRegionId": 773,
    "referencePoint": [
      244.5,
      570.5
    ],
    "referencePolygon": [
      [
        234,
        536
      ],
      [
        184,
        541
      ],
      [
        185,
        608
      ],
      [
        282,
        607
      ],
      [
        275,
        384
      ],
      [
        230,
        385
      ]
    ],
    "registrationId": "mirage-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "mirage:main:t-spawn",
    "sourceRegionId": 790,
    "referencePoint": [
      703.5,
      277.5
    ],
    "referencePolygon": [
      [
        673,
        468
      ],
      [
        729,
        471
      ],
      [
        738,
        245
      ],
      [
        670,
        243
      ]
    ],
    "registrationId": "mirage-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "mirage:main:palace",
    "sourceRegionId": 766,
    "referencePoint": [
      514,
      630
    ],
    "referencePolygon": [
      [
        501,
        643
      ],
      [
        677,
        646
      ],
      [
        675,
        547
      ],
      [
        729,
        480
      ],
      [
        648,
        482
      ],
      [
        646,
        571
      ],
      [
        548,
        572
      ],
      [
        550,
        609
      ],
      [
        502,
        609
      ]
    ],
    "registrationId": "mirage-main-totalcs",
    "evidence": "Palace A-facing end rather than deep back room: source polygon left entrance adjacent to Balcony; matched displayed Palace west doorway."
  },
  {
    "anchorId": "mirage:main:underpass",
    "sourceRegionId": 776,
    "referencePoint": [
      350,
      330
    ],
    "referencePolygon": [
      [
        370,
        215
      ],
      [
        364,
        395
      ],
      [
        338,
        395
      ],
      [
        342,
        187
      ],
      [
        494,
        193
      ],
      [
        492,
        212
      ]
    ],
    "registrationId": "mirage-main-totalcs",
    "evidence": "Underpass vertical passage beside Mid, source polygon interior and matching displayed stair corridor. Not the northern B-apps entrance."
  },
  {
    "anchorId": "mirage:main:b-apartments",
    "sourceRegionId": 815,
    "referencePoint": [
      250,
      150
    ],
    "referencePolygon": [
      [
        178,
        165
      ],
      [
        319,
        167
      ],
      [
        321,
        214
      ],
      [
        352,
        216
      ],
      [
        355,
        136
      ],
      [
        176,
        130
      ]
    ],
    "registrationId": "mirage-main-totalcs",
    "evidence": "Central long B-apps corridor interior matched to displayed northern corridor, rather than distant widened room."
  },
  {
    "anchorId": "mirage:main:under-balcony",
    "sourceRegionId": 795,
    "referencePoint": [
      516.5,
      591.5
    ],
    "referencePolygon": [
      [
        498,
        609
      ],
      [
        534,
        611
      ],
      [
        535,
        562
      ],
      [
        500,
        562
      ]
    ],
    "registrationId": "mirage-main-totalcs",
    "evidence": "Balcony/Shadow footprint immediately outside Palace, matched to striped displayed balcony. Same XY footprint as under balcony; no height claim."
  },
  {
    "anchorId": "dust2:main:ct-mid",
    "sourceRegionId": 649,
    "referencePoint": [
      330.5,
      161.5
    ],
    "referencePolygon": [
      [
        285,
        205
      ],
      [
        337,
        205
      ],
      [
        337,
        233
      ],
      [
        384,
        234
      ],
      [
        388,
        120
      ],
      [
        288,
        117
      ]
    ],
    "registrationId": "dust2-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "dust2:main:upper-tunnels",
    "sourceRegionId": 633,
    "referencePoint": [
      89.5,
      362.5
    ],
    "referencePolygon": [
      [
        54,
        402
      ],
      [
        235,
        395
      ],
      [
        236,
        347
      ],
      [
        149,
        349
      ],
      [
        150,
        322
      ],
      [
        48,
        326
      ]
    ],
    "registrationId": "dust2-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "dust2:main:lower-tunnels",
    "sourceRegionId": 636,
    "referencePoint": [
      322.5,
      324.5
    ],
    "referencePolygon": [
      [
        225,
        346
      ],
      [
        346,
        350
      ],
      [
        349,
        298
      ],
      [
        221,
        302
      ]
    ],
    "registrationId": "dust2-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "dust2:main:mid",
    "sourceRegionId": 652,
    "referencePoint": [
      371.5,
      426.5
    ],
    "referencePolygon": [
      [
        348,
        471
      ],
      [
        394,
        471
      ],
      [
        395,
        338
      ],
      [
        350,
        336
      ]
    ],
    "registrationId": "dust2-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "dust2:main:mid-doors",
    "sourceRegionId": 650,
    "referencePoint": [
      374.5,
      290.5
    ],
    "referencePolygon": [
      [
        345,
        302
      ],
      [
        390,
        304
      ],
      [
        385,
        276
      ],
      [
        343,
        283
      ]
    ],
    "registrationId": "dust2-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "dust2:main:a-long",
    "sourceRegionId": 661,
    "referencePoint": [
      695.5,
      260.5
    ],
    "referencePolygon": [
      [
        661,
        341
      ],
      [
        684,
        350
      ],
      [
        666,
        394
      ],
      [
        728,
        394
      ],
      [
        733,
        227
      ],
      [
        658,
        220
      ]
    ],
    "registrationId": "dust2-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "dust2:main:long-doors",
    "sourceRegionId": 655,
    "referencePoint": [
      552.5,
      455.5
    ],
    "referencePolygon": [
      [
        526,
        530
      ],
      [
        576,
        533
      ],
      [
        581,
        429
      ],
      [
        526,
        428
      ]
    ],
    "registrationId": "dust2-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "dust2:main:xbox",
    "sourceRegionId": 621,
    "referencePoint": [
      384.5,
      323.5
    ],
    "referencePolygon": [
      [
        374,
        340
      ],
      [
        398,
        342
      ],
      [
        401,
        309
      ],
      [
        364,
        308
      ]
    ],
    "registrationId": "dust2-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "dust2:main:b-doors",
    "sourceRegionId": 644,
    "referencePoint": [
      201.5,
      181.5
    ],
    "referencePolygon": [
      [
        187,
        212
      ],
      [
        217,
        213
      ],
      [
        217,
        167
      ],
      [
        186,
        165
      ]
    ],
    "registrationId": "dust2-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "dust2:main:long-corner",
    "sourceRegionId": 662,
    "referencePoint": [
      659.5,
      362.5
    ],
    "referencePolygon": [
      [
        649,
        374
      ],
      [
        672,
        377
      ],
      [
        673,
        350
      ],
      [
        643,
        350
      ]
    ],
    "registrationId": "dust2-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "dust2:main:a-cross",
    "sourceRegionId": 660,
    "referencePoint": [
      695.5,
      195.5
    ],
    "referencePolygon": [
      [
        657,
        223
      ],
      [
        728,
        229
      ],
      [
        726,
        164
      ],
      [
        661,
        164
      ]
    ],
    "registrationId": "dust2-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "dust2:main:goose",
    "sourceRegionId": 627,
    "referencePoint": [
      639.5,
      55.5
    ],
    "referencePolygon": [
      [
        618,
        81
      ],
      [
        665,
        84
      ],
      [
        665,
        30
      ],
      [
        609,
        30
      ]
    ],
    "registrationId": "dust2-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "dust2:main:a-car",
    "sourceRegionId": 658,
    "referencePoint": [
      740.5,
      187.5
    ],
    "referencePolygon": [
      [
        726,
        263
      ],
      [
        759,
        262
      ],
      [
        759,
        168
      ],
      [
        720,
        169
      ]
    ],
    "registrationId": "dust2-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "dust2:main:short-a",
    "sourceRegionId": 635,
    "referencePoint": [
      507.5,
      312.5
    ],
    "referencePolygon": [
      [
        535,
        130
      ],
      [
        534,
        340
      ],
      [
        412,
        337
      ],
      [
        412,
        298
      ],
      [
        484,
        300
      ],
      [
        485,
        126
      ]
    ],
    "registrationId": "dust2-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "dust2:main:b-platform",
    "sourceRegionId": 639,
    "referencePoint": [
      97.5,
      106.5
    ],
    "referencePolygon": [
      [
        59,
        55
      ],
      [
        136,
        53
      ],
      [
        137,
        146
      ],
      [
        58,
        147
      ]
    ],
    "registrationId": "dust2-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "dust2:main:a-site",
    "sourceRegionId": 663,
    "referencePoint": [
      646.5,
      133.5
    ],
    "referencePolygon": [
      [
        631,
        149
      ],
      [
        664,
        154
      ],
      [
        665,
        115
      ],
      [
        626,
        115
      ]
    ],
    "registrationId": "dust2-main-totalcs",
    "evidence": "A bomb-plant area is explicitly A Default Plant in author reference, matching current displayed upper-right plant box."
  },
  {
    "anchorId": "inferno:main:ct-entrance",
    "sourceRegionId": 724,
    "referencePoint": [
      482.5,
      186.5
    ],
    "referencePolygon": [
      [
        466,
        206
      ],
      [
        548,
        204
      ],
      [
        548,
        171
      ],
      [
        459,
        166
      ]
    ],
    "registrationId": "inferno-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "inferno:main:banana",
    "sourceRegionId": 704,
    "referencePoint": [
      349.5,
      396.5
    ],
    "referencePolygon": [
      [
        318,
        404
      ],
      [
        317,
        387
      ],
      [
        394,
        274
      ],
      [
        437,
        277
      ],
      [
        438,
        263
      ],
      [
        487,
        263
      ],
      [
        500,
        330
      ],
      [
        416,
        324
      ],
      [
        380,
        390
      ],
      [
        383,
        427
      ],
      [
        366,
        448
      ],
      [
        342,
        448
      ]
    ],
    "registrationId": "inferno-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "inferno:main:banana-car",
    "sourceRegionId": 732,
    "referencePoint": [
      413.5,
      288.5
    ],
    "referencePolygon": [
      [
        363,
        301
      ],
      [
        426,
        302
      ],
      [
        428,
        274
      ],
      [
        364,
        275
      ]
    ],
    "registrationId": "inferno-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "inferno:main:mid",
    "sourceRegionId": 735,
    "referencePoint": [
      458.5,
      527.5
    ],
    "referencePolygon": [
      [
        337,
        549
      ],
      [
        540,
        552
      ],
      [
        539,
        505
      ],
      [
        337,
        503
      ]
    ],
    "registrationId": "inferno-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "inferno:main:arch",
    "sourceRegionId": 756,
    "referencePoint": [
      624.5,
      375.5
    ],
    "referencePolygon": [
      [
        612,
        419
      ],
      [
        637,
        420
      ],
      [
        639,
        362
      ],
      [
        610,
        361
      ]
    ],
    "registrationId": "inferno-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "inferno:main:truck",
    "sourceRegionId": 713,
    "referencePoint": [
      662.5,
      625.5
    ],
    "referencePolygon": [
      [
        595,
        638
      ],
      [
        678,
        638
      ],
      [
        673,
        613
      ],
      [
        597,
        614
      ]
    ],
    "registrationId": "inferno-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "inferno:main:new-box",
    "sourceRegionId": 760,
    "referencePoint": [
      347.5,
      201.5
    ],
    "referencePolygon": [
      [
        331,
        214
      ],
      [
        360,
        216
      ],
      [
        363,
        188
      ],
      [
        331,
        187
      ]
    ],
    "registrationId": "inferno-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "inferno:main:b-site",
    "sourceRegionId": 705,
    "referencePoint": [
      388.5,
      174.5
    ],
    "referencePolygon": [
      [
        350,
        214
      ],
      [
        425,
        213
      ],
      [
        427,
        135
      ],
      [
        351,
        137
      ]
    ],
    "registrationId": "inferno-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "inferno:main:church",
    "sourceRegionId": 758,
    "referencePoint": [
      466.5,
      98.5
    ],
    "referencePolygon": [
      [
        437,
        43
      ],
      [
        466,
        47
      ],
      [
        467,
        58
      ],
      [
        503,
        58
      ],
      [
        503,
        91
      ],
      [
        547,
        95
      ],
      [
        547,
        136
      ],
      [
        424,
        135
      ]
    ],
    "registrationId": "inferno-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "inferno:main:pit",
    "sourceRegionId": 710,
    "referencePoint": [
      718.5,
      660.5
    ],
    "referencePolygon": [
      [
        654,
        643
      ],
      [
        720,
        614
      ],
      [
        755,
        616
      ],
      [
        766,
        702
      ],
      [
        659,
        704
      ]
    ],
    "registrationId": "inferno-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "inferno:main:a-site",
    "sourceRegionId": 716,
    "referencePoint": [
      644.5,
      529.5
    ],
    "referencePolygon": [
      [
        615,
        502
      ],
      [
        617,
        588
      ],
      [
        673,
        587
      ],
      [
        674,
        498
      ]
    ],
    "registrationId": "inferno-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "inferno:main:banana-sandbags",
    "sourceRegionId": 731,
    "referencePoint": [
      470.5,
      316.5
    ],
    "referencePolygon": [
      [
        430,
        338
      ],
      [
        506,
        338
      ],
      [
        508,
        294
      ],
      [
        432,
        296
      ]
    ],
    "registrationId": "inferno-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "nuke:upper:outside",
    "sourceRegionId": 911,
    "referencePoint": [
      511.5,
      555.5
    ],
    "referencePolygon": [
      [
        369,
        566
      ],
      [
        474,
        601
      ],
      [
        557,
        596
      ],
      [
        553,
        499
      ],
      [
        609,
        502
      ],
      [
        608,
        455
      ],
      [
        568,
        460
      ],
      [
        568,
        416
      ],
      [
        501,
        415
      ],
      [
        500,
        494
      ],
      [
        483,
        495
      ],
      [
        484,
        522
      ],
      [
        440,
        522
      ],
      [
        441,
        494
      ],
      [
        419,
        495
      ]
    ],
    "registrationId": "nuke-upper-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "nuke:upper:squeaky",
    "sourceRegionId": 920,
    "referencePoint": [
      402.5,
      465.5
    ],
    "referencePolygon": [
      [
        358,
        477
      ],
      [
        416,
        478
      ],
      [
        415,
        453
      ],
      [
        355,
        452
      ]
    ],
    "registrationId": "nuke-upper-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "nuke:upper:a-site",
    "sourceRegionId": 912,
    "referencePoint": [
      460,
      405
    ],
    "referencePolygon": [
      [
        497,
        352
      ],
      [
        501,
        493
      ],
      [
        414,
        491
      ],
      [
        417,
        356
      ]
    ],
    "registrationId": "nuke-upper-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius. Reference interior point selected after displayed-artwork inspection to avoid a central obstacle/void or to mark the callout entrance/room rather than a distant part of a broad polygon."
  },
  {
    "anchorId": "nuke:upper:hut",
    "sourceRegionId": 926,
    "referencePoint": [
      430.5,
      443.5
    ],
    "referencePolygon": [
      [
        421,
        457
      ],
      [
        442,
        457
      ],
      [
        440,
        424
      ],
      [
        418,
        425
      ]
    ],
    "registrationId": "nuke-upper-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "nuke:upper:lobby",
    "sourceRegionId": 917,
    "referencePoint": [
      381.5,
      426.5
    ],
    "referencePolygon": [
      [
        333,
        456
      ],
      [
        417,
        455
      ],
      [
        416,
        398
      ],
      [
        358,
        398
      ],
      [
        357,
        411
      ],
      [
        333,
        411
      ]
    ],
    "registrationId": "nuke-upper-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "nuke:upper:t-red",
    "sourceRegionId": 935,
    "referencePoint": [
      475.5,
      572.5
    ],
    "referencePolygon": [
      [
        439,
        580
      ],
      [
        482,
        581
      ],
      [
        485,
        564
      ],
      [
        438,
        567
      ]
    ],
    "registrationId": "nuke-upper-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "nuke:upper:silo",
    "sourceRegionId": 944,
    "referencePoint": [
      395.5,
      509.5
    ],
    "referencePolygon": [
      [
        370,
        533
      ],
      [
        421,
        535
      ],
      [
        419,
        485
      ],
      [
        366,
        485
      ]
    ],
    "registrationId": "nuke-upper-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "nuke:upper:main",
    "sourceRegionId": 937,
    "referencePoint": [
      453.5,
      508.5
    ],
    "referencePolygon": [
      [
        439,
        523
      ],
      [
        484,
        523
      ],
      [
        482,
        493
      ],
      [
        439,
        494
      ]
    ],
    "registrationId": "nuke-upper-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "nuke:upper:lockers",
    "sourceRegionId": 924,
    "referencePoint": [
      522.5,
      401.5
    ],
    "referencePolygon": [
      [
        501,
        414
      ],
      [
        542,
        415
      ],
      [
        547,
        389
      ],
      [
        498,
        388
      ]
    ],
    "registrationId": "nuke-upper-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "nuke:upper:heaven",
    "sourceRegionId": 923,
    "referencePoint": [
      529.5,
      371.5
    ],
    "referencePolygon": [
      [
        496,
        356
      ],
      [
        545,
        355
      ],
      [
        548,
        388
      ],
      [
        497,
        388
      ]
    ],
    "registrationId": "nuke-upper-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "nuke:upper:a-tetris",
    "sourceRegionId": 927,
    "referencePoint": [
      453.5,
      459.5
    ],
    "referencePolygon": [
      [
        435,
        468
      ],
      [
        463,
        471
      ],
      [
        466,
        449
      ],
      [
        437,
        448
      ]
    ],
    "registrationId": "nuke-upper-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "nuke:upper:rafters",
    "sourceRegionId": 929,
    "referencePoint": [
      493.5,
      356.5
    ],
    "referencePolygon": [
      [
        419,
        350
      ],
      [
        500,
        350
      ],
      [
        501,
        363
      ],
      [
        419,
        362
      ]
    ],
    "registrationId": "nuke-upper-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "nuke:lower:b-site",
    "sourceRegionId": 913,
    "referencePoint": [
      153,
      218
    ],
    "referencePolygon": [
      [
        190,
        137
      ],
      [
        192,
        257
      ],
      [
        117,
        255
      ],
      [
        116,
        134
      ]
    ],
    "registrationId": "nuke-lower-totalcs-inset",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius. Reference interior point selected after displayed-artwork inspection to avoid a central obstacle/void or to mark the callout entrance/room rather than a distant part of a broad polygon."
  },
  {
    "anchorId": "nuke:lower:b-double-doors",
    "sourceRegionId": 943,
    "referencePoint": [
      198,
      211
    ],
    "referencePolygon": [
      [
        197,
        200
      ],
      [
        252,
        200
      ],
      [
        253,
        223
      ],
      [
        197,
        223
      ]
    ],
    "registrationId": "nuke-lower-totalcs-inset",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius. Reference interior point selected after displayed-artwork inspection to avoid a central obstacle/void or to mark the callout entrance/room rather than a distant part of a broad polygon."
  },
  {
    "anchorId": "nuke:lower:b-dark",
    "sourceRegionId": 939,
    "referencePoint": [
      177.5,
      147.5
    ],
    "referencePolygon": [
      [
        169,
        138
      ],
      [
        186,
        139
      ],
      [
        186,
        164
      ],
      [
        169,
        164
      ]
    ],
    "registrationId": "nuke-lower-totalcs-inset",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "nuke:lower:decon",
    "sourceRegionId": 940,
    "referencePoint": [
      104.5,
      260.5
    ],
    "referencePolygon": [
      [
        90,
        276
      ],
      [
        121,
        275
      ],
      [
        119,
        245
      ],
      [
        89,
        247
      ]
    ],
    "registrationId": "nuke-lower-totalcs-inset",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "ancient:main:b-door",
    "sourceRegionId": 457,
    "referencePoint": [
      626.5,
      488.5
    ],
    "referencePolygon": [
      [
        616,
        478
      ],
      [
        645,
        479
      ],
      [
        641,
        498
      ],
      [
        617,
        498
      ]
    ],
    "registrationId": "ancient-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "ancient:main:a-ct",
    "sourceRegionId": 462,
    "referencePoint": [
      332.5,
      170.5
    ],
    "referencePolygon": [
      [
        275,
        157
      ],
      [
        355,
        156
      ],
      [
        356,
        177
      ],
      [
        345,
        178
      ],
      [
        344,
        188
      ],
      [
        322,
        187
      ],
      [
        321,
        180
      ],
      [
        297,
        179
      ],
      [
        294,
        187
      ],
      [
        275,
        187
      ]
    ],
    "registrationId": "ancient-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "ancient:main:b-site",
    "sourceRegionId": 452,
    "referencePoint": [
      614,
      326
    ],
    "referencePolygon": [
      [
        562,
        304
      ],
      [
        563,
        351
      ],
      [
        624,
        348
      ],
      [
        627,
        342
      ],
      [
        632,
        336
      ],
      [
        634,
        330
      ],
      [
        633,
        321
      ],
      [
        627,
        311
      ],
      [
        616,
        307
      ]
    ],
    "registrationId": "ancient-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius. Reference interior point selected after displayed-artwork inspection to avoid a central obstacle/void or to mark the callout entrance/room rather than a distant part of a broad polygon."
  },
  {
    "anchorId": "ancient:main:a-main",
    "sourceRegionId": 439,
    "referencePoint": [
      119.5,
      322.5
    ],
    "referencePolygon": [
      [
        100,
        304
      ],
      [
        102,
        341
      ],
      [
        193,
        339
      ],
      [
        193,
        305
      ]
    ],
    "registrationId": "ancient-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "ancient:main:b-ramp",
    "sourceRegionId": 450,
    "referencePoint": [
      661.5,
      442.5
    ],
    "referencePolygon": [
      [
        642,
        380
      ],
      [
        666,
        382
      ],
      [
        666,
        398
      ],
      [
        678,
        400
      ],
      [
        680,
        478
      ],
      [
        645,
        477
      ]
    ],
    "registrationId": "ancient-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "ancient:main:elbow",
    "sourceRegionId": 458,
    "referencePoint": [
      316.5,
      453.5
    ],
    "referencePolygon": [
      [
        270,
        461
      ],
      [
        269,
        499
      ],
      [
        288,
        501
      ],
      [
        287,
        471
      ],
      [
        340,
        470
      ],
      [
        339,
        438
      ],
      [
        300,
        437
      ],
      [
        300,
        458
      ]
    ],
    "registrationId": "ancient-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "ancient:main:a-site",
    "sourceRegionId": 442,
    "referencePoint": [
      253.5,
      207.5
    ],
    "referencePolygon": [
      [
        213,
        188
      ],
      [
        209,
        226
      ],
      [
        273,
        227
      ],
      [
        273,
        188
      ]
    ],
    "registrationId": "ancient-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "ancient:main:red",
    "sourceRegionId": "atlas-Red",
    "referencePoint": [
      470,
      268
    ],
    "referencePolygon": [
      [
        503.2,
        360.2
      ],
      [
        447.8,
        359.8
      ],
      [
        447.8,
        331.8
      ],
      [
        454.6,
        322
      ],
      [
        453.3,
        283.5
      ],
      [
        436.1,
        282.7
      ],
      [
        436.5,
        242.8
      ],
      [
        493.6,
        243
      ],
      [
        495.8,
        322.3
      ],
      [
        502.5,
        331.4
      ]
    ],
    "registrationId": "ancient-main-atlas",
    "evidence": "Original author polygon aligned to current displayed overview by named room boundaries. Area anchor only. Reference interior point selected after displayed-artwork inspection to avoid a central obstacle/void or to mark the callout entrance/room rather than a distant part of a broad polygon."
  },
  {
    "anchorId": "ancient:main:donut",
    "sourceRegionId": "atlas-Donut",
    "referencePoint": [
      274,
      456
    ],
    "referencePolygon": [
      [
        336.9,
        413.7
      ],
      [
        278.7,
        412.6
      ],
      [
        258.7,
        430.7
      ],
      [
        257.7,
        481.9
      ],
      [
        276.9,
        496.8
      ],
      [
        336.9,
        497.5
      ],
      [
        355,
        479.7
      ],
      [
        361.4,
        468.7
      ],
      [
        361.8,
        438
      ]
    ],
    "registrationId": "ancient-main-atlas",
    "evidence": "Original author polygon aligned to current displayed overview by named room boundaries. Area anchor only. Reference interior point selected after displayed-artwork inspection to avoid a central obstacle/void or to mark the callout entrance/room rather than a distant part of a broad polygon."
  },
  {
    "anchorId": "ancient:main:mid",
    "sourceRegionId": "atlas-Mid",
    "referencePoint": [
      479.3,
      552.5
    ],
    "referencePolygon": [
      [
        394,
        443
      ],
      [
        394,
        470.4
      ],
      [
        421,
        470.4
      ],
      [
        442,
        487.8
      ],
      [
        443.4,
        525.8
      ],
      [
        425.8,
        546.4
      ],
      [
        374.8,
        546.4
      ],
      [
        374.8,
        588
      ],
      [
        426.8,
        588.6
      ],
      [
        426.7,
        597.2
      ],
      [
        524.8,
        597.9
      ],
      [
        524.1,
        481
      ],
      [
        555.5,
        481
      ],
      [
        555.2,
        443.7
      ],
      [
        523.7,
        444.1
      ]
    ],
    "registrationId": "ancient-main-atlas",
    "evidence": "Original author polygon aligned to current displayed overview by named room boundaries. Area anchor only."
  },
  {
    "anchorId": "ancient:main:cave",
    "sourceRegionId": "atlas-Cave",
    "referencePoint": [
      668.6,
      399.6
    ],
    "referencePolygon": [
      [
        684.9,
        362.1
      ],
      [
        639.1,
        362.1
      ],
      [
        639.8,
        462.6
      ],
      [
        649,
        462.6
      ],
      [
        649.4,
        487.9
      ],
      [
        675.6,
        487.7
      ],
      [
        675.9,
        462.6
      ],
      [
        683.9,
        462.6
      ],
      [
        683.9,
        449.1
      ],
      [
        697.3,
        449.2
      ],
      [
        699.5,
        375.2
      ],
      [
        685.1,
        375.2
      ]
    ],
    "registrationId": "ancient-main-atlas",
    "evidence": "Original author polygon aligned to current displayed overview by named room boundaries. Area anchor only."
  },
  {
    "anchorId": "ancient:main:b-short",
    "sourceRegionId": "atlas-Short",
    "referencePoint": [
      708,
      330
    ],
    "referencePolygon": [
      [
        692,
        237.2
      ],
      [
        692,
        348.2
      ],
      [
        723.7,
        345.3
      ],
      [
        723.7,
        237.2
      ]
    ],
    "registrationId": "ancient-main-atlas",
    "evidence": "Original author polygon aligned to current displayed overview by named room boundaries. Area anchor only. Reference interior point selected after displayed-artwork inspection to avoid a central obstacle/void or to mark the callout entrance/room rather than a distant part of a broad polygon."
  },
  {
    "anchorId": "ancient:main:b-long",
    "sourceRegionId": "atlas-Long",
    "referencePoint": [
      828,
      340
    ],
    "referencePolygon": [
      [
        804.5,
        377.7
      ],
      [
        804.5,
        228.4
      ],
      [
        831.5,
        228.4
      ],
      [
        831.5,
        237.2
      ],
      [
        851.8,
        237.2
      ],
      [
        852.4,
        325.4
      ],
      [
        834.7,
        325
      ],
      [
        835.3,
        378
      ]
    ],
    "registrationId": "ancient-main-atlas",
    "evidence": "Original author polygon aligned to current displayed overview by named room boundaries. Area anchor only. Reference interior point selected after displayed-artwork inspection to avoid a central obstacle/void or to mark the callout entrance/room rather than a distant part of a broad polygon."
  },
  {
    "anchorId": "anubis:main:a-main",
    "sourceRegionId": 961,
    "referencePoint": [
      664.88,
      338.97
    ],
    "referencePolygon": [
      [
        609.375,
        375
      ],
      [
        622.65625,
        376.5625
      ],
      [
        623.4375,
        380.46875
      ],
      [
        657.03125,
        379.6875
      ],
      [
        690.625,
        345.3125
      ],
      [
        690.625,
        297.65625
      ],
      [
        685.15625,
        296.875
      ],
      [
        684.375,
        281.25
      ],
      [
        656.25,
        280.46875
      ],
      [
        657.03125,
        296.875
      ],
      [
        651.5625,
        296.875
      ],
      [
        651.5625,
        320.3125
      ],
      [
        630.46875,
        321.875
      ],
      [
        630.46875,
        328.125
      ],
      [
        641.40625,
        328.125
      ],
      [
        641.40625,
        359.375
      ],
      [
        624.21875,
        359.375
      ],
      [
        610.15625,
        360.15625
      ]
    ],
    "registrationId": "anubis-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "anubis:main:b-site",
    "sourceRegionId": 956,
    "referencePoint": [
      271.06,
      398.69
    ],
    "referencePolygon": [
      [
        252.34375,
        421.09375
      ],
      [
        290.625,
        421.875
      ],
      [
        289.84375,
        385.9375
      ],
      [
        271.09375,
        367.1875
      ],
      [
        251.5625,
        367.1875
      ]
    ],
    "registrationId": "anubis-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "anubis:main:cave",
    "sourceRegionId": 982,
    "referencePoint": [
      297.28,
      262.13
    ],
    "referencePolygon": [
      [
        250.78125,
        260.15625
      ],
      [
        255.46875,
        285.9375
      ],
      [
        264.84375,
        278.90625
      ],
      [
        305.46875,
        279.6875
      ],
      [
        310.9375,
        278.125
      ],
      [
        314.84375,
        256.25
      ],
      [
        319.53125,
        240.625
      ],
      [
        317.1875,
        228.125
      ],
      [
        310.15625,
        226.5625
      ],
      [
        310.15625,
        217.1875
      ],
      [
        289.0625,
        215.625
      ],
      [
        289.84375,
        226.5625
      ],
      [
        279.6875,
        226.5625
      ],
      [
        279.6875,
        230.46875
      ],
      [
        285.9375,
        232.8125
      ],
      [
        288.28125,
        237.5
      ],
      [
        286.71875,
        241.40625
      ],
      [
        284.375,
        246.875
      ],
      [
        285.15625,
        251.5625
      ],
      [
        280.46875,
        256.25
      ],
      [
        275.78125,
        260.15625
      ],
      [
        264.84375,
        257.8125
      ],
      [
        259.375,
        257.8125
      ],
      [
        257.8125,
        260.15625
      ]
    ],
    "registrationId": "anubis-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "anubis:main:e-box",
    "sourceRegionId": 974,
    "referencePoint": [
      314.34,
      450.53
    ],
    "referencePolygon": [
      [
        290.625,
        441.40625
      ],
      [
        297.65625,
        441.40625
      ],
      [
        300,
        435.15625
      ],
      [
        313.28125,
        433.59375
      ],
      [
        331.25,
        432.03125
      ],
      [
        332.03125,
        470.3125
      ],
      [
        339.84375,
        474.21875
      ],
      [
        349.21875,
        474.21875
      ],
      [
        350,
        489.0625
      ],
      [
        339.84375,
        488.28125
      ],
      [
        339.84375,
        492.96875
      ],
      [
        299.21875,
        491.40625
      ],
      [
        297.65625,
        453.125
      ],
      [
        289.84375,
        452.34375
      ]
    ],
    "registrationId": "anubis-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "anubis:main:a-heaven",
    "sourceRegionId": 960,
    "referencePoint": [
      564.84,
      165.25
    ],
    "referencePolygon": [
      [
        553.90625,
        143.75
      ],
      [
        577.34375,
        144.53125
      ],
      [
        580.46875,
        173.4375
      ],
      [
        567.1875,
        181.25
      ],
      [
        561.71875,
        178.90625
      ],
      [
        557.03125,
        178.90625
      ],
      [
        554.6875,
        184.375
      ],
      [
        556.25,
        190.625
      ],
      [
        550,
        199.21875
      ],
      [
        546.875,
        209.375
      ],
      [
        545.3125,
        223.4375
      ],
      [
        542.1875,
        228.125
      ],
      [
        542.96875,
        232.8125
      ],
      [
        546.09375,
        235.9375
      ],
      [
        546.09375,
        241.40625
      ],
      [
        527.34375,
        240.625
      ],
      [
        527.34375,
        218.75
      ],
      [
        528.125,
        194.53125
      ],
      [
        528.125,
        187.5
      ],
      [
        538.28125,
        177.34375
      ],
      [
        547.65625,
        168.75
      ],
      [
        551.5625,
        160.9375
      ],
      [
        553.90625,
        152.34375
      ]
    ],
    "registrationId": "anubis-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "anubis:main:a-platform",
    "sourceRegionId": 987,
    "referencePoint": [
      553.84,
      285.69
    ],
    "referencePolygon": [
      [
        585.15625,
        295.3125
      ],
      [
        575,
        267.1875
      ],
      [
        549.21875,
        242.96875
      ],
      [
        550,
        246.875
      ],
      [
        546.875,
        246.875
      ],
      [
        546.09375,
        242.96875
      ],
      [
        527.34375,
        242.1875
      ],
      [
        527.34375,
        310.15625
      ],
      [
        531.25,
        313.28125
      ],
      [
        568.75,
        312.5
      ]
    ],
    "registrationId": "anubis-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "anubis:main:a-site",
    "sourceRegionId": 965,
    "referencePoint": [
      600,
      232
    ],
    "referencePolygon": [
      [
        579.6875,
        175
      ],
      [
        567.1875,
        181.25
      ],
      [
        567.96875,
        186.71875
      ],
      [
        565.625,
        191.40625
      ],
      [
        559.375,
        192.96875
      ],
      [
        554.6875,
        200.78125
      ],
      [
        552.34375,
        208.59375
      ],
      [
        551.5625,
        216.40625
      ],
      [
        551.5625,
        223.4375
      ],
      [
        556.25,
        232.8125
      ],
      [
        553.125,
        235.9375
      ],
      [
        550,
        239.0625
      ],
      [
        550,
        243.75
      ],
      [
        565.625,
        249.21875
      ],
      [
        585.9375,
        247.65625
      ],
      [
        600,
        245.3125
      ],
      [
        608.59375,
        241.40625
      ],
      [
        615.625,
        235.15625
      ],
      [
        623.4375,
        225.78125
      ],
      [
        623.4375,
        214.0625
      ],
      [
        625.78125,
        205.46875
      ],
      [
        609.375,
        179.6875
      ],
      [
        594.53125,
        179.6875
      ]
    ],
    "registrationId": "anubis-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius. Reference interior point selected after displayed-artwork inspection to avoid a central obstacle/void or to mark the callout entrance/room rather than a distant part of a broad polygon."
  },
  {
    "anchorId": "anubis:main:water",
    "sourceRegionId": 976,
    "referencePoint": [
      454.72,
      468.13
    ],
    "referencePolygon": [
      [
        349.21875,
        450
      ],
      [
        350.78125,
        492.1875
      ],
      [
        367.96875,
        492.1875
      ],
      [
        367.96875,
        486.71875
      ],
      [
        389.0625,
        485.9375
      ],
      [
        416.40625,
        485.9375
      ],
      [
        435.9375,
        486.71875
      ],
      [
        435.15625,
        492.96875
      ],
      [
        477.34375,
        493.75
      ],
      [
        477.34375,
        497.65625
      ],
      [
        493.75,
        496.875
      ],
      [
        495.3125,
        453.125
      ],
      [
        474.21875,
        451.5625
      ],
      [
        474.21875,
        442.1875
      ],
      [
        435.15625,
        440.625
      ],
      [
        435.15625,
        452.34375
      ],
      [
        414.0625,
        452.34375
      ],
      [
        389.0625,
        451.5625
      ],
      [
        368.75,
        451.5625
      ]
    ],
    "registrationId": "anubis-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "anubis:main:b-main",
    "sourceRegionId": 973,
    "referencePoint": [
      167.97,
      490.34
    ],
    "referencePolygon": [
      [
        281.25,
        569.53125
      ],
      [
        267.1875,
        553.90625
      ],
      [
        267.1875,
        485.15625
      ],
      [
        210.9375,
        484.375
      ],
      [
        192.1875,
        464.84375
      ],
      [
        186.71875,
        466.40625
      ],
      [
        160.15625,
        439.84375
      ],
      [
        130.46875,
        467.96875
      ],
      [
        136.71875,
        477.34375
      ],
      [
        138.28125,
        521.09375
      ],
      [
        223.4375,
        522.65625
      ],
      [
        223.4375,
        543.75
      ],
      [
        264.84375,
        584.375
      ]
    ],
    "registrationId": "anubis-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "anubis:main:b-ninja",
    "sourceRegionId": 980,
    "referencePoint": [
      321.66,
      413.72
    ],
    "referencePolygon": [
      [
        310.15625,
        403.90625
      ],
      [
        310.9375,
        424.21875
      ],
      [
        333.59375,
        425.78125
      ],
      [
        333.59375,
        399.21875
      ]
    ],
    "registrationId": "anubis-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "anubis:main:bridge",
    "sourceRegionId": 958,
    "referencePoint": [
      402.09,
      473.91
    ],
    "referencePolygon": [
      [
        396.09375,
        391.40625
      ],
      [
        394.53125,
        401.5625
      ],
      [
        385.9375,
        403.125
      ],
      [
        383.59375,
        415.625
      ],
      [
        385.15625,
        432.8125
      ],
      [
        389.0625,
        432.8125
      ],
      [
        385.15625,
        432.8125
      ],
      [
        388.28125,
        452.34375
      ],
      [
        385.15625,
        459.375
      ],
      [
        385.15625,
        481.25
      ],
      [
        389.0625,
        487.5
      ],
      [
        389.0625,
        503.90625
      ],
      [
        413.28125,
        504.6875
      ],
      [
        413.28125,
        485.9375
      ],
      [
        418.75,
        482.03125
      ],
      [
        417.96875,
        453.90625
      ],
      [
        413.28125,
        450
      ],
      [
        414.84375,
        434.375
      ],
      [
        417.96875,
        401.5625
      ],
      [
        417.96875,
        391.40625
      ]
    ],
    "registrationId": "anubis-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "anubis:main:pillar",
    "sourceRegionId": 970,
    "referencePoint": [
      231.53,
      448.88
    ],
    "referencePolygon": [
      [
        289.84375,
        434.375
      ],
      [
        289.84375,
        462.5
      ],
      [
        223.4375,
        462.5
      ],
      [
        207.03125,
        444.53125
      ],
      [
        230.46875,
        434.375
      ]
    ],
    "registrationId": "anubis-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "anubis:main:b-temple",
    "sourceRegionId": 978,
    "referencePoint": [
      287,
      329
    ],
    "referencePolygon": [
      [
        291.40625,
        353.125
      ],
      [
        268.75,
        342.96875
      ],
      [
        264.84375,
        338.28125
      ],
      [
        264.84375,
        324.21875
      ],
      [
        269.53125,
        319.53125
      ],
      [
        303.90625,
        317.96875
      ],
      [
        345.3125,
        316.40625
      ],
      [
        344.53125,
        298.4375
      ],
      [
        373.4375,
        296.875
      ],
      [
        374.21875,
        221.09375
      ],
      [
        379.6875,
        221.09375
      ],
      [
        379.6875,
        214.0625
      ],
      [
        397.65625,
        214.84375
      ],
      [
        397.65625,
        221.875
      ],
      [
        401.5625,
        222.65625
      ],
      [
        403.125,
        248.4375
      ],
      [
        423.4375,
        249.21875
      ],
      [
        423.4375,
        277.34375
      ],
      [
        398.4375,
        278.90625
      ],
      [
        396.875,
        350
      ],
      [
        355.46875,
        350
      ],
      [
        355.46875,
        347.65625
      ],
      [
        345.3125,
        346.09375
      ],
      [
        345.3125,
        343.75
      ],
      [
        327.34375,
        343.75
      ],
      [
        302.34375,
        345.3125
      ],
      [
        302.34375,
        337.5
      ],
      [
        291.40625,
        338.28125
      ]
    ],
    "registrationId": "anubis-main-totalcs",
    "evidence": "B-facing mouth of author Palace/Temple polygon, matched to displayed corridor behind B site."
  },
  {
    "anchorId": "anubis:main:mid-temple",
    "sourceRegionId": 978,
    "referencePoint": [
      387,
      321
    ],
    "referencePolygon": [
      [
        291.40625,
        353.125
      ],
      [
        268.75,
        342.96875
      ],
      [
        264.84375,
        338.28125
      ],
      [
        264.84375,
        324.21875
      ],
      [
        269.53125,
        319.53125
      ],
      [
        303.90625,
        317.96875
      ],
      [
        345.3125,
        316.40625
      ],
      [
        344.53125,
        298.4375
      ],
      [
        373.4375,
        296.875
      ],
      [
        374.21875,
        221.09375
      ],
      [
        379.6875,
        221.09375
      ],
      [
        379.6875,
        214.0625
      ],
      [
        397.65625,
        214.84375
      ],
      [
        397.65625,
        221.875
      ],
      [
        401.5625,
        222.65625
      ],
      [
        403.125,
        248.4375
      ],
      [
        423.4375,
        249.21875
      ],
      [
        423.4375,
        277.34375
      ],
      [
        398.4375,
        278.90625
      ],
      [
        396.875,
        350
      ],
      [
        355.46875,
        350
      ],
      [
        355.46875,
        347.65625
      ],
      [
        345.3125,
        346.09375
      ],
      [
        345.3125,
        343.75
      ],
      [
        327.34375,
        343.75
      ],
      [
        302.34375,
        345.3125
      ],
      [
        302.34375,
        337.5
      ],
      [
        291.40625,
        338.28125
      ]
    ],
    "registrationId": "anubis-main-totalcs",
    "evidence": "Mid-facing end of author Palace/Temple polygon, independently matched to displayed doorway west of Middle. Kept separate from B Temple."
  },
  {
    "anchorId": "anubis:main:b-ct",
    "sourceRegionId": 988,
    "referencePoint": [
      234,
      350
    ],
    "referencePolygon": [
      [
        261.71875,
        348.4375
      ],
      [
        227.34375,
        367.1875
      ],
      [
        215.625,
        364.0625
      ],
      [
        216.40625,
        285.9375
      ],
      [
        221.09375,
        285.15625
      ],
      [
        221.875,
        258.59375
      ],
      [
        249.21875,
        259.375
      ],
      [
        254.6875,
        285.9375
      ],
      [
        255.46875,
        314.84375
      ],
      [
        250,
        314.0625
      ],
      [
        250,
        335.15625
      ]
    ],
    "registrationId": "anubis-main-totalcs",
    "evidence": "B-facing end of author Street CT entrance polygon, matched to displayed west CT corridor entering B."
  },
  {
    "anchorId": "cache:main:z",
    "sourceRegionId": 596,
    "referencePoint": [
      220.5,
      437.5
    ],
    "referencePolygon": [
      [
        180,
        445
      ],
      [
        205,
        444
      ],
      [
        206,
        481
      ],
      [
        239,
        481
      ],
      [
        237,
        420
      ],
      [
        183,
        419
      ]
    ],
    "registrationId": "cache-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "cache:main:a-main",
    "sourceRegionId": 617,
    "referencePoint": [
      380.5,
      200.5
    ],
    "referencePolygon": [
      [
        357,
        346
      ],
      [
        395,
        349
      ],
      [
        409,
        173
      ],
      [
        353,
        174
      ]
    ],
    "registrationId": "cache-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "cache:main:mid",
    "sourceRegionId": 585,
    "referencePoint": [
      283.5,
      436.5
    ],
    "referencePolygon": [
      [
        236,
        484
      ],
      [
        399,
        487
      ],
      [
        399,
        392
      ],
      [
        235,
        387
      ]
    ],
    "registrationId": "cache-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "cache:main:forklift",
    "sourceRegionId": 593,
    "referencePoint": [
      319.5,
      256.5
    ],
    "referencePolygon": [
      [
        278,
        265
      ],
      [
        352,
        265
      ],
      [
        354,
        247
      ],
      [
        283,
        249
      ]
    ],
    "registrationId": "cache-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "cache:main:whitebox",
    "sourceRegionId": 598,
    "referencePoint": [
      282.5,
      398.5
    ],
    "referencePolygon": [
      [
        272,
        410
      ],
      [
        298,
        410
      ],
      [
        297,
        386
      ],
      [
        267,
        388
      ]
    ],
    "registrationId": "cache-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "cache:main:boost",
    "sourceRegionId": 572,
    "referencePoint": [
      412.5,
      369.5
    ],
    "referencePolygon": [
      [
        373,
        391
      ],
      [
        437,
        392
      ],
      [
        433,
        347
      ],
      [
        370,
        350
      ]
    ],
    "registrationId": "cache-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "cache:main:b-main",
    "sourceRegionId": 575,
    "referencePoint": [
      348.5,
      574.5
    ],
    "referencePolygon": [
      [
        319,
        580
      ],
      [
        334,
        628
      ],
      [
        391,
        628
      ],
      [
        367,
        523
      ],
      [
        318,
        524
      ]
    ],
    "registrationId": "cache-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "cache:main:garage",
    "sourceRegionId": 574,
    "referencePoint": [
      445.5,
      438.5
    ],
    "referencePolygon": [
      [
        401,
        484
      ],
      [
        529,
        482
      ],
      [
        528,
        393
      ],
      [
        399,
        393
      ]
    ],
    "registrationId": "cache-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "cache:main:b-tree",
    "sourceRegionId": 616,
    "referencePoint": [
      137.5,
      595.5
    ],
    "referencePolygon": [
      [
        124,
        614
      ],
      [
        149,
        616
      ],
      [
        152,
        519
      ],
      [
        131,
        518
      ]
    ],
    "registrationId": "cache-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "cache:main:b-heaven",
    "sourceRegionId": 613,
    "referencePoint": [
      209.5,
      498.5
    ],
    "referencePolygon": [
      [
        193,
        577
      ],
      [
        227,
        580
      ],
      [
        227,
        480
      ],
      [
        193,
        482
      ]
    ],
    "registrationId": "cache-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "cache:main:highway",
    "sourceRegionId": 595,
    "referencePoint": [
      259.5,
      374.5
    ],
    "referencePolygon": [
      [
        238,
        407
      ],
      [
        282,
        408
      ],
      [
        280,
        309
      ],
      [
        237,
        308
      ]
    ],
    "registrationId": "cache-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "cache:main:sandbags",
    "sourceRegionId": 570,
    "referencePoint": [
      289.5,
      467.5
    ],
    "referencePolygon": [
      [
        277,
        486
      ],
      [
        305,
        486
      ],
      [
        306,
        451
      ],
      [
        268,
        451
      ]
    ],
    "registrationId": "cache-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "cache:main:vents",
    "sourceRegionId": 571,
    "referencePoint": [
      360,
      480
    ],
    "referencePolygon": [
      [
        337,
        489
      ],
      [
        333,
        503
      ],
      [
        369,
        503
      ],
      [
        384,
        468
      ],
      [
        356,
        469
      ]
    ],
    "registrationId": "cache-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius. Reference interior point selected after displayed-artwork inspection to avoid a central obstacle/void or to mark the callout entrance/room rather than a distant part of a broad polygon."
  },
  {
    "anchorId": "cache:main:a-site",
    "sourceRegionId": 567,
    "referencePoint": [
      250,
      220
    ],
    "referencePolygon": [
      [
        220,
        268
      ],
      [
        353,
        263
      ],
      [
        358,
        170
      ],
      [
        219,
        177
      ]
    ],
    "registrationId": "cache-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius. Reference interior point selected after displayed-artwork inspection to avoid a central obstacle/void or to mark the callout entrance/room rather than a distant part of a broad polygon."
  },
  {
    "anchorId": "cache:main:b-site",
    "sourceRegionId": 578,
    "referencePoint": [
      287.5,
      637.5
    ],
    "referencePolygon": [
      [
        244,
        668
      ],
      [
        318,
        670
      ],
      [
        322,
        605
      ],
      [
        240,
        605
      ]
    ],
    "registrationId": "cache-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "cache:main:a-default",
    "sourceRegionId": 592,
    "referencePoint": [
      275.5,
      202.5
    ],
    "referencePolygon": [
      [
        259,
        210
      ],
      [
        283,
        215
      ],
      [
        292,
        190
      ],
      [
        253,
        192
      ]
    ],
    "registrationId": "cache-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "cache:main:sunroom",
    "sourceRegionId": 607,
    "referencePoint": [
      432.5,
      652.5
    ],
    "referencePolygon": [
      [
        341,
        673
      ],
      [
        456,
        675
      ],
      [
        455,
        629
      ],
      [
        346,
        632
      ]
    ],
    "registrationId": "cache-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "cache:main:b-default",
    "sourceRegionId": 608,
    "referencePoint": [
      260.5,
      625.5
    ],
    "referencePolygon": [
      [
        243,
        635
      ],
      [
        271,
        638
      ],
      [
        271,
        614
      ],
      [
        243,
        617
      ]
    ],
    "registrationId": "cache-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "cache:main:quad",
    "sourceRegionId": 591,
    "referencePoint": [
      237.5,
      155.5
    ],
    "referencePolygon": [
      [
        218,
        175
      ],
      [
        275,
        174
      ],
      [
        276,
        137
      ],
      [
        219,
        137
      ]
    ],
    "registrationId": "cache-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "cache:main:headshot",
    "sourceRegionId": 609,
    "referencePoint": [
      232.5,
      624.5
    ],
    "referencePolygon": [
      [
        225,
        670
      ],
      [
        242,
        672
      ],
      [
        241,
        603
      ],
      [
        223,
        602
      ]
    ],
    "registrationId": "cache-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "cache:main:squeaky",
    "sourceRegionId": 587,
    "referencePoint": [
      417.5,
      155.5
    ],
    "referencePolygon": [
      [
        302,
        172
      ],
      [
        436,
        174
      ],
      [
        435,
        138
      ],
      [
        302,
        140
      ]
    ],
    "registrationId": "cache-main-totalcs",
    "evidence": "Interior of the named author polygon, individually compared with the displayed artwork. Area anchor only; no measured grenade impact or radius."
  },
  {
    "anchorId": "vertigo:upper:a-site",
    "sourceRegionId": 513,
    "referencePoint": [
      400.5,
      601.5
    ],
    "referencePolygon": [
      [
        420,
        581
      ],
      [
        420,
        575
      ],
      [
        374,
        574
      ],
      [
        373,
        587
      ],
      [
        374,
        629
      ],
      [
        435,
        629
      ],
      [
        436,
        592
      ],
      [
        426,
        592
      ],
      [
        425,
        581
      ]
    ],
    "registrationId": "vertigo-upper-totalcs-landmarks",
    "evidence": "Independently matched unchanged named area/landmark to displayed upper radar. Reference composite is not globally registered; this anchor is directly measured on displayed1024 artwork.",
    "artworkPoint": [
      721,
      598
    ]
  },
  {
    "anchorId": "vertigo:upper:b-site",
    "sourceRegionId": 506,
    "referencePoint": [
      111.5,
      393.5
    ],
    "referencePolygon": [
      [
        138,
        421
      ],
      [
        74,
        420
      ],
      [
        73,
        390
      ],
      [
        105,
        364
      ],
      [
        138,
        362
      ]
    ],
    "registrationId": "vertigo-upper-totalcs-landmarks",
    "evidence": "Independently matched unchanged named area/landmark to displayed upper radar. Reference composite is not globally registered; this anchor is directly measured on displayed1024 artwork.",
    "artworkPoint": [
      227,
      242
    ]
  },
  {
    "anchorId": "vertigo:upper:mid",
    "sourceRegionId": 485,
    "referencePoint": [
      174.5,
      472.5
    ],
    "referencePolygon": [
      [
        147,
        445
      ],
      [
        211,
        446
      ],
      [
        212,
        492
      ],
      [
        207,
        492
      ],
      [
        207,
        495
      ],
      [
        192,
        493
      ],
      [
        192,
        507
      ],
      [
        207,
        509
      ],
      [
        207,
        559
      ],
      [
        157,
        557
      ],
      [
        158,
        521
      ],
      [
        147,
        521
      ]
    ],
    "registrationId": "vertigo-upper-totalcs-landmarks",
    "evidence": "Independently matched unchanged named area/landmark to displayed upper radar. Reference composite is not globally registered; this anchor is directly measured on displayed1024 artwork.",
    "artworkPoint": [
      375,
      484
    ]
  },
  {
    "anchorId": "vertigo:upper:b-stairs",
    "sourceRegionId": 482,
    "referencePoint": [
      93.5,
      549.5
    ],
    "referencePolygon": [
      [
        83,
        491
      ],
      [
        82,
        561
      ],
      [
        138,
        562
      ],
      [
        137,
        535
      ],
      [
        119,
        535
      ],
      [
        119,
        545
      ],
      [
        103,
        543
      ],
      [
        103,
        493
      ]
    ],
    "registrationId": "vertigo-upper-totalcs-landmarks",
    "evidence": "Independently matched unchanged named area/landmark to displayed upper radar. Reference composite is not globally registered; this anchor is directly measured on displayed1024 artwork.",
    "artworkPoint": [
      215,
      438
    ]
  },
  {
    "anchorId": "vertigo:upper:a-ramp",
    "sourceRegionId": 491,
    "referencePoint": [
      338.5,
      693.5
    ],
    "referencePolygon": [
      [
        316,
        632
      ],
      [
        356,
        632
      ],
      [
        357,
        682
      ],
      [
        407,
        682
      ],
      [
        408,
        717
      ],
      [
        316,
        716
      ]
    ],
    "registrationId": "vertigo-upper-totalcs-landmarks",
    "evidence": "Independently matched unchanged named area/landmark to displayed upper radar. Reference composite is not globally registered; this anchor is directly measured on displayed1024 artwork.",
    "artworkPoint": [
      713,
      742
    ]
  },
  {
    "anchorId": "vertigo:upper:sandbags",
    "sourceRegionId": 492,
    "referencePoint": [
      427.5,
      716.5
    ],
    "referencePolygon": [
      [
        409,
        742
      ],
      [
        408,
        717
      ],
      [
        426,
        703
      ],
      [
        452,
        702
      ],
      [
        453,
        717
      ],
      [
        441,
        716
      ],
      [
        441,
        730
      ],
      [
        428,
        728
      ],
      [
        428,
        742
      ]
    ],
    "registrationId": "vertigo-upper-totalcs-landmarks",
    "evidence": "Independently matched unchanged named area/landmark to displayed upper radar. Reference composite is not globally registered; this anchor is directly measured on displayed1024 artwork.",
    "artworkPoint": [
      744,
      784
    ]
  },
  {
    "anchorId": "nuke:upper:mustang",
    "sourceRegionId": 928,
    "referencePoint": [
      419.4381099126862,
      389.1535695942476
    ],
    "referencePolygon": [
      [
        417,
        434
      ],
      [
        414,
        352
      ],
      [
        424,
        352
      ],
      [
        423,
        432
      ]
    ],
    "registrationId": "nuke-upper-totalcs",
    "evidence": "Original Result shows fire along the elevated A-side catwalk directly above the Hut exit, next to the yellow bridge and opposite the A-site silos. This matches the separate Mustang region, not the northern Rafters anchor."
  },
  {
    "anchorId": "nuke:upper:secret",
    "sourceRegionId": 945,
    "referencePoint": [
      540.6422764227642,
      579
    ],
    "referencePolygon": [
      [
        523,
        599
      ],
      [
        558,
        600
      ],
      [
        558,
        558
      ],
      [
        523,
        559
      ]
    ],
    "registrationId": "nuke-upper-totalcs",
    "evidence": "Original Result shows the Outside doorway, upper Secret landing and first descending stairs beside the B-arrow sign. The named upper Secret entrance is defensible; it is not the lower Tunnels/Decon room."
  },
  {
    "anchorId": "anubis:main:t-stairs",
    "sourceRegionId": 981,
    "referencePoint": [
      540.3069572153553,
      523.639898000201
    ],
    "referencePolygon": [
      [
        527.34375,
        500.78125
      ],
      [
        548.4375,
        500.78125
      ],
      [
        548.4375,
        525.78125
      ],
      [
        558.59375,
        532.8125
      ],
      [
        559.375,
        538.28125
      ],
      [
        543.75,
        548.4375
      ],
      [
        534.375,
        539.0625
      ],
      [
        527.34375,
        536.71875
      ]
    ],
    "registrationId": "anubis-main-totalcs",
    "evidence": "Original Result shows the HE at the building/window beside the T-side descending steps. Total CS explicitly lists T Stairs as an alias of the separate Stairs region leading from Alley toward Canal. This is separate from the short Bridge/Double Doors stairs."
  },
  {
    "anchorId": "anubis:main:mid-doors",
    "sourceRegionId": 985,
    "referencePoint": [
      448.42154131847724,
      415.2394527623027
    ],
    "referencePolygon": [
      [
        418.75,
        402.34375
      ],
      [
        415.625,
        434.375
      ],
      [
        435.15625,
        435.15625
      ],
      [
        435.9375,
        437.5
      ],
      [
        435.9375,
        436.71875
      ],
      [
        474.21875,
        436.71875
      ],
      [
        475,
        421.875
      ],
      [
        478.90625,
        421.875
      ],
      [
        478.125,
        403.90625
      ],
      [
        471.09375,
        401.5625
      ],
      [
        466.40625,
        398.4375
      ],
      [
        471.09375,
        389.84375
      ],
      [
        437.5,
        387.5
      ],
      [
        440.625,
        390.625
      ],
      [
        441.40625,
        399.21875
      ],
      [
        438.28125,
        401.5625
      ]
    ],
    "registrationId": "anubis-main-totalcs",
    "evidence": "Original Result shows one fire patch at the foot of the adjacent window and open wooden double door, with the small stair approach in front. This can bind this exact guide to the Double Doors area. Do not generally alias arbitrary composite Mid Doors/Window targets or average different destinations."
  }
];
