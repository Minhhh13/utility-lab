# Public creator guide catalogue

Checked on **9 November 2026**. The catalogue contains **223 distinct creator-linked demonstrations** from **57 primary YouTube sources**, covering only the eight configured Active Duty/FACEIT maps. The original 72 IDs remain stable for saved links and favourites. The deeper records are split by map under `src/data/guides-deep-*.ts`.

Videos remain hosted by their creators and load only when requested. This catalogue does not download, mirror or republish video frames, thumbnails, competitor media or aim photos. Public playback and attribution do not establish permission to reuse frames; no Creative Commons frame licence is claimed.

## Coverage

Fire means Molotov or CT incendiary. Counts describe catalogue entries, not every possible throw or independently tested grenades.

| Map | Total | T | CT | Smoke | Flash | Fire | HE | Retake-tagged |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Mirage | 28 | 16 | 12 | 9 | 8 | 6 | 5 | 1 |
| Dust II | 26 | 14 | 12 | 12 | 6 | 6 | 2 | 3 |
| Inferno | 27 | 18 | 9 | 11 | 5 | 7 | 4 | 3 |
| Nuke | 24 | 14 | 10 | 10 | 6 | 5 | 3 | 3 |
| Ancient | 26 | 15 | 11 | 15 | 3 | 4 | 4 | 5 |
| Anubis | 29 | 16 | 13 | 13 | 10 | 4 | 2 | 2 |
| Cache | 36 | 18 | 18 | 13 | 6 | 14 | 3 | 3 |
| Vertigo | 27 | 14 | 13 | 11 | 4 | 9 | 3 | 3 |

Side/type detail uses **Smoke / Flash / Fire / HE** in that order.

| Map | T | CT |
| --- | --- | --- |
| Mirage | 6 / 4 / 4 / 2 | 3 / 4 / 2 / 3 |
| Dust II | 6 / 3 / 4 / 1 | 6 / 3 / 2 / 1 |
| Inferno | 7 / 3 / 5 / 3 | 4 / 2 / 2 / 1 |
| Nuke | 7 / 2 / 3 / 2 | 3 / 4 / 2 / 1 |
| Ancient | 8 / 2 / 3 / 2 | 7 / 1 / 1 / 2 |
| Anubis | 10 / 2 / 3 / 1 | 3 / 8 / 1 / 1 |
| Cache | 9 / 1 / 7 / 1 | 4 / 5 / 7 / 2 |
| Vertigo | 6 / 2 / 5 / 1 | 5 / 2 / 4 / 2 |

Every map has all four utility types for both side filters. Site grouping follows the named destination or its source section; Nuke yard/outside/radio areas use Other rather than inventing a Mid site.

| Map | A | B | Mid | Other |
| --- | ---: | ---: | ---: | ---: |
| Mirage | 11 | 8 | 9 | 0 |
| Dust II | 14 | 5 | 7 | 0 |
| Inferno | 8 | 15 | 4 | 0 |
| Nuke | 10 | 8 | 0 | 6 |
| Ancient | 4 | 11 | 11 | 0 |
| Anubis | 7 | 12 | 5 | 5 |
| Cache | 14 | 11 | 11 | 0 |
| Vertigo | 13 | 10 | 4 | 0 |

## Evidence and curation rules

- Original watch-page metadata was read directly. The selected pages reported public videos, matching IDs/titles/creators, playback status `OK`, publication dates, durations and official YouTube embed URLs. This is a source-availability check, not a guarantee that every region or embedded player permits playback.
- **191 non-zero offsets** match creator-authored chapters or labelled timecodes in the original descriptions. The other **32 entries** start at the beginning of a short clip or full guide. No offset is invented from a target name.
- A source video/start segment is counted once. A molotov-and-flash combination remains one grouped demonstration rather than two cloned entries. Alternate throws are included where the creator distinguishes the target, origin or named setup.
- Standing positions are named only when primary text names them. “Shown in video” means that the text does not establish a callout. Generic learning steps do not pretend to supply an exact crosshair, movement, jump or release sequence.
- Side filters are practical navigation choices. Explicit T/CT headings are preferred; other classifications use the source's entry, defensive or retake context and named target/origin. A throw is not claimed to be usable exclusively by one side.
- Retake, defence, fast, post-plant, combination and smoke-break tags are retained only where the source labels support them. Site values are exactly A, B, Mid or Other.
- Map markers now use separately audited target-callout anchors in the displayed artwork's 1000×1000 space. An unresolved or ambiguous destination stays in the guide list with its marker hidden. Pins are named areas, not measured grenade impacts, standing positions, trajectories or coverage. See [map marker registration](map-marker-registration.md) for source polygons, artwork alignment, floor handling and remaining gaps.

## Explicit throw-input text

