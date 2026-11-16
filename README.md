# Utility Lab

A local-first Counter-Strike 2 planning workspace with a tactic board, video/photo lineups, playbooks and local activity stats.

[Public source repository](https://github.com/Minhhh13/utility-lab)

```sh
cd utility-lab
npm ci
npm run dev
```

Open the localhost URL printed by Vite. The website is served locally; the public repository does not deploy it.

- Fullscreen animated pixel-art entry with Tactic board, Lineups and Stats.
- Eight Active Duty/FACEIT maps and 10 selectable floor views.
- A large tactic canvas, grouped tools, recoverable edits and portable tactic files.
- **Tactic board → Simulate** rehearses T/CT movement and timed utility. See the
  [setup, calibration and worked flash drill](utility-lab/docs/tactic-simulation.vi.md).
- The published Lineups library contains 1,500 records across eight maps.
- Local workspace counts, backup controls and appearance settings. Playbooks is marked Coming soon.

The 68 additional practice references are illustrative, not independently verified throws. Workspace stats come from browser storage; they are not Steam/FACEIT match statistics.

![Utility Lab fullscreen entry](utility-lab/docs/preview-home.png)

See the [application guide](utility-lab/README.md), [product scope](PRODUCT.md), [design system](DESIGN.md), [creator sources](utility-lab/docs/lineup-sources.md) and [verification record](utility-lab/docs/verification.md).
