import type { UtilityReference } from "../utility-data.ts";

/** Manually reviewed original CS2Nades B-retake clip, with unchanged local source frames.
 * The Aim region preserves the original crosshair/sign/sink and excludes unrelated sponsor graphics.
 * Evidence: docs/data/expanded-nuke-completions-evidence.json. Online sources only.
 */
export const EXPANDED_NUKE_COMPLETIONS: UtilityReference[] = [
  {
    "id": "expanded-cs2nades-nuke-b-retake-flash-ambxvjoxmg8",
    "mapId": "nuke",
    "levelId": "lower",
    "side": "CT",
    "type": "Flash",
    "title": "B site retake flash · Decon",
    "from": "Decon",
    "target": "B Site",
    "purpose": "Flash B site before peeking from Decon.",
    "throwType": "LMB",
    "steps": [
      "Stand in Decon’s corner beside the red toolbox.",
      "Aim at the marked spot beside the glove sign, above the sink.",
      "Release LMB.",
      "Open Decon and peek after the flash."
    ],
    "x": 500,
    "y": 500,
    "showMarker": false,
    "userCreated": false,
    "photos": [
      {
        "image": "/lineup-media/source-video-stills/cs2nades/nuke/b-retake-flash-position-3500ms.jpg",
        "kind": "position",
        "caption": "Stand in Decon’s corner beside the red toolbox.",
        "creator": "CS2 Nades 💣",
        "source": "https://www.youtube.com/watch?v=AmbXVJOXMG8",
        "annotationId": "sourceframe@3500ms"
      },
      {
        "image": "/lineup-media/source-video-stills/cs2nades/nuke/b-retake-flash-aim-7000ms.jpg",
        "kind": "aim",
        "caption": "Aim at the marked spot beside the glove sign, above the sink.",
        "creator": "CS2 Nades 💣",
        "source": "https://www.youtube.com/watch?v=AmbXVJOXMG8",
        "annotationId": "sourceframe@7000ms",
        "region": {
          "x": 430,
          "y": 460,
          "width": 650,
          "height": 1460,
          "sourceWidth": 1080,
          "sourceHeight": 1920
        }
      },
      {
        "image": "/lineup-media/source-video-stills/cs2nades/nuke/b-retake-flash-landing-11000ms.jpg",
        "kind": "landing",
        "caption": "The flash covers B site through Decon.",
        "creator": "CS2 Nades 💣",
        "source": "https://www.youtube.com/watch?v=AmbXVJOXMG8",
        "annotationId": "sourceframe@11000ms"
      }
    ],
    "videoUrl": "https://www.youtube.com/watch?v=AmbXVJOXMG8",
    "creator": "CS2 Nades 💣",
    "source": "https://www.youtube.com/watch?v=AmbXVJOXMG8",
    "tags": [
      "Photos + video",
      "Retake"
    ]
  }
];
