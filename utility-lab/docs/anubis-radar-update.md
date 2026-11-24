# Anubis radar refresh

On 24 November 2026, the displayed Anubis radar was refreshed to the original setpos.gg v22 artwork dated 19 November. The previous project copy dated 23 October had older interior details around Mid and the Camera approaches.

The original dark and light SVGs are used without changing their geometry:

- [Original dark radar](https://setpos.gg/radars/anubis/radar.svg?v=43192fdef65d), SHA-256 `43192fdef65da5f94d5b8b137f5f2116129fa7e9c0b12d6c256610e4a9da5333`.
- [Original light radar](https://setpos.gg/radars/anubis/radar.light.svg?v=e8cddaba0b50), SHA-256 `e8cddaba0b501ead54d0a9c18c1c8a45ba6fe23c404feb215eba4df16043cda2`.

The app uses versioned files `anubis-v22.svg` and `anubis-v22-light.svg` so existing immutable browser and CDN caches cannot retain the previous artwork at those addresses. Both retain the native 1024×1024 coordinate frame. Three widely separated landmarks on the old/current radar agree within 1.2 native pixels. The application's normalized 1000-unit image coordinates and existing calibrated source transforms therefore remain stable; source positions are not moved to new invented locations. CSNADES and GO NADE registration overlays were also reviewed against the updated frame. Registration evidence is in `docs/data/precise-anubis-evidence.json` and `docs/map-registration-precision/`.

This updates navigation artwork. It does not establish that every historical throw still works in the current game. Source dates, images, exact inputs and matching videos are reviewed separately, using public online material only.
