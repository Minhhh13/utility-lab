# Anubis Upper to Street throw correction

Checked 10 November 2026. This correction is scoped to the [CS2Tricks Upper to Street smoke](https://www.cs2tricks.com/nades/anubis/smokes/street-from-upper-cb18), guide `expanded-cs2tricks-anubis-street-from-upper-cb18-t`, and its matching [NadeKing 2 video](https://www.youtube.com/watch?v=lVB0h1Fno5E).

The public source metadata classifies movement as `running` and technique as `jumpthrow`; its prose describes a **forward jump throw**. The importer previously expanded those coarse fields into **Run + Jump + LMB**. That wording suggested a sustained run-up.

The user clarified this exact demonstrated throw as a single W tap with the jump and LMB release. The matching 20.381-second video was played and inspected: the aim remains stationary through approximately 7.2 seconds, followed by a brief forward jump and release around 7.4–7.6 seconds. No sustained run-up is shown. The video supplies no keyboard overlay or spoken input instructions, so these frames do **not** independently measure W key-down/key-up duration. The W-tap wording incorporates the user's clarification, consistent with the source's forward-jump description and observed brief movement.

The guide now uses **Tap W + Jump + LMB**, with the release instruction **Tap W once as you jump, then release LMB.** Its source URL, video ID, standing/aim/landing images, coordinates and attribution are unchanged. No other running throws were converted.

The exact-guide correction lives in the owning `SOURCE_GUIDES` row in `src/data/expanded-inferno-anubis-cache.ts`; the generated Anubis JSON reflects it and future catalogue builds preserve it. A regression test checks both owning and generated records, preserves matching media, and confirms a different Run-labelled guide remains unchanged.

Durable source summary and hashes: `docs/data/anubis-street-throw-review.json`. Original public HTML, watch metadata, unmodified video frames and an audio inspection remain under the ignored project-only `outputs/anubis-street-throw-review/` directory. Audio contains game sounds, not a usable spoken instruction transcript. No CS2 or Steam process, installation or game file was accessed.
