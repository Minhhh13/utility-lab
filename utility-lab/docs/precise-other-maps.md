# More precise origins for existing targets

Reviewed 24 November 2026. This batch adds 27 public-source spawn recipes for existing target areas and improves five existing Vertigo references. It creates no new landing areas and preserves all IDs on the five overrides. Research and media checks used project files and public prerecorded footage only.

| Map | Existing destination | New source recipes | Source spawn numbers |
| --- | --- | --- | --- |
| Dust II | Mid Doors | 4 | T 3, 12, 14, 15 |
| Dust II | Long Doors | 3 | CT 1, 2, 3 |
| Inferno | Shallow Mid | 6 | CT 1–6 |
| Nuke | Vent | 4 | T 5–8 |
| Cache | B Main | 10 | T 1–10 |
| Vertigo | CT Spawn, EBox, Front Elevator, Generator Left | 5 improved references | Existing Stairs, T Spawn and Ramp setups |

The source numbers above belong to setpos.gg, not a universal ordering shared with CS2Tricks. Source families distinguish them. Each new recipe has its own documented world-space starting point, original aim photograph, matching native MP4 and landing image. Run-up recipes also retain the original release reference. Twenty-seven unchanged first-person starting frames at 0.2s were extracted from their clips at the native 1280×720 size; the map supplies the exact starting marker. These are spawn-context photos, not separately captured third-person or look-down photos.

Inputs preserve meaningful differences. Dust II T 3 and T 14 use stationary jumpthrows; T 12 and T 15 use W jumpthrows. Inferno CT 1–2 use jumpthrows, while CT 3–6 add W. Nuke Vent and Cache B Main recipes have continuous W run-ups with source-specific release timing, rather than being relabelled Tap W. Dust II CT 1–3 explicitly start with A, change to A + S and jumpthrow; the recorded phase durations appear in the Throw caption and steps. The original videos remain the timing reference, and none is presented as independently validated in-game.

Raw source data comes from [Dust II](https://setpos.gg/dust2), [Inferno](https://setpos.gg/inferno), [Nuke](https://setpos.gg/nuke) and [Cache](https://setpos.gg/cache). Per-recipe canonical links are retained in the data and gallery attribution. The [Dust II T 14 Mid Doors](https://setpos.gg/dust2/mid-doors/t14), [T 12](https://setpos.gg/dust2/mid-doors/t12) and [T 3](https://setpos.gg/dust2/mid-doors/t3) pages explicitly distinguish their throws.

Registration uses each publisher map's public world-to-radar calibration, normalized from its native 1024-unit SVG grid to the app's 1000-unit image frame. Inferno, Nuke and Cache exterior clip geometry matches the bundled artwork exactly at all sampled points. Current Dust II is a redrawn version of the same grid: exterior samples average 2.19 native pixels from the old boundary, with a 10.04px maximum; three distant landmarks are within 0.66–3.15px. All four map pairs were visually reviewed. This establishes navigation alignment, not an exact smoke radius or game-physics measurement.

Each recipe's `targetMatch` records an existing guide, target and area ID. Inferno's source calls the target Mid; its result photos were compared with the existing Shallow Mid guide and show the same street choke, yellow shuttered corner, balcony and rubbish bags. Other selected families retain the same explicit target name. Raw destination and impact coordinates remain available; the UI's callout markers identify areas.

Vertigo has no current setpos catalogue. Five original CS2Tricks references instead gain precise setup/aim/release text and unchanged publisher aim-detail images. The most significant correction is [EBox from Stairs](https://www.cs2tricks.com/nades/vertigo/smokes/ebox-from-stairs-bc18): crouch to align, then stand before releasing LMB. Its throw-key label describes the standing release; steps and Aim captions explain the crouched setup. [Front Elevator](https://www.cs2tricks.com/nades/vertigo/smokes/front-elevator-from-ramp-ab1b) keeps both-button jumpthrow instructions, and [Generator Left](https://www.cs2tricks.com/nades/vertigo/smokes/generator-left-from-stairs-b2bb) keeps the crouched throw.

Selection deliberately excludes missing evidence: Dust II T 1 Mid Doors has no supplied aim image; T 11 and some CT Long Doors/Cache Garage references include repositioning without complete direction-key data; Nuke T 1–4 Vent is not fully represented in this source. Unnamed or new target destinations are also excluded. Existing catalogue recipes remain available; no missing spawn is fabricated to fill a count.

Verification: all 27 source MP4s decoded and sought successfully, with known duration and a ready frame; all corresponding aim/release and landing images returned 200 and have recorded hashes. Native stills total about 5.14MB. The new references satisfy the existing complete-guide/validation rules. Five Vertigo detail images returned 200; the T-spawn EBox MP4 decoded and played at 1920×1080, and all five corresponding YouTube embeds entered Playing with advancing time and no player error. Detailed evidence is `docs/data/precise-other-maps-evidence.json`, with raw source snapshots, map comparison captures and media audit scripts in ignored `outputs/research/precise-other/`.
