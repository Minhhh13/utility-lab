# Launch artwork

## Preferred pixel-art revision

The user rejected the initial realistic render as looking too AI-generated and requested a full-screen pixel-art scene with moving parts. `public/art/launch-pixel.png` is the selected background. It was generated with the built-in ImageGen tool using `launch-art.jpg` as an edit reference, preserving the courtyard composition while replacing the rendering style with coarse pixel-art architecture. It has no text/UI. Transparent `public/art/pixel-smoke.png` and CSS pixel particles provide separate moving layers. Motion pauses when hidden, supports a pause control, and respects reduced motion. Original realistic files are archived in ignored local `outputs/art-history/` and are excluded from the served application.

Exact revision prompt:

Use case: style-transfer. Edit target: the attached courtyard artwork. Re-create this composition as AUTHENTIC COARSE PIXEL ART for a full-screen game menu background. Preserve the readable architecture layout: quiet dark wall on the left third, stone arch and courtyard center, stone steps and blue-trimmed buildings on right, warm sunset sky above. Replace all realistic rendering with a deliberately low-resolution late-1990s 16-bit/32-bit point-and-click adventure game background. Work as if hand-pixelled on a 320 x 180 canvas and shown at 6x nearest-neighbor scale: clearly visible square pixel blocks, carefully stepped silhouette edges, hard color clusters, sparse deliberate dithering, limited approximately 32-color palette. Crisp, simple, charming, readable pixel architecture. Warm sandstone ochre and muted terracotta, deep blue-grey shadows, dusty blue shutters, soft peach sunset sky in flat stepped bands. Large architectural shapes over busy tiny texture. Hanging fabric and palms can stay as simplified pixel shapes. Keep smoke almost absent: only a few small muted wisps; animated smoke will be a separate layer. This is image artwork only, covering the entire widescreen canvas edge to edge. NO text, logos, lettering, numbers, UI, borders or watermark. NO photographic texture, smooth gradients, anti-aliasing, realistic 3D, painterly brush strokes, glossy surfaces, fake CRT scanlines or densely noisy dithering. It must visibly read as a true low-resolution videogame background, not a realistic scene with a pixel filter.

The generated pixel artwork was visually inspected before selecting it. It is 1672 × 941 pixels. No claim of exclusive copyright or official Counter-Strike affiliation is made.

## Initial realistic source

Created on 9 November 2026 with the built-in ImageGen tool for Utility Lab's opening screen. This is newly generated concept artwork, not a screenshot of a Valve map, an official Counter-Strike asset, or a copy of TouchLine's artwork. No claim of exclusive copyright or official endorsement is made.

Files:

- `outputs/art-history/launch-art.png` — original generated raster artwork, 1672 × 941 pixels (local history).
- `outputs/art-history/launch-art.jpg` — same artwork converted to JPEG at quality 86. The image content and dimensions are unchanged (local history).

## Exact generation prompt

Use case: stylized-concept. Asset type: cinematic widescreen background artwork for a Counter-Strike 2 fan tactic-planning app's opening screen. Create ONE original, premium tactical-FPS videogame environment: a dusty Mediterranean / North-African stone courtyard with layered rooftops, an arched passage and worn stairs, softly billowing volumetric smoke winding through the architecture. High-end realistic 3D game key art with beautiful material detail and strong atmospheric depth, warm terracotta and sandstone in evening golden sunlight, cool slate shadows with a few subtle blue architectural accents. Composition: landscape 16:9 or wider, roughly 2048px wide; architectural focal cluster in center and right; left third a calmer darker stone/smoke area suitable for live webpage text laid over later. Camera is a dramatic low-to-medium wide angle across the courtyard. No people or weapons needed. Opaque background. NO text, letters, numbers, logos, watermarks, signs, menu, UI, badges or poster typography. Do not imitate a screenshot or exact existing game map. Avoid flat illustration, SVG-like outlines, collage, neon sci-fi, purple gradients, excessive orange/teal grading. The result should feel like an inviting, polished place to plan a competitive round.
