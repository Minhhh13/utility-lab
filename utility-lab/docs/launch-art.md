# Home illustrations

Utility Lab’s Home paintings revisit map locations from early Counter-Strike and Counter-Strike: Source. Each scene is drawn from lines, polygons and layers of colour on a 768 × 432 grid. Rebuilding the collection requires Python and Pillow. The generator also makes the 96 × 54 picker thumbnails. [Drawing script](../scripts/draw-map-scenes.py) · [Source and rail-yard scenes](../scripts/industrial_map_scenes.py)

| Map | Scene |
| --- | --- |
| Dust · CS 1999 | The low underpass, wall recesses and timber crates |
| Dust · Source | A domed courtyard with overhead wires, the sunken road and an abandoned car |
| Dust II · CS 1.6 | The B-site platform and classic wooden crates |
| Aztec · CS 1.6 | The rope bridge across the river and its stone approaches |
| Inferno · Source | The chapel and produce crates beside the B-site fountain |
| Nuke · Source | The outside yard’s silo, sloped shed and shipping container |
| Train · CS 1.6 | Rail cars with end ladders between concrete sheds |
| Office · Source | The snowy front yard, loading shutter and glazed connector |

From the application directory, run `python scripts/draw-map-scenes.py` with Pillow installed to rebuild both WebP sets.

The 1999 Dust painting opens by default. Home remembers the player’s choice on the device. Opening the picker loads the previews, and choosing a map loads its full illustration. Players can include all eight paintings and previews in the offline map download. [Home motion](background-motion.md)

Dave Johnston’s illustrated map histories document the original Dust underpass and Dust II’s B-site platform. [The Making of Dust](https://www.johnsto.co.uk/design/making-dust/) · [The Making of Dust 2](https://www.johnsto.co.uk/design/making_dust2/)
