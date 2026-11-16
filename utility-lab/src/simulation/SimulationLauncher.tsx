import { lazy, Suspense, useRef, useState } from "react";
import { Play } from "lucide-react";
import type { Scenario } from "./engine";
import {
  exportRehearsal,
  flashDrill,
  fromBoard,
  importRehearsal,
  MAX_FILE_BYTES,
  rehearsalKey,
  type BoardInput,
} from "./scenario-io";

const Panel = lazy(() => import("./SimulationPanel"));
interface Props {
  plan: BoardInput;
  mapName: string;
  levelName: string;
  image: string;
  tacticId?: string | null;
}
type Session = {
  key: string | null;
  scenario: Scenario;
  example: Scenario | null;
  notice: string;
  revision: number;
};

export default function SimulationLauncher(props: Props) {
  const { plan, ...board } = props;
  const [session, setSession] = useState<Session | null>(null);
  const [busy, setBusy] = useState(false);
  const token = useRef(0);
  const picker = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  async function open() {
    ++token.current;
    setBusy(true);
    let scenario = fromBoard(plan),
      key = null,
      notice = "From this board · edits saved separately";
    try {
      key = await rehearsalKey(plan, board.tacticId, board.image);
      const saved = localStorage.getItem(key);
      if (saved) {
        scenario = importRehearsal(saved, plan);
        notice = "Rehearsal restored";
      }
    } catch {
      key = null;
      notice = "Local save unavailable · export to keep edits";
    }
    setSession({ key, scenario, example: null, notice, revision: 0 });
    setBusy(false);
  }
  function update(scenario: Scenario, imported = false) {
    if (!session) return;
    if (session.example) {
      setSession({
        ...session,
        example: scenario,
        revision: session.revision + Number(imported),
      });
      return;
    }
    let notice = "Saved on this device";
    try {
      if (!session.key) throw Error();
      localStorage.setItem(session.key, exportRehearsal(plan, scenario));
    } catch {
      notice = "Local save unavailable · export to keep edits";
    }
    setSession({
      ...session,
      scenario,
      notice,
      revision: session.revision + Number(imported),
    });
  }
  function download() {
    if (!session) return;
    const link = document.createElement("a");
    const url = URL.createObjectURL(
      new Blob([exportRehearsal(plan, session.example || session.scenario)], {
        type: "application/json",
      }),
    );
    link.href = url;
    link.download = plan.mapId + "-" + plan.levelId + "-rehearsal.json";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <>
      <button
        className="tb-button tb-simulation-trigger"
        type="button"
        ref={trigger}
        title="Simulate round"
        aria-label="Simulate round"
        aria-haspopup="dialog"
        disabled={busy}
        onClick={open}
      >
        <Play size={16} aria-hidden="true" />
        <span>{busy ? "Opening…" : "Simulate"}</span>
      </button>
      {session && (
        <Suspense fallback={<span role="status">Opening simulation…</span>}>
          <Panel
            key={session.revision}
            plan={
              session.example
                ? { ...plan, name: "Flash timing drill", objects: [] }
                : plan
            }
            mapName={board.mapName}
            levelName={board.levelName}
            image={board.image}
            initialScenario={session.example || session.scenario}
            onChange={update}
            onClose={() => {
              ++token.current;
              setSession(null);
              requestAnimationFrame(() => trigger.current?.focus());
            }}
            saveStatus={
              session.example
                ? "Example drill · your setup is kept"
                : session.notice
            }
            fileControls={
              <div className="rehearsal-file-tools">
                <button
                  type="button"
                  onClick={() => {
                    ++token.current;
                    setSession({
                      ...session,
                      example: session.example
                        ? null
                        : flashDrill(
                            session.scenario.unitsPerBoardUnit,
                            plan.mapId,
                          ),
                      revision: session.revision + 1,
                    });
                  }}
                >
                  {session.example ? "Back to my setup" : "Try a flash drill"}
                </button>
                <button type="button" onClick={download}>
                  Export rehearsal
                </button>
                {!session.example && (
                  <button type="button" onClick={() => picker.current?.click()}>
                    Import rehearsal
                  </button>
                )}
                <input
                  ref={picker}
                  hidden
                  type="file"
                  accept=".json,application/json"
                  aria-label="Import rehearsal JSON"
                  onChange={async (e) => {
                    const file = e.currentTarget.files?.[0];
                    e.currentTarget.value = "";
                    if (!file) return;
                    const request = ++token.current;
                    try {
                      if (file.size > MAX_FILE_BYTES)
                        throw Error("Rehearsal file is too large.");
                      const next = importRehearsal(await file.text(), plan);
                      if (request === token.current) update(next, true);
                    } catch (err) {
                      if (request === token.current)
                        setSession(
                          (current) =>
                            current && {
                              ...current,
                              notice:
                                err instanceof Error
                                  ? err.message
                                  : "Could not open rehearsal.",
                            },
                        );
                    }
                  }}
                />
              </div>
            }
          />
        </Suspense>
      )}
    </>
  );
}
