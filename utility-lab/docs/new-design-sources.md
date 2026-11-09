# Additional design and work references

Read on 9 November 2026 for the requested full UI overhaul. These are research inputs, not runtime dependencies. The scope remains the local CS2 tactic editor. The installed skills and existing [review guide](design-review-guide.md) supply the working implementation instructions.

## Frontend guidance

**[TasteSkill](https://www.tasteskill.dev/), [documentation](https://www.tasteskill.dev/docs).** Its documentation distinguishes an app screen that people work in from a page they read and scroll. This editor belongs on the app-screen route: inventory the real objects and jobs, make the largest area answer the primary task, build all states, and inspect the result at desktop, tablet and phone widths. A redesign records the before, keeps the stack and working behavior, rebuilds the visual frame, and compares the after at the same widths. App checks allow quiet borders and repeated working panels; they reject decoration, tiny text, unused canvas, and desktop UI squeezed onto a phone. Apply that route rather than marketing-page photograph counts or hero compositions. The installed `design-taste-frontend` skill is the relevant local entry point.

**[Emil Kowalski's skills](https://github.com/emilkowalski/skills), [skill index](https://emilkowal.ski/skill).** The index resolves to the installed design-engineering, Apple design, animation, mobile-native and interface stress-testing skills. The main [design-engineering source](https://raw.githubusercontent.com/emilkowalski/skills/main/skills/emil-design-eng/SKILL.md) makes motion a decision based on purpose and frequency: repeated editing and keyboard operations stay immediate. Occasional disclosure can use short, interruptible transitions; press feedback should be immediate. The [mobile-native source](https://raw.githubusercontent.com/emilkowalski/skills/main/skills/mobile-native/SKILL.md) requires capability-based hover behavior, usable viewport units, 16px phone inputs, safe-area handling, and preserved browser zoom. Phone emulation is useful evidence but does not establish physical iPhone behavior.

**[Playwright agent CLI skills](https://playwright.dev/agent-cli/skills).** This is browser-automation guidance rather than a visual style. It documents snapshots, locators, keyboard/mouse interaction, tracing, screenshots, session management, storage, and browser tests. Apply it to repeatable editor flows: choose a map, place and move an object, draw a route, undo/redo, save/reload, switch levels, export/import, and inspect narrow layouts. Existing local Playwright tests remain useful regression evidence during the redesign.

**[Impeccable](https://impeccable.style/), [designing guide](https://impeccable.style/designing/).** Its Operate mode prioritizes completing frequent tasks. It distinguishes a replacement design from a refinement, recommends recording intentional changes in `DESIGN.md`, and calls for reviewing the working UI through real tasks, narrow screens and keyboard use. It also cautions that overlapping design instructions can pull in different directions. Use one coherent visual system, with the other sources checking interaction and craft; a detector report is supporting evidence rather than the design itself.

## Work orchestration

**[Claude Cookbook: The chief of staff agent](https://platform.claude.com/cookbook/claude-agent-sdk-01-the-chief-of-staff-agent).** This is an Agent SDK orchestration example, not a frontend aesthetic skill. Its transferable ideas are bounded specialist delegation, persistent project context, evidence-backed synthesis, and deterministic checks. The current redesign can apply those ideas through separate implementation, reference research and independent review tasks, then consolidate their results. No Claude SDK or additional agent service is required inside the website.

## Named tools and unresolved skill names

| User-supplied name | Primary source and role | Relevance to this local overhaul |
| --- | --- | --- |
| Firecrawl | [Official introduction](https://docs.firecrawl.dev/introduction): web search, extraction and interaction | Could support later external-content research; does not supply a visual design system. |
| Playwright | [Official skills documentation](https://playwright.dev/agent-cli/skills): browser automation and verification | Directly applicable to the existing editor checks. |
| Perplexity | [Official overview](https://docs.perplexity.ai/docs/getting-started/overview): search and web-grounded research APIs | A possible research source, not needed as a website runtime dependency for this editor. |
| Post Hog / PostHog | [Official docs](https://posthog.com/docs): product analytics, replay, feature flags and related tools | Future product measurement is a separate integration decision; this draft's UI review uses local tests. |
| Composio | [Official docs](https://docs.composio.dev/docs): agent tool access, managed authentication and app integrations | Relevant to later connected workflows; the local tactic editor does not need an integration platform to draw and save plans. |
| Anatomy | No exact source or uniquely identified skill was supplied | Left unresolved instead of choosing an unrelated project. |
| Marketing Psychology | A topic, with no exact skill source supplied | Could inform a future marketing site; the immediate surface is a working editor. |
| Last 3 Days | No exact source or uniquely identified skill was supplied | Left unresolved; not silently substituted with a similarly named research skill. |

No new accounts, paid services, analytics collection, telemetry hooks, global skill installations, or remote artifact uploads were introduced by this reference research.

## Further references supplied during the overhaul

### Vercel Web Design Guidelines

The supplied [skill source](https://github.com/vercel-labs/agent-skills/blob/main/skills/web-design-guidelines/SKILL.md) instructs reviewers to fetch the [current official rules](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md); both were read. Relevant checks are semantic named controls, live async feedback, visible focus that overlays do not cover, explicit image dimensions, non-gesture alternatives, recoverable destructive actions, cheap controlled input updates, and safe-area/reduced-motion support. Genuine unsaved changes need a navigation warning. Map and level state can support deep links. Review findings should identify the actual file and line. Existing project decisions govern stylistic conflicts such as heading capitalization.

### Awesome DESIGN.md

[VoltAgent's collection](https://github.com/voltagent/awesome-design-md) contains third-party design analyses, not official application specifications from those brands. The relevant inspected examples were [Figma](https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/design-md/figma/DESIGN.md), [Apple](https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/design-md/apple/DESIGN.md), [Linear](https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/design-md/linear.app/DESIGN.md), and [Miro](https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/design-md/miro/DESIGN.md).

These examples mostly analyze marketing sites: Figma's editorial color blocks, Apple's product-gallery pages, Linear's near-black product presentation, and Miro's colorful whiteboard positioning. The useful inference for this editor is a disciplined document structure covering surfaces, typography, spacing, component hierarchy and states. Canvas/chrome separation, readable hierarchy and controlled use of accents transfer well. Their proprietary fonts, branding, oversized hero scales and marketing compositions are not adopted as requirements for the CS2 board.

### Image-to-Code Pro

The supplied [MCP Market listing](https://mcpmarket.com/tools/skills/image-to-code-pro) resolves to the public [OpenDesign image-to-code skill](https://raw.githubusercontent.com/nexu-io/open-design/main/skills/image-to-code-skill/SKILL.md). Its workflow generates readable visual references itself, analyzes their layout, type, spacing and controls, then implements toward them; a user-supplied screenshot is not required. It favors section-specific references over compressed collages and rejects nested containers, tiny decorative labels and generic reinterpretation.

Its main examples concern visually led websites, though it also names redesigns. This is a distinct workflow from the installed app-screen/code-led route. Reading it does not establish that its image-generation workflow ran, and no pixel-faithful match to a user reference can be claimed without such a reference. If used as the governing workflow for a future surface, generate and inspect its visual source before coding. Its clarity and anti-clutter checks remain useful review questions here.