Most sources require watching the original demonstration for exact inputs. Four Cache entries additionally preserve inputs explicitly published in the [September 2026 CT guide](https://www.youtube.com/watch?v=FbvrIRUOzM8):

| Entry | Source offset | Published input retained |
| --- | --- | --- |
| Quad retake incendiary | [4:06](https://www.youtube.com/watch?v=FbvrIRUOzM8&t=246s) | W + jumpthrow; mouse buttons remain unspecified |
| A default incendiary | [4:17](https://www.youtube.com/watch?v=FbvrIRUOzM8&t=257s) | Mouse 1 / LMB; other movement follows the video |
| Sunroom grenade and incendiary combination | [6:21](https://www.youtube.com/watch?v=FbvrIRUOzM8&t=381s) | Mouse 1 + jumpthrow |
| B default incendiary | [6:37](https://www.youtube.com/watch?v=FbvrIRUOzM8&t=397s) | Mouse 1 + jumpthrow |

Both buttons means **LMB + RMB**, not clicking the mouse wheel. No omitted mouse input is guessed.

## Published coordinate references

Five Cache entries retain position/angle triples from their creator's public description in optional `captureView` metadata. These are **public source facts only**: they do not establish throw timing, successful landings, current geometry or authorization to control a local game. No game action is performed by this catalogue.

| Entry ID | Primary description |
| --- | --- |
| `creator-cache-t-boost-smoke` | [NartOutHere: instant boost](https://www.youtube.com/watch?v=eI6EnqTgi0E&t=70s) |
| `creator-cache-t-b-main-lurk-smoke` | [NartOutHere: Frozen's instant B-main lurk](https://www.youtube.com/watch?v=eI6EnqTgi0E) |
| `creator-cache-ct-garage-smoke` | [NartOutHere: instant garage](https://www.youtube.com/watch?v=eI6EnqTgi0E&t=283s) |
| `creator-cache-ct-a-retake-from-car` | [mindtr6cks: A retake from car](https://www.youtube.com/watch?v=COp5h1xE0jE) |
| `creator-cache-ct-b-retake-combo` | [mindtr6cks: B retake from heaven](https://www.youtube.com/watch?v=ll7jRI0J-jg) |

The B-main-lurk description places its chapter at 3:46 and the following Tree chapter at 3:47. This ambiguity is documented in the record, which opens the full source rather than claiming a reliable isolated timestamp.

## Demonstration index

Each link opens the actual creator source at the stored offset. Dates and original chapter labels are retained in source metadata. Entries with multiple named targets are grouped source demonstrations.

### Mirage

| Side | Utility | Site / floor | Target | Origin | Creator / offset |
| --- | --- | --- | --- | --- | --- |
| T | Smoke | A | Jungle | A ramp | [NartOutHere · 4:40](https://www.youtube.com/watch?v=MJ-dtTYTUS8&t=280s) |
| CT | Smoke | A | Palace | Ticket | [NartOutHere · 7:39](https://www.youtube.com/watch?v=MJ-dtTYTUS8&t=459s) |
| T | Flash | Mid | Mid | See video position | [NartOutHere · 2:20](https://www.youtube.com/watch?v=xPCYPKFG44E&t=140s) |
| T | Molotov | Mid | Window | Mid | [NartOutHere · 1:56](https://www.youtube.com/watch?v=xPCYPKFG44E&t=116s) |
| T | HE | A | Stairs | See video position | [DK Nades · 0:00](https://www.youtube.com/watch?v=m8q93UtfKBE&t=0s) |
| CT | Flash | Mid | Mid | Window | [NartOutHere · 13:58](https://www.youtube.com/watch?v=xPCYPKFG44E&t=838s) |
| CT | Molotov | A | A ramp | See video position | [NartOutHere · 15:22](https://www.youtube.com/watch?v=xPCYPKFG44E&t=922s) |
| CT | HE | Mid | Window | See video position | [NartOutHere · 13:16](https://www.youtube.com/watch?v=xPCYPKFG44E&t=796s) |
| T | Smoke | Mid | Connector | Top mid | [NartOutHere · 2:10](https://www.youtube.com/watch?v=MJ-dtTYTUS8&t=130s) |
| T | Smoke | A | Stairs | Shown in video | [NartOutHere · 2:58](https://www.youtube.com/watch?v=MJ-dtTYTUS8&t=178s) |
| T | Smoke | A | Ticket | Shown in video | [NartOutHere · 4:23](https://www.youtube.com/watch?v=MJ-dtTYTUS8&t=263s) |
| T | Smoke | B | Market window | Shown in video | [NartOutHere · 6:08](https://www.youtube.com/watch?v=MJ-dtTYTUS8&t=368s) |
| T | Smoke | B | B short | Apartments | [NartOutHere · 6:22](https://www.youtube.com/watch?v=MJ-dtTYTUS8&t=382s) |
| T | Molotov | Mid | Underpass | Shown in video | [NartOutHere · 3:11](https://www.youtube.com/watch?v=xPCYPKFG44E&t=191s) |
| T | Molotov | Mid | Ladder room | Shown in video | [NartOutHere · 4:19](https://www.youtube.com/watch?v=xPCYPKFG44E&t=259s) |
| T | Flash | A | A site | Shown in video | [NartOutHere · 8:30](https://www.youtube.com/watch?v=xPCYPKFG44E&t=510s) |
| T | Flash | B | B short | Apartments | [NartOutHere · 11:12](https://www.youtube.com/watch?v=xPCYPKFG44E&t=672s) |
| T | Flash | B | B site | Shown in video | [NartOutHere · 12:01](https://www.youtube.com/watch?v=xPCYPKFG44E&t=721s) |
| T | Molotov | B | B site | Shown in video | [NartOutHere · 12:31](https://www.youtube.com/watch?v=xPCYPKFG44E&t=751s) |
| CT | Molotov | Mid | Top mid | Shown in video | [NartOutHere · 13:41](https://www.youtube.com/watch?v=xPCYPKFG44E&t=821s) |
| CT | Flash | Mid | Underpass | Shown in video | [NartOutHere · 14:32](https://www.youtube.com/watch?v=xPCYPKFG44E&t=872s) |
| CT | Flash | A | A ramp | Shown in video | [NartOutHere · 15:39](https://www.youtube.com/watch?v=xPCYPKFG44E&t=939s) |
| CT | Smoke | B | B apartments | Shown in video | [NartOutHere · 17:21](https://www.youtube.com/watch?v=xPCYPKFG44E&t=1041s) |
| CT | Smoke | B | B site | Shown in video | [NartOutHere · 17:54](https://www.youtube.com/watch?v=xPCYPKFG44E&t=1074s) |
| CT | HE | A | A default | Shown in video | [CS Tactics · 9:21](https://www.youtube.com/watch?v=ZLyGvtTNLG8&t=561s) |
| CT | HE | A | Tetris | Shown in video | [CS Tactics · 9:37](https://www.youtube.com/watch?v=ZLyGvtTNLG8&t=577s) |
| T | HE | B | Bench | Shown in video | [CS Tactics · 9:53](https://www.youtube.com/watch?v=ZLyGvtTNLG8&t=593s) |
| CT | Flash | A | A site | Shown in video | [CS Tactics · 5:49](https://www.youtube.com/watch?v=ZLyGvtTNLG8&t=349s) |

### Dust II

| Side | Utility | Site / floor | Target | Origin | Creator / offset |
| --- | --- | --- | --- | --- | --- |
| T | Smoke | Mid | CT mid | Catwalk | [NartOutHere · 1:44](https://www.youtube.com/watch?v=HY85NcZMrAg&t=104s) |
| CT | Smoke | B | Upper tunnels | B window | [NartOutHere · 6:17](https://www.youtube.com/watch?v=HY85NcZMrAg&t=377s) |
| T | Flash | Mid | Mid | See video position | [NartOutHere · 1:59](https://www.youtube.com/watch?v=6aEaQjRaV1U&t=119s) |
| T | Molotov | Mid | Lower tunnels | See video position | [NartOutHere · 2:33](https://www.youtube.com/watch?v=6aEaQjRaV1U&t=153s) |
| T | HE | Mid | Mid doors | Xbox | [Existenz · 0:00](https://www.youtube.com/watch?v=BZCrUUpXpEs&t=0s) |
| CT | Flash | A | Long A | See video position | [NartOutHere · 16:40](https://www.youtube.com/watch?v=6aEaQjRaV1U&t=1000s) |
| CT | Molotov | A | Long doors | Car | [NartOutHere · 17:05](https://www.youtube.com/watch?v=6aEaQjRaV1U&t=1025s) |
| CT | HE | Mid | Mid crossing | See video position | [NartOutHere · 15:30](https://www.youtube.com/watch?v=6aEaQjRaV1U&t=930s) |
| T | Smoke | Mid | Xbox | Shown in video | [NartOutHere · 1:22](https://www.youtube.com/watch?v=HY85NcZMrAg&t=82s) |
| T | Smoke | B | B doors | Shown in video | [NartOutHere · 2:52](https://www.youtube.com/watch?v=HY85NcZMrAg&t=172s) |
| T | Smoke | B | B window / doors | Shown in video | [NartOutHere · 3:07](https://www.youtube.com/watch?v=HY85NcZMrAg&t=187s) |
| T | Smoke | A | Long corner | Shown in video | [NartOutHere · 3:56](https://www.youtube.com/watch?v=HY85NcZMrAg&t=236s) |
| T | Smoke | A | A cross | Shown in video | [NartOutHere · 4:25](https://www.youtube.com/watch?v=HY85NcZMrAg&t=265s) |
| T | Molotov | B | B boost | Shown in video | [NartOutHere · 8:12](https://www.youtube.com/watch?v=6aEaQjRaV1U&t=492s) |
| T | Molotov | A | Goose | Shown in video | [NartOutHere · 11:32](https://www.youtube.com/watch?v=6aEaQjRaV1U&t=692s) |
| T | Flash | A | A site | Shown in video | [NartOutHere · 12:00](https://www.youtube.com/watch?v=6aEaQjRaV1U&t=720s) |
| T | Flash | A | Long doors | Shown in video | [NartOutHere · 14:14](https://www.youtube.com/watch?v=6aEaQjRaV1U&t=854s) |
| T | Molotov | A | A car | Shown in video | [NartOutHere · 14:30](https://www.youtube.com/watch?v=6aEaQjRaV1U&t=870s) |
| CT | Smoke | A | Long doors | Shown in video | [NartOutHere · 5:50](https://www.youtube.com/watch?v=HY85NcZMrAg&t=350s) |
| CT | Smoke | A | Long A | Shown in video | [NartOutHere · 5:59](https://www.youtube.com/watch?v=HY85NcZMrAg&t=359s) |
| CT | Smoke | B | Upper tunnels | Shown in video | [NartOutHere · 6:25](https://www.youtube.com/watch?v=HY85NcZMrAg&t=385s) |
| CT | Smoke | A | A site | Shown in video | [NartOutHere · 6:32](https://www.youtube.com/watch?v=HY85NcZMrAg&t=392s) |
| CT | Smoke | Mid | Mid doors | A site | [NartOutHere · 6:42](https://www.youtube.com/watch?v=HY85NcZMrAg&t=402s) |
| CT | Flash | A | Short A | Shown in video | [NartOutHere · 17:37](https://www.youtube.com/watch?v=6aEaQjRaV1U&t=1057s) |
| CT | Molotov | A | A site | Shown in video | [NartOutHere · 17:44](https://www.youtube.com/watch?v=6aEaQjRaV1U&t=1064s) |
| CT | Flash | A | A site | Shown in video | [NartOutHere · 18:01](https://www.youtube.com/watch?v=6aEaQjRaV1U&t=1081s) |

### Inferno

| Side | Utility | Site / floor | Target | Origin | Creator / offset |
| --- | --- | --- | --- | --- | --- |
| T | Smoke | B | CT entrance | Stairs | [NartOutHere · 2:55](https://www.youtube.com/watch?v=eljDZdMTPzs&t=175s) |
| CT | Smoke | B | Banana halfwall | Coffins | [NartOutHere · 6:40](https://www.youtube.com/watch?v=eljDZdMTPzs&t=400s) |
| T | Flash | B | Banana | See video position | [NartOutHere · 1:48](https://www.youtube.com/watch?v=fWDE1KH9odg&t=108s) |
| T | Molotov | B | Banana car | See video position | [NartOutHere · 0:31](https://www.youtube.com/watch?v=fWDE1KH9odg&t=31s) |
| T | HE | B | CT entrance | See video position | [NartOutHere · 7:22](https://www.youtube.com/watch?v=fWDE1KH9odg&t=442s) |
| CT | Flash | Mid | Mid | See video position | [NadesOutHere · 0:00](https://www.youtube.com/watch?v=qOa_beX7K68&t=0s) |
| CT | Molotov | B | Banana halfwall | See video position | [CS Tactics · 5:34](https://www.youtube.com/watch?v=Z8Yg4EU_p6Q&t=334s) |
| CT | HE | B | Banana | Coffins | [GnomNadesCS2 · 0:00](https://www.youtube.com/watch?v=flVVl6OnwTM&t=0s) |
| T | Smoke | Mid | Bracket | Second mid | [NartOutHere · 3:40](https://www.youtube.com/watch?v=eljDZdMTPzs&t=220s) |
| T | Smoke | A | Moto | Shown in video | [NartOutHere · 4:32](https://www.youtube.com/watch?v=eljDZdMTPzs&t=272s) |
| T | Smoke | A | Arch | Shown in video | [NartOutHere · 5:00](https://www.youtube.com/watch?v=eljDZdMTPzs&t=300s) |
| T | Smoke | A | Library / Arch | Shown in video | [NartOutHere · 5:08](https://www.youtube.com/watch?v=eljDZdMTPzs&t=308s) |
| T | Smoke | A | Haycart | Shown in video | [NartOutHere · 5:31](https://www.youtube.com/watch?v=eljDZdMTPzs&t=331s) |
| T | Smoke | A | Truck | Shown in video | [NartOutHere · 5:43](https://www.youtube.com/watch?v=eljDZdMTPzs&t=343s) |
| T | Molotov | B | Sandbags | Shown in video | [NartOutHere · 0:38](https://www.youtube.com/watch?v=fWDE1KH9odg&t=38s) |
| T | Molotov | B | New box | Shown in video | [NartOutHere · 4:32](https://www.youtube.com/watch?v=fWDE1KH9odg&t=272s) |
| T | Molotov | B | Oranges | Shown in video | [NartOutHere · 4:40](https://www.youtube.com/watch?v=fWDE1KH9odg&t=280s) |
| T | Flash | B | B site | Shown in video | [NartOutHere · 7:12](https://www.youtube.com/watch?v=fWDE1KH9odg&t=432s) |
| T | HE | B | Banana halfwall | Shown in video | [CS Tactics · 1:59](https://www.youtube.com/watch?v=wGBM1aOavOs&t=119s) |
| T | HE | B | Church | Shown in video | [CS Tactics · 2:49](https://www.youtube.com/watch?v=wGBM1aOavOs&t=169s) |
| T | Molotov | A | Big pit | Apartments | [NadesOutHere · 0:00](https://www.youtube.com/watch?v=ExgKPjqRbJ8&t=0s) |
| T | Flash | A | A site | Shown in video | [Tigerr · 14:32](https://www.youtube.com/watch?v=mAiM0zMnfh4&t=872s) |
| CT | Smoke | Mid | Mid | Moto | [NartOutHere · 7:33](https://www.youtube.com/watch?v=eljDZdMTPzs&t=453s) |
| CT | Smoke | B | Banana | Moto | [NartOutHere · 7:42](https://www.youtube.com/watch?v=eljDZdMTPzs&t=462s) |
| CT | Smoke | Mid | Mid | Shown in video | [NartOutHere · 7:22](https://www.youtube.com/watch?v=eljDZdMTPzs&t=442s) |
| CT | Molotov | A | Pit | Long | [NadesOutHere · 0:00](https://www.youtube.com/watch?v=fZ4cVtLAM4E&t=0s) |
| CT | Flash | B | Banana | Shown in video | [NadesOutHere · 0:00](https://www.youtube.com/watch?v=vkydpQorAfg&t=0s) |

### Nuke

| Side | Utility | Site / floor | Target | Origin | Creator / offset |
| --- | --- | --- | --- | --- | --- |
| T | Smoke | Other · upper | Outside crossing | Yard | [NartOutHere · 1:42](https://www.youtube.com/watch?v=Fp14IZIHJVQ&t=102s) |
| CT | Smoke | A · upper | Squeaky door | Heaven | [NartOutHere · 8:47](https://www.youtube.com/watch?v=Fp14IZIHJVQ&t=527s) |
| T | Flash | A · upper | A site | See video position | [CS Tactics · 6:07](https://www.youtube.com/watch?v=tzUBsnvKOcg&t=367s) |
| T | Molotov | A · upper | Top hut | See video position | [NartOutHere · 6:54](https://www.youtube.com/watch?v=6_WAimVYF0I&t=414s) |
| T | HE | A · upper | Hut | See video position | [CS Tactics · 7:54](https://www.youtube.com/watch?v=tzUBsnvKOcg&t=474s) |
| CT | Flash | Other · upper | Lobby | See video position | [NadesOutHere · 0:00](https://www.youtube.com/watch?v=axQhuprlQxc&t=0s) |
| CT | Molotov | Other · upper | T red | See video position | [NadesOutHere · 0:00](https://www.youtube.com/watch?v=-_ZqUw_QxwA&t=0s) |
| CT | HE | Other · upper | Silo | See video position | [NadesOutHere · 0:00](https://www.youtube.com/watch?v=S493CLa_nTg&t=0s) |
| T | Smoke | B · lower | B double doors | Bottom ramp | [Utility Kings · 0:00](https://www.youtube.com/watch?v=LF7hkXkbT_w&t=0s) |
| CT | Smoke | B · lower | B site | Decon | [NartOutHere · 7:17](https://www.youtube.com/watch?v=Fp14IZIHJVQ&t=437s) |
| T | Flash | B · lower | B site | See video positions | [NadesOutHere · 0:00](https://www.youtube.com/watch?v=z2wWjc8n0UI&t=0s) |
| CT | Flash | B · lower | B site | See video position | [NadesOutHere · 0:00](https://www.youtube.com/watch?v=05TnXxFo8rs&t=0s) |
| CT | Flash | B · lower | B site | See video position | [NadesOutHere · 0:00](https://www.youtube.com/watch?v=o84-2TM68X8&t=0s) |
| T | Molotov | B · lower | B Dark | See video position | [NadesOutHere · 0:00](https://www.youtube.com/watch?v=-IK1Jjp_LLE&t=0s) |
| T | Molotov | B · lower | B double doors | See video position | [NadesOutHere · 0:00](https://www.youtube.com/watch?v=G88eIF_XWYU&t=0s) |
| CT | Molotov | B · lower | B Dark | Ramp | [CSecret Nades · 0:00](https://www.youtube.com/watch?v=9X78DLx6A2Q&t=0s) |
| T | Smoke | A · upper | Top main | Shown in video | [NartOutHere · 1:58](https://www.youtube.com/watch?v=Fp14IZIHJVQ&t=118s) |
| T | Smoke | Other · upper | Locker | Shown in video | [NartOutHere · 4:31](https://www.youtube.com/watch?v=Fp14IZIHJVQ&t=271s) |
| T | Smoke | A · upper | Heaven | Shown in video | [NartOutHere · 5:44](https://www.youtube.com/watch?v=Fp14IZIHJVQ&t=344s) |
| T | Smoke | A · upper | Squeaky door | Shown in video | [NartOutHere · 6:11](https://www.youtube.com/watch?v=Fp14IZIHJVQ&t=371s) |
| T | Smoke | A · upper | A Tetris | Shown in video | [NartOutHere · 7:00](https://www.youtube.com/watch?v=Fp14IZIHJVQ&t=420s) |
| CT | Smoke | Other · upper | Radio / Trophy | Shown in video | [NartOutHere · 8:30](https://www.youtube.com/watch?v=Fp14IZIHJVQ&t=510s) |
| T | HE | A · upper | Squeaky door | Shown in video | [CS Tactics · 3:36](https://www.youtube.com/watch?v=wGBM1aOavOs&t=216s) |
| CT | Flash | A · upper | A site | Shown in video | [NadesOutHere · 0:00](https://www.youtube.com/watch?v=gBNcrswDP3w&t=0s) |

### Ancient

| Side | Utility | Site / floor | Target | Origin | Creator / offset |
| --- | --- | --- | --- | --- | --- |
| T | Smoke | Mid | Red room | Elbow | [NartOutHere · 0:58](https://www.youtube.com/watch?v=xEhS-AmIzIw&t=58s) |
| CT | Smoke | B | B door | CT spawn | [NartOutHere · 7:04](https://www.youtube.com/watch?v=xEhS-AmIzIw&t=424s) |
| T | Flash | Mid | Mid | See video position | [NartOutHere · 1:23](https://www.youtube.com/watch?v=H9-LFlmPe4U&t=83s) |
| T | Molotov | Mid | Mid | See video position | [NartOutHere · 2:49](https://www.youtube.com/watch?v=H9-LFlmPe4U&t=169s) |
| T | HE | Mid | Mid | See video position | [NartOutHere · 3:51](https://www.youtube.com/watch?v=H9-LFlmPe4U&t=231s) |
| CT | Flash | B | B site / Cave | See video positions | [fREShCS2 · 0:00](https://www.youtube.com/watch?v=2vuW2b1E9yU&t=0s) |
| CT | Molotov | Mid | Mid | See video positions | [NadesOutHere · 0:00](https://www.youtube.com/watch?v=K2GBllKW43s&t=0s) |
| CT | HE | Mid | Mid | See video position | [GnomNadesCS2 · 0:00](https://www.youtube.com/watch?v=I9-0oA4BGfE&t=0s) |
| T | Smoke | Mid | Window / Red | Left spawn | [NartOutHere · 0:38](https://www.youtube.com/watch?v=xEhS-AmIzIw&t=38s) |
| T | Smoke | Mid | Mid donut | Shown in video | [NartOutHere · 1:17](https://www.youtube.com/watch?v=xEhS-AmIzIw&t=77s) |
| T | Smoke | B | B short | B main | [NartOutHere · 2:24](https://www.youtube.com/watch?v=xEhS-AmIzIw&t=144s) |
| T | Smoke | B | B long | B main | [NartOutHere · 2:51](https://www.youtube.com/watch?v=xEhS-AmIzIw&t=171s) |
| T | Smoke | B | Speedway | Shown in video | [NartOutHere · 3:13](https://www.youtube.com/watch?v=xEhS-AmIzIw&t=193s) |
| T | Smoke | A | A CT | A main | [NartOutHere · 4:26](https://www.youtube.com/watch?v=xEhS-AmIzIw&t=266s) |
| T | Smoke | A | A donut | A main | [NartOutHere · 5:58](https://www.youtube.com/watch?v=xEhS-AmIzIw&t=358s) |
| T | Molotov | B | B ninja | Shown in video | [NartOutHere · 11:27](https://www.youtube.com/watch?v=H9-LFlmPe4U&t=687s) |
| T | Molotov | B | B site | Shown in video | [NartOutHere · 11:39](https://www.youtube.com/watch?v=H9-LFlmPe4U&t=699s) |
| T | Flash | B | Cave | Shown in video | [NartOutHere · 8:14](https://www.youtube.com/watch?v=H9-LFlmPe4U&t=494s) |
| T | HE | B | B site | Shown in video | [NartOutHere · 11:48](https://www.youtube.com/watch?v=H9-LFlmPe4U&t=708s) |
| CT | Smoke | Mid | Elbow | Shown in video | [NartOutHere · 6:43](https://www.youtube.com/watch?v=xEhS-AmIzIw&t=403s) |
| CT | Smoke | Mid | Mid cubby | Shown in video | [NartOutHere · 6:52](https://www.youtube.com/watch?v=xEhS-AmIzIw&t=412s) |
| CT | Smoke | B | B banana | Shown in video | [NartOutHere · 7:20](https://www.youtube.com/watch?v=xEhS-AmIzIw&t=440s) |
| CT | Smoke | B | Cave | Shown in video | [NartOutHere · 7:27](https://www.youtube.com/watch?v=xEhS-AmIzIw&t=447s) |
| CT | Smoke | A | A main | Shown in video | [NartOutHere · 7:35](https://www.youtube.com/watch?v=xEhS-AmIzIw&t=455s) |
| CT | Smoke | A | A donut | Shown in video | [NartOutHere · 7:53](https://www.youtube.com/watch?v=xEhS-AmIzIw&t=473s) |
| CT | HE | Mid | Elbow | Shown in video | [CS Tactics · 6:05](https://www.youtube.com/watch?v=wGBM1aOavOs&t=365s) |

### Anubis

| Side | Utility | Site / floor | Target | Origin | Creator / offset |
| --- | --- | --- | --- | --- | --- |
| T | Smoke | A | A camera | A main | [NartOutHere · 4:11](https://www.youtube.com/watch?v=588UtJa98F0&t=251s) |
| CT | Smoke | A | A main | CT | [NartOutHere · 4:17](https://www.youtube.com/watch?v=588UtJa98F0&t=257s) |
| T | Flash | B | B site | See video position | [Tigerr · 5:51](https://www.youtube.com/watch?v=g1jYVHvj2w8&t=351s) |
| T | Molotov | Mid | Mid window | See video position | [Tigerr · 2:12](https://www.youtube.com/watch?v=g1jYVHvj2w8&t=132s) |
| T | HE | Mid | Mid window | See video position | [Tigerr · 3:10](https://www.youtube.com/watch?v=g1jYVHvj2w8&t=190s) |
| CT | Flash | B | B site | CT | [MacMate · 5:50](https://www.youtube.com/watch?v=bjvSBhEojUE&t=350s) |
| CT | Molotov | Other | T stairs / Water | A site | [CS2 Utility · 0:00](https://www.youtube.com/watch?v=cPIodSWXWHo&t=0s) |
| CT | HE | Other | T stairs / Water | A site | [MisterT - Counter-Strike 2 (CS2) · 0:00](https://www.youtube.com/watch?v=PKW4pTjg5-A&t=0s) |
| T | Smoke | Mid | Mid window | Shown in video | [NartOutHere · 0:49](https://www.youtube.com/watch?v=588UtJa98F0&t=49s) |
| T | Smoke | Mid | Mid temple | Shown in video | [NartOutHere · 1:20](https://www.youtube.com/watch?v=588UtJa98F0&t=80s) |
| T | Smoke | B | Cave | Shown in video | [NartOutHere · 1:45](https://www.youtube.com/watch?v=588UtJa98F0&t=105s) |
| T | Smoke | B | E-box | Shown in video | [NartOutHere · 1:37](https://www.youtube.com/watch?v=588UtJa98F0&t=97s) |
| T | Smoke | B | B site left | Shown in video | [NartOutHere · 2:35](https://www.youtube.com/watch?v=588UtJa98F0&t=155s) |
| T | Smoke | B | B site right | Shown in video | [NartOutHere · 2:44](https://www.youtube.com/watch?v=588UtJa98F0&t=164s) |
| T | Smoke | B | B temple | Shown in video | [NartOutHere · 3:04](https://www.youtube.com/watch?v=588UtJa98F0&t=184s) |
| T | Smoke | B | B CT | Shown in video | [NartOutHere · 3:26](https://www.youtube.com/watch?v=588UtJa98F0&t=206s) |
| T | Smoke | A | A heaven | Shown in video | [NartOutHere · 3:56](https://www.youtube.com/watch?v=588UtJa98F0&t=236s) |
| T | Molotov | B | E-box | Shown in video | [Tigerr · 5:22](https://www.youtube.com/watch?v=g1jYVHvj2w8&t=322s) |
| T | Molotov | A | A platform | Shown in video | [Tigerr · 9:16](https://www.youtube.com/watch?v=g1jYVHvj2w8&t=556s) |
| T | Flash | A | A site | Shown in video | [Tigerr · 8:04](https://www.youtube.com/watch?v=g1jYVHvj2w8&t=484s) |
| CT | Flash | B | Connector | B site | [MacMate · 1:15](https://www.youtube.com/watch?v=bjvSBhEojUE&t=75s) |
| CT | Flash | Other | Water | Connector | [MacMate · 1:46](https://www.youtube.com/watch?v=bjvSBhEojUE&t=106s) |
| CT | Flash | Other | Water | A site | [MacMate · 2:25](https://www.youtube.com/watch?v=bjvSBhEojUE&t=145s) |
| CT | Flash | B | B main | B site | [MacMate · 4:53](https://www.youtube.com/watch?v=bjvSBhEojUE&t=293s) |
| CT | Flash | B | B ninja | Shown in video | [MacMate · 5:24](https://www.youtube.com/watch?v=bjvSBhEojUE&t=324s) |
| CT | Flash | Mid | Mid window | Shown in video | [CS Tactics · 6:47](https://www.youtube.com/watch?v=rfZS5TV60Wg&t=407s) |
| CT | Smoke | Other | Bridge | Shown in video | [NartOutHere · 4:22](https://www.youtube.com/watch?v=588UtJa98F0&t=262s) |
| CT | Smoke | A | A main | Water | [NartOutHere · 3:37](https://www.youtube.com/watch?v=588UtJa98F0&t=217s) |
| CT | Flash | A | A main | Shown in video | [NadesOutHere · 0:00](https://www.youtube.com/watch?v=Su76I4fnOvw&t=0s) |

### Cache

| Side | Utility | Site / floor | Target | Origin | Creator / offset |
| --- | --- | --- | --- | --- | --- |
| T | Smoke | Mid | Connector / Z | T spawn | [NartOutHere · 0:10](https://www.youtube.com/watch?v=eI6EnqTgi0E&t=10s) |
| CT | Smoke | A | A main | See standing position in video | [NartOutHere · 4:55](https://www.youtube.com/watch?v=eI6EnqTgi0E&t=295s) |
| T | Flash | Mid | Mid | See video positions | [NartOutHere · 2:11](https://www.youtube.com/watch?v=5gbIC3igve8&t=131s) |
| T | Molotov | A | Forklift | See video position | [NartOutHere · 3:58](https://www.youtube.com/watch?v=5gbIC3igve8&t=238s) |
| T | HE | Mid | Whitebox | See first lineup position | [mindtr6cks · 0:14](https://www.youtube.com/watch?v=gTbboIZF7JY&t=14s) |
| CT | Flash | A | A main | See video position | [NartOutHere · 6:58](https://www.youtube.com/watch?v=5gbIC3igve8&t=418s) |
| CT | Molotov | A | A main box | See video position | [NartOutHere · 7:07](https://www.youtube.com/watch?v=5gbIC3igve8&t=427s) |
| CT | HE | Mid | Boost | See video position | [NartOutHere · 6:36](https://www.youtube.com/watch?v=5gbIC3igve8&t=396s) |
| T | Smoke | Mid | Boost | Published coordinate setup | [NartOutHere · 1:10](https://www.youtube.com/watch?v=eI6EnqTgi0E&t=70s) |
| T | Smoke | B | B main | Published coordinate setup | [NartOutHere · 0:00](https://www.youtube.com/watch?v=eI6EnqTgi0E&t=0s) |
| CT | Smoke | Mid | Garage | Published coordinate setup | [NartOutHere · 4:43](https://www.youtube.com/watch?v=eI6EnqTgi0E&t=283s) |
| T | Smoke | A | A cross | Shown in video | [NartOutHere · 1:57](https://www.youtube.com/watch?v=eI6EnqTgi0E&t=117s) |
| T | Smoke | B | B tree | Shown in video | [NartOutHere · 3:47](https://www.youtube.com/watch?v=eI6EnqTgi0E&t=227s) |
| T | Smoke | B | B heaven | Shown in video | [NartOutHere · 4:27](https://www.youtube.com/watch?v=eI6EnqTgi0E&t=267s) |
| T | Smoke | A | Highway | Shown in video | [NartOutHere · 2:37](https://www.youtube.com/watch?v=eI6EnqTgi0E&t=157s) |
| CT | Smoke | A | A main | Shown in video | [NartOutHere · 5:08](https://www.youtube.com/watch?v=eI6EnqTgi0E&t=308s) |
| CT | Smoke | B | B main | Shown in video | [NartOutHere · 5:23](https://www.youtube.com/watch?v=eI6EnqTgi0E&t=323s) |
| T | Smoke | Mid | Mid | Shown in video | [NartOutHere · 0:35](https://www.youtube.com/watch?v=eI6EnqTgi0E&t=35s) |
| T | Molotov | Mid | Whitebox | Shown in video | [NartOutHere · 1:34](https://www.youtube.com/watch?v=5gbIC3igve8&t=94s) |
| T | Molotov | Mid | Sandbags | Shown in video | [NartOutHere · 1:48](https://www.youtube.com/watch?v=5gbIC3igve8&t=108s) |
| T | Molotov | Mid | Vents | Shown in video | [NartOutHere · 1:59](https://www.youtube.com/watch?v=5gbIC3igve8&t=119s) |
| T | Molotov | A | NBK / Quad | Shown in video | [NartOutHere · 4:05](https://www.youtube.com/watch?v=5gbIC3igve8&t=245s) |
| T | Molotov | B | B heaven | Shown in video | [NartOutHere · 5:32](https://www.youtube.com/watch?v=5gbIC3igve8&t=332s) |
| CT | Flash | B | B main | Shown in video | [NartOutHere · 7:39](https://www.youtube.com/watch?v=5gbIC3igve8&t=459s) |
| T | Molotov | B | B single | Shown in video | [NartOutHere · 5:25](https://www.youtube.com/watch?v=5gbIC3igve8&t=325s) |
| T | Smoke | A | A back site | Shown in video | [NartOutHere · 2:04](https://www.youtube.com/watch?v=eI6EnqTgi0E&t=124s) |
| CT | Molotov | A | A site | Car | [mindtr6cks · 0:00](https://www.youtube.com/watch?v=COp5h1xE0jE&t=0s) |
| CT | Molotov | B | B site | Heaven | [mindtr6cks · 0:00](https://www.youtube.com/watch?v=ll7jRI0J-jg&t=0s) |
| CT | Flash | Mid | Mid | Shown in video | [Dream League Gaming · 1:05](https://www.youtube.com/watch?v=FbvrIRUOzM8&t=65s) |
| CT | Flash | A | A site | Shown in video | [Dream League Gaming · 3:14](https://www.youtube.com/watch?v=FbvrIRUOzM8&t=194s) |
| CT | HE | A | A cross | Shown in video | [Dream League Gaming · 3:50](https://www.youtube.com/watch?v=FbvrIRUOzM8&t=230s) |
| CT | Molotov | A | Quad / New box | Shown in video | [Dream League Gaming · 4:06](https://www.youtube.com/watch?v=FbvrIRUOzM8&t=246s) |
| CT | Molotov | A | A default | Shown in video | [Dream League Gaming · 4:17](https://www.youtube.com/watch?v=FbvrIRUOzM8&t=257s) |
| CT | Flash | B | B site | Shown in video | [Dream League Gaming · 5:35](https://www.youtube.com/watch?v=FbvrIRUOzM8&t=335s) |
| CT | Molotov | B | Sunroom / Toxic | Shown in video | [Dream League Gaming · 6:21](https://www.youtube.com/watch?v=FbvrIRUOzM8&t=381s) |
| CT | Molotov | B | B default | Shown in video | [Dream League Gaming · 6:37](https://www.youtube.com/watch?v=FbvrIRUOzM8&t=397s) |

### Vertigo

| Side | Utility | Site / floor | Target | Origin | Creator / offset |
| --- | --- | --- | --- | --- | --- |
| T | Smoke | A · upper | Ivy | Stairs | [NartOutHere · 1:42](https://www.youtube.com/watch?v=CR3cNNTPQs0&t=102s) |
| CT | Smoke | A · upper | A ramp | Sandbags | [NartOutHere · 7:00](https://www.youtube.com/watch?v=CR3cNNTPQs0&t=420s) |
| T | Flash | A · upper | A CT / Back site | See video position | [Spyn · 0:00](https://www.youtube.com/watch?v=frp4CAjDYIo&t=0s) |
| T | Molotov | A · upper | Headshot | See video position | [CS Tactics · 6:03](https://www.youtube.com/watch?v=JGd65QKpBac&t=363s) |
| T | HE | Mid · upper | Mid | See video position | [CS2 School · 2:13](https://www.youtube.com/watch?v=Mhh5Xrt3yCE&t=133s) |
| CT | Flash | A · upper | A ramp | See video position | [NadesOutHere · 0:00](https://www.youtube.com/watch?v=ra2mk5qZ1BI&t=0s) |
| CT | Molotov | A · upper | A ramp | See video position | [CS Tactics · 1:11](https://www.youtube.com/watch?v=JGd65QKpBac&t=71s) |
| CT | HE | B · upper | B stairs | B site | [CS2 Pulse · 0:00](https://www.youtube.com/watch?v=3KaCMTuG4xA&t=0s) |
| T | Smoke | A · upper | A short | Shown in video | [NartOutHere · 3:53](https://www.youtube.com/watch?v=CR3cNNTPQs0&t=233s) |
| T | Smoke | A · upper | A heaven | Shown in video | [NartOutHere · 4:03](https://www.youtube.com/watch?v=CR3cNNTPQs0&t=243s) |
| T | Smoke | B · upper | B main | Shown in video | [NartOutHere · 4:15](https://www.youtube.com/watch?v=CR3cNNTPQs0&t=255s) |
| T | Smoke | B · upper | B right generator | Shown in video | [NartOutHere · 5:10](https://www.youtube.com/watch?v=CR3cNNTPQs0&t=310s) |
| T | Smoke | Mid · upper | Mid | Shown in video | [NartOutHere · 6:15](https://www.youtube.com/watch?v=CR3cNNTPQs0&t=375s) |
| CT | Smoke | A · upper | A yellow | Shown in video | [NartOutHere · 7:19](https://www.youtube.com/watch?v=CR3cNNTPQs0&t=439s) |
| CT | Smoke | A · upper | A site | Shown in video | [NartOutHere · 8:28](https://www.youtube.com/watch?v=CR3cNNTPQs0&t=508s) |
| CT | Smoke | B · upper | B site | Shown in video | [NartOutHere · 8:50](https://www.youtube.com/watch?v=CR3cNNTPQs0&t=530s) |
| CT | Smoke | B · upper | B site | Shown in video | [NartOutHere · 9:07](https://www.youtube.com/watch?v=CR3cNNTPQs0&t=547s) |
| CT | Molotov | Mid · upper | Mid | Shown in video | [CS Tactics · 7:39](https://www.youtube.com/watch?v=JGd65QKpBac&t=459s) |
| CT | Molotov | B · upper | B default | Shown in video | [CS Tactics · 9:13](https://www.youtube.com/watch?v=JGd65QKpBac&t=553s) |
| T | Molotov | B · upper | B pillar | Shown in video | [CS Tactics · 9:45](https://www.youtube.com/watch?v=JGd65QKpBac&t=585s) |
| T | Molotov | B · upper | B default | Shown in video | [CS Tactics · 10:10](https://www.youtube.com/watch?v=JGd65QKpBac&t=610s) |
| T | Molotov | B · upper | B white / double | Shown in video | [CS Tactics · 11:04](https://www.youtube.com/watch?v=JGd65QKpBac&t=664s) |
| T | Flash | Mid · upper | Mid | Shown in video | [NadesOutHere · 0:00](https://www.youtube.com/watch?v=Bw_oMDlJyrA&t=0s) |
| CT | HE | A · upper | A default | Shown in video | [CS2 School · 0:07](https://www.youtube.com/watch?v=Mhh5Xrt3yCE&t=7s) |
| T | Molotov | A · upper | A ivy | Shown in video | [CS Tactics · 7:11](https://www.youtube.com/watch?v=JGd65QKpBac&t=431s) |
| CT | Molotov | A · upper | A scaffolding | Shown in video | [CS Tactics · 2:45](https://www.youtube.com/watch?v=JGd65QKpBac&t=165s) |
| CT | Flash | B · upper | B stairs | B window | [NadesOutHere · 0:00](https://www.youtube.com/watch?v=8hMbl1fqCIQ&t=0s) |

## Primary source register

Publication dates come from the original watch-page metadata, even if an older title now says 2026. Cache sources explicitly concern the CS2 remake; CS:GO Cache guides are not substituted.

| Creator | Published | Primary video |
| --- | --- | --- |
| NartOutHere | 2025-05-20 | [CS2 Mirage Smokes You NEED to Know in 2026](https://www.youtube.com/watch?v=MJ-dtTYTUS8) |
| NartOutHere | 2026-02-28 | [CS2 Dust 2 Smokes You NEED to Know in 2026](https://www.youtube.com/watch?v=HY85NcZMrAg) |
| NartOutHere | 2025-10-20 | [CS2 Inferno Smokes You NEED to Know in 2026](https://www.youtube.com/watch?v=eljDZdMTPzs) |
| NartOutHere | 2024-07-24 | [ESSENTIAL CS2 Nuke Smokes You NEED to Know](https://www.youtube.com/watch?v=Fp14IZIHJVQ) |
| NartOutHere | 2025-11-11 | [CS2 Ancient Smokes You NEED to Know in 2026](https://www.youtube.com/watch?v=xEhS-AmIzIw) |
| NartOutHere | 2026-01-12 | [CS2 Anubis Smokes You NEED to Know in 2026](https://www.youtube.com/watch?v=588UtJa98F0) |
| NartOutHere | 2026-07-19 | [CS2 Cache Smokes You Need to Know in 2026](https://www.youtube.com/watch?v=eI6EnqTgi0E) |
| NartOutHere | 2024-08-07 | [Essential CS2 Vertigo Smokes You NEED To Know (2024)](https://www.youtube.com/watch?v=CR3cNNTPQs0) |
| NartOutHere | 2025-02-19 | [The ONLY CS2 MIRAGE NADES GUIDE You'll EVER NEED](https://www.youtube.com/watch?v=xPCYPKFG44E) |
| DK Nades | 2025-05-27 | [HE grenade onto stairs on Mirage💥#cs2 #csgo](https://www.youtube.com/watch?v=m8q93UtfKBE) |
| NartOutHere | 2025-03-08 | [Every Dust 2 Nade You NEED to Know in CS2!](https://www.youtube.com/watch?v=6aEaQjRaV1U) |
| Existenz | 2024-04-23 | [C2 Dust 2 HE Grenade Mid Doors from XBox#cs2 #dust2 #shorts](https://www.youtube.com/watch?v=BZCrUUpXpEs) |
| NartOutHere | 2024-11-29 | [The ULTIMATE Inferno Nades Guide For CS2](https://www.youtube.com/watch?v=fWDE1KH9odg) |
| CS Tactics | 2025-04-24 | [Broken Lineups! / Inferno B-Site Utility Guide for 2025!](https://www.youtube.com/watch?v=Z8Yg4EU_p6Q) |
| NadesOutHere | 2026-01-30 | [PR Inferno Flash to Peek Mid on CT](https://www.youtube.com/watch?v=qOa_beX7K68) |
| GnomNadesCS2 | 2026-07-10 | [Banana HE grenade from coffins on Inferno! #cs2 #csgo #inferno #shorts #cs2nades](https://www.youtube.com/watch?v=flVVl6OnwTM) |
| CS Tactics | 2024-01-10 | [CS2 Nuke - All ESSENTIAL Utility for T-SIDE!](https://www.youtube.com/watch?v=tzUBsnvKOcg) |
| NartOutHere | 2025-01-08 | [Essential CS2 NUKE Nades Guide - MUST KNOW (2026)](https://www.youtube.com/watch?v=6_WAimVYF0I) |
| NadesOutHere | 2024-04-05 | [The Strongest Flash on Nuke CT Side](https://www.youtube.com/watch?v=axQhuprlQxc) |
| NadesOutHere | 2025-02-27 | [rain's INSANE Nuke T Red Molotov on CS2](https://www.youtube.com/watch?v=-_ZqUw_QxwA) |
| NadesOutHere | 2026-03-13 | [magixx INSANE Nuke Silo HE NADE in CS2](https://www.youtube.com/watch?v=S493CLa_nTg) |
| NartOutHere | 2024-12-29 | [The ONLY CS2 ANCIENT NADES GUIDE You'll EVER NEED](https://www.youtube.com/watch?v=H9-LFlmPe4U) |
| fREShCS2 | 2025-04-03 | [Ancient CT B Pro Flashbang Spots in 45 Seconds!](https://www.youtube.com/watch?v=2vuW2b1E9yU) |
| NadesOutHere | 2025-07-04 | [Double Molotov Trick for CT Mid Control on Ancient!](https://www.youtube.com/watch?v=K2GBllKW43s) |
| GnomNadesCS2 | 2026-07-01 | [Brutal HE grenade to punish mid players on Ancient! #cs2 #csgo #cs2utility #cs2ancient #shorts](https://www.youtube.com/watch?v=I9-0oA4BGfE) |
| Tigerr | 2026-07-08 | [MUST KNOW Anubis Utility for Free Elo / Anubis Utility Guide](https://www.youtube.com/watch?v=g1jYVHvj2w8) |
| MacMate | 2026-02-02 | [10 GODLIKE CT Flashes to DOMINATE Anubis (CS2 New Anubis Update)](https://www.youtube.com/watch?v=bjvSBhEojUE) |
| CS2 Utility | 2025-09-11 | [CS2 - Molotov Anubis A site to T Stairs](https://www.youtube.com/watch?v=cPIodSWXWHo) |
| MisterT - Counter-Strike 2 (CS2) | 2026-02-03 | [CS2 - Grenade T Stairs Canal / Water on ANUBIS (LAST UPDATE)](https://www.youtube.com/watch?v=PKW4pTjg5-A) |
| NartOutHere | 2026-07-04 | [CS2 Cache Nades You NEED to Know in 2026](https://www.youtube.com/watch?v=5gbIC3igve8) |
| mindtr6cks | 2026-05-07 | [[CS2] HOW TO TRIPLE HE WHITEBOX ON CACHE](https://www.youtube.com/watch?v=gTbboIZF7JY) |
| Spyn | 2025-09-09 | [A CT Flash Vertigo in CS2](https://www.youtube.com/watch?v=frp4CAjDYIo) |
| CS Tactics | 2024-05-27 | [CS2 Vertigo - All ESSENTIAL Molotovs/Incendiary Grenades!](https://www.youtube.com/watch?v=JGd65QKpBac) |
| CS2 School | 2024-03-10 | [CS2 Vertigo - 50+ Damage Grenades!](https://www.youtube.com/watch?v=Mhh5Xrt3yCE) |
| NadesOutHere | 2024-01-16 | [CS2 Vertigo Ramp Retake Flash](https://www.youtube.com/watch?v=ra2mk5qZ1BI) |
| CS2 Pulse | 2024-07-10 | [CS2 Vertigo HE Grenades Tutorial - Learn the Best Vertigo HE Grenade Spots](https://www.youtube.com/watch?v=3KaCMTuG4xA) |
| Utility Kings | 2025-06-06 | [CS2 Nuke B Double doors smoke from Bottom Ramp](https://www.youtube.com/watch?v=LF7hkXkbT_w) |
| NadesOutHere | 2025-05-08 | [These Flashes Clear Nuke Lower Site Instantly 🔦](https://www.youtube.com/watch?v=z2wWjc8n0UI) |
| NadesOutHere | 2026-01-15 | [TeSeS Nuke Flash to Retake B in CS2](https://www.youtube.com/watch?v=05TnXxFo8rs) |
| NadesOutHere | 2026-01-05 | [hampus INSANE Nuke Flash to Defend Lower](https://www.youtube.com/watch?v=o84-2TM68X8) |
| NadesOutHere | 2023-11-05 | [Must know molotov to take lower on b site nuke - cs2 tutorial](https://www.youtube.com/watch?v=-IK1Jjp_LLE) |
| NadesOutHere | 2023-11-16 | [Must throw molotov when taking lower on nuke in CS2](https://www.youtube.com/watch?v=G88eIF_XWYU) |
| CSecret Nades | 2025-03-10 | [NUKE B DARK RETAKE MOLY FROM RAMP #csecretnades #nuke #cs2 #utils](https://www.youtube.com/watch?v=9X78DLx6A2Q) |
| CS Tactics | 2024-01-06 | [CS2 Mirage - ALL Essential UTILITY in 10 MINUTES!](https://www.youtube.com/watch?v=ZLyGvtTNLG8) |
| CS Tactics | 2025-08-04 | [These are Counter-Strike’s 10 Must Know HE GRENADES!](https://www.youtube.com/watch?v=wGBM1aOavOs) |
| NadesOutHere | 2023-10-21 | [CS2 Inferno BIG Pit Molotov From Aps](https://www.youtube.com/watch?v=ExgKPjqRbJ8) |
| Tigerr | 2026-07-01 | [MUST KNOW Inferno Utility for Free Elo / Inferno Utility Guide](https://www.youtube.com/watch?v=mAiM0zMnfh4) |
| NadesOutHere | 2023-09-11 | [CS2 Inferno Pit Retake Molotov From Long](https://www.youtube.com/watch?v=fZ4cVtLAM4E) |
| NadesOutHere | 2023-12-23 | [CS2 Inferno - The Best Banana Retake Flash](https://www.youtube.com/watch?v=vkydpQorAfg) |
| NadesOutHere | 2024-01-12 | [The BEST flash to retake upper on CS2 nuke](https://www.youtube.com/watch?v=gBNcrswDP3w) |
| CS Tactics | 2026-01-23 | [The Anubis Meta is DIFFERENT..](https://www.youtube.com/watch?v=rfZS5TV60Wg) |
| NadesOutHere | 2024-04-24 | [the best vertigo mid flash in cs2](https://www.youtube.com/watch?v=Bw_oMDlJyrA) |
| NadesOutHere | 2023-10-30 | [How to flash b stairs on Vertigo - CS2 tutorial](https://www.youtube.com/watch?v=8hMbl1fqCIQ) |
| NadesOutHere | 2024-01-19 | [Retake A Main Control with this FLASH on Anubis](https://www.youtube.com/watch?v=Su76I4fnOvw) |
| mindtr6cks | 2026-05-01 | [[CS2] A Retake Utility From Car On Cache](https://www.youtube.com/watch?v=COp5h1xE0jE) |
| mindtr6cks | 2026-05-01 | [[CS2] B Retake Utility From Heaven On Cache](https://www.youtube.com/watch?v=ll7jRI0J-jg) |
| Dream League Gaming | 2026-09-20 | [Essential Cache Utility: Smokes, Molotovs & Flashes for CT-Side / CS2 (2026)](https://www.youtube.com/watch?v=FbvrIRUOzM8) |

## Remaining holes and limits

- No entry is independently marked as tested against the installed November 2026 game build. Changed geometry, grenade clipping, player movement or map revisions can invalidate an older demonstration. Dates remain visible rather than treating an editable video title as validation.
- Nuke lower has eight destination-confirmed B-site demonstrations: two smokes, three flashes and three fire examples. A bounded search did not establish a lower-floor HE target. Silo, Yard and upper-site clips are not reassigned downstairs to fill that hole.
- Vertigo lower-floor destination coverage remains absent. B stairs viewed or thrown from another floor do not by themselves prove a lower-floor landing. All current Vertigo entries retain upper-layer placement.
- Some Nuke/Vertigo/Inferno/Anubis clips date to 2023–2025. This is an attributed learning catalogue, not an assertion that each old reference still works unchanged.
- The Vertigo B-stairs HE opens the CS2 Pulse guide from the beginning. Its [creator's own article](https://cs2pulse.com/he-grenades/vertigo/) identifies B stairs from B site, but does not supply a dedicated subchapter offset.
- Exact aim photos require original or explicitly licensed images tied to the same throw. No fabricated screenshots, guessed aim overlays or third-party watermarked media are included here. Every additional photo source must preserve its own license and provenance.
- Before any guide is labelled as tested, its evidence should record map/build version, position, aim, buttons, movement and repeated successful throws. This catalogue itself performs no local game or PC control.
