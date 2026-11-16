# Utility Lab mark and motion

The name stays **Utility Lab**. The current logo restores the previous **route symbol**: three circular nodes and a diamond endpoint on its original 48-unit grid. The displayed symbol has no square tile, border or background. It follows the existing accent/theme colour; the wordmark remains beside it. The UL letter monogram was removed at the user’s request.

`src/BrandMark.tsx` uses the same route geometry as canonical `public/icon.svg` and `public/favicon.svg`. `ios/scripts/generate-brand-assets.mjs` renders the matching web installation icons, Apple touch icon, 1024px native icon and native launch images from that source. Installation icons use the same route symbol on a flat platform icon field; the displayed web logo/favicon stay transparent. These are prepared assets; the iOS app has not been compiled or signed.

Home keeps the three existing Dust recreations: original CS, Source and early CS:GO. A very slow 48-second image drift, restrained light, smoke and dust add motion only to decorative layers. Landscape changes crossfade after loading, and the compact selector remains in the top bar. There is no Courtyard scene.

Workspace changes use interruptible 160ms opacity fades, with a lightweight entry fallback in browsers without View Transitions. Rapid navigation keeps the latest destination; keyboard navigation stays immediate. Reduced motion removes scene movement and navigation fades. Hidden pages pause the decorative loops. Operational maps keep their scale and coordinates without decorative animation.

Current visual evidence is in `outputs/brand-motion-review/desktop-home.png` and `phone-home.png`; the accompanying `audit.json` records targeted browser checks. Earlier route-mark reviews describe a historical design, not the current logo. Steam overlay, physical iPhone and Xcode behavior remain unverified.
