# Design references

These references support the local CS2 tactic-board draft. They are design guidance, not application dependencies or runtime code.

## Sources requested by the user

| Source | Applied guidance | Local record |
| --- | --- | --- |
| [Dick Wu's Apple Design Skill](https://github.com/dickwu/apple-design-skill) | HIG foundations, cross-platform translation, task clarity, recovery and restrained craft | [Apple HIG notes](apple-hig-notes.md) |
| [Emil Kowalski's Apple Design](https://www.ui-skills.com/skills/emilkowalski/apple-design) | Immediate response, direct manipulation, interruptibility and reduced motion | `emilkowalski/skills/apple-design/SKILL.md` |
| [Jakub Krehel's Better Interface](https://www.ui-skills.com/skills/jakubkrehel/better-interface) | Six-domain review with evidence, measured contrast and complete state coverage | `jakubkrehel/skills/better-interface/SKILL.md` and owning `better-*` directories |
| [Better Interface on Figma Community](https://www.figma.com/community/skill/61238/better-interface) | The supplied Figma URL could not be retrieved. The canonical GitHub skill source above was available. No separate Figma content was inferred. | See canonical source |
| [Superfuture's Design Review](https://www.ui-skills.com/skills/superfuture/design-review) | Ten-dimension craft review, ranked by user impact with concrete fixes | [Review notes](superfuture-review-notes.md) |

## Vendored source provenance

- `jakubkrehel/`: [jakubkrehel/skills](https://github.com/jakubkrehel/skills), commit `659cc4e5b6df90cfe1f306f5ae1c83fa549e075c`. Better Interface, its six owning skills, and their Markdown references. MIT license retained at `jakubkrehel/LICENSE`.
- `emilkowalski/`: [emilkowalski/skills](https://github.com/emilkowalski/skills), commit `5206a950b715e0cabe7043ea0b2304332b91494e`. Apple Design skill. MIT license retained at `emilkowalski/LICENSE`.
- No license file was found in the inspected Dick Wu or Superfuture repository trees. Their full sources and Apple's copied HIG pages are therefore not republished here; the local notes are attributed summaries with links.

Sources were read on 9 November 2026. Guidance applies to the web app's foundations; this draft does not claim native iOS HIG compliance. No skill telemetry or external artifact-upload service was used.
