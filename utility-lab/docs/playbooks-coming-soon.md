# Playbooks availability

The user requested a greyed-out **Coming soon** state on10November2026.

- Desktop and phone Playbooks tabs are disabled, muted and labelled Coming soon. Arrow/Home/End navigation skips the disabled tab.
- The Home destination remains visible as Coming soon and cannot open the editor.
- Existing `#playbooks` links show a simple Playbooks /Coming soon placeholder. Workspace settings remain available.
- Existing playbook records, draft recovery, model code, portable exports and workspace-backup data remain intact. Stats still count saved records.

The dedicated browser editor workflow suite is explicitly suspended while the public editor is unavailable. Model tests remain active. Public backup, Saved-lineup navigation, stats and WebKit expectations were updated to verify the staged feature and retained data instead of opening the editor.

Focused checks: `e2e/playbooks-comingsoon.spec.ts` (Home/deep links, data retention, keyboard navigation,320px light/dark), the Saved-navigation case in `expanded-catalogue.spec.ts`, and stored-record stats in `workspaces.spec.ts` passed against the source build. Root owns final production verification.
