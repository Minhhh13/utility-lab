# Map-only utility selection

The public website is [utilitylab.au](https://utilitylab.au), with local development available at http://127.0.0.1:5180.

Normal Lineups browsing gives the map the full working area. There is no right reference sidebar, location list or permanent detail panel. A personal editor can still open explicitly from the viewer's actions.

The main map uses neutral 36px circles with actual Smoke, Flash, Molly and HE glyphs and 46px hit areas. Nearby places share a fixed group marker at a real member coordinate. Panning moves it with the map; it never slides into an offset grid. Main markers have no pastel pie sectors or leader lines. Hover/focus and accessible labels retain group context. Zoom can refine nearby groups.

The map asks only for necessary choices after active filters. A group with one available utility and one exact destination opens standing pins directly. One utility with several destinations opens landing pins directly. Several utilities open the radial; choosing a type shows landing pins only when several exact destinations exist, otherwise it opens standing pins. Photos never open automatically: select a standing pin, even if it is the only one. There is no named-area or landing-choice list.

While the radial is open, the entire overview-marker layer is hidden so utility choices have clear space. The old overlapping chooser hint is removed.

The selected utility exposes every distinct registered destination represented by the group. Its identity includes semantic area, map, floor, side, utility type and the publisher's two-decimal destination coordinate. Recipes at the same point stay together. Full catalogue membership is retained behind the overview; preferred recipes affect ordering, not which landing locations exist. This avoids hiding Mid Doors, Lower Tunnels, Xbox or another nearby place inside the first few source recipes.

Landing pins can use constrained badge separation for tap clearance while their real registered anchors remain unchanged. This adjustment is limited to the landing step. Resolving the landing, either directly for a single destination or through a landing-pin choice, offers up to four distinct standing recipes with real source coordinates and source-supported floors. Standing pins do not fan out onto invented map locations. Their photos provide the standing and aim reference, keys and optional video.

Group, utility, landing and standing selections, opening photos, and Back to targets preserve the current zoom and pan on the same floor. Selection does not zoom or recenter the map; keyboard focus also avoids scrolling. Manual wheel/pinch zoom remains available to 4×, with pan and Fit controls. A different map or floor retains its normal fit behavior. Back to targets also cancels a pending source lookup. Keyboard selection and reduced motion remain immediate.

Display settings groups In-game view, persistent Auto / 16:9 / 4:3 desktop frames and Hide top bar. A floating 44px Show top bar control restores the header. Narrow phones fit automatically while preserving the desktop frame preference. These controls preserve map geometry and editor state. Home stays full-screen; the saved ratio applies to the working tabs.

The viewer header contains the Save/Unsave star and ellipsis menu. Copy lineup link, Download lineup and Make my own remain available; personal guides also offer Edit personal lineup and Delete your lineup. Saving a personal edit returns to the viewer. Global Saved, combined utility filters, source attribution, uploaded-media backups and existing deep links remain intact.

Active implementation: `Utilities.tsx`, `utility-markers.ts`, `UtilityTargetMarker.tsx`, `MarkerChoices.tsx`, `GuideActions.tsx` and `useMapNavigation.ts`. `AreaChoices.tsx` and `LandingChoices.tsx` are legacy components, not the active flow. Executable contracts are maintained in the marker/navigation models and overview, landing, origin and viewer browser suites. Final run results belong in the [verification record](verification.md).

The public deployment uploaded the verified filtered static artifact directly and did not push the current working tree to GitHub. Browser storage is separate at each origin: use Workspace settings → Export workspace locally, then Import backup on the public URL to transfer saved work. Remote source photos and videos still require internet; bundled offline content uses the existing explicit download actions.

This UI revision changes navigation and presentation. It does not change published coordinates or establish independent throw accuracy on the current game build. No CS2, Steam, game process, installation or game file is accessed.
