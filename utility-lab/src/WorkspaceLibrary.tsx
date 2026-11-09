import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Download,
  FilePlus2,
  Layers2,
  Map,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { MAPS } from "./maps";
import { uid, validateSavedTactics, type SavedTactic } from "./board-model";
import {
  UTILITY_REFERENCES,
  readUserUtilities,
  readUtilityFavorites,
} from "./utility-data";
import UtilityIcon, { type UtilityKind } from "./UtilityIcon";
import { CREATOR_GUIDES } from "./creator-guides";
import "./workspace-library.css";

type Playbook = {
  id: string;
  name: string;
  notes: string;
  tacticIds: string[];
  lineupIds: string[];
};
const BOOKS_KEY = "utility-lab:playbooks:v1";
type PlaybookDraft = Omit<Playbook, "id"> & { selectedId: string | null };
// Keep the current form when switching between workspace tabs.
let recoveredPlaybook: PlaybookDraft | null = null;
function stored(key: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}
export function readPlaybooks(): Playbook[] {
  const value = stored(BOOKS_KEY);
  if (!Array.isArray(value)) return [];
  return value.slice(0, 100).flatMap((item) => {
    if (
      !item ||
      typeof item !== "object" ||
      typeof item.id !== "string" ||
      typeof item.name !== "string" ||
      !item.name.trim() ||
      item.name.length > 100
    )
      return [];
    return [
      {
        id: item.id.slice(0, 100),
        name: item.name,
        notes: typeof item.notes === "string" ? item.notes.slice(0, 2000) : "",
        tacticIds: Array.isArray(item.tacticIds)
          ? item.tacticIds
              .filter((id: unknown) => typeof id === "string")
              .slice(0, 100)
          : [],
        lineupIds: Array.isArray(item.lineupIds)
          ? item.lineupIds
              .filter((id: unknown) => typeof id === "string")
              .slice(0, 100)
          : [],
      },
    ];
  });
}
function exportJson(value: unknown, name: string) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${name.replace(/[^a-z0-9_-]/gi, "-") || "playbook"}.json`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
type Props = {
  view: "playbooks" | "stats";
  onNavigate: (view: "board" | "utilities") => void;
  onOpenTactic: (record: SavedTactic) => void;
  onNotify: (message: string) => void;
};

export default function WorkspaceLibrary({
  view,
  onNavigate,
  onOpenTactic,
  onNotify,
}: Props) {
  const [books, setBooks] = useState(readPlaybooks);
  const [selectedId, setSelectedId] = useState<string | null>(
    () => recoveredPlaybook?.selectedId || null,
  );
  const [editing, setEditing] = useState(() => recoveredPlaybook !== null);
  const [name, setName] = useState(() => recoveredPlaybook?.name || "");
  const [notes, setNotes] = useState(() => recoveredPlaybook?.notes || "");
  const [tacticIds, setTacticIds] = useState<string[]>(
    () => recoveredPlaybook?.tacticIds || [],
  );
  const [lineupIds, setLineupIds] = useState<string[]>(
    () => recoveredPlaybook?.lineupIds || [],
  );
  const [error, setError] = useState("");
  const [tactics] = useState(() =>
    validateSavedTactics(stored("utility-lab:tactics:v1")).filter((record) =>
      MAPS.some((map) => map.id === record.plan.mapId),
    ),
  );
  const [personal] = useState(() =>
    readUserUtilities().filter((item) =>
      MAPS.some((map) => map.id === item.mapId),
    ),
  );
  const [favorites] = useState(readUtilityFavorites);
  useEffect(() => {
    if (view !== "playbooks") return;
    recoveredPlaybook = editing
      ? { selectedId, name, notes, tacticIds, lineupIds }
      : null;
  }, [view, editing, selectedId, name, notes, tacticIds, lineupIds]);
  useEffect(() => {
    if (!editing) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [editing]);
  const lineups = [
    ...personal,
    ...[...CREATOR_GUIDES, ...UTILITY_REFERENCES].filter((item) =>
      favorites.includes(item.id),
    ),
  ];
  const selected = books.find((book) => book.id === selectedId) || books[0];
  const selectedTactics = tactics.filter((record) =>
    selected?.tacticIds.includes(record.id),
  );
  const selectedLineups = lineups.filter((item) =>
    selected?.lineupIds.includes(item.id),
  );
  const kinds = ["smoke", "flash", "molotov", "he"] as const;
  const utilityTotals = Object.fromEntries(
    kinds.map((kind) => [
      kind,
      tactics.reduce(
        (sum, record) =>
          sum +
          record.plan.objects.filter((object) => object.kind === kind).length,
        0,
      ),
    ]),
  ) as Record<UtilityKind, number>;
  function begin(book?: Playbook) {
    setSelectedId(book?.id || null);
    setName(book?.name || "");
    setNotes(book?.notes || "");
    setTacticIds(book?.tacticIds || []);
    setLineupIds(book?.lineupIds || []);
    setError("");
    setEditing(true);
  }
  function save(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Give your playbook a name.");
      return;
    }
    if (books.length >= 100 && !selectedId) {
      setError(
        "This browser has 100 playbooks. Export and remove one to make room.",
      );
      return;
    }
    const book: Playbook = {
      id: selectedId || uid(),
      name: name.trim().slice(0, 100),
      notes: notes.slice(0, 2000),
      tacticIds,
      lineupIds,
    };
    const next = [book, ...books.filter((item) => item.id !== book.id)];
    try {
      localStorage.setItem(BOOKS_KEY, JSON.stringify(next));
      setBooks(next);
      setSelectedId(book.id);
      setEditing(false);
      onNotify("Playbook saved on this device.");
    } catch {
      setError(
        "Browser storage is full or unavailable. Keep this form open or export your draft.",
      );
    }
  }
  function remove() {
    if (
      !selected ||
      !confirm(
        `Delete “${selected.name}”? Saved tactics and lineups will be kept.`,
      )
    )
      return;
    const next = books.filter((book) => book.id !== selected.id);
    try {
      localStorage.setItem(BOOKS_KEY, JSON.stringify(next));
      setBooks(next);
      setSelectedId(null);
      onNotify("Playbook removed. Your tactics and lineups are still saved.");
    } catch {
      onNotify("Storage is unavailable. Your playbook was kept.");
    }
  }

  if (view === "stats")
    return (
      <section className="workspace-library stats-page">
        <header className="library-heading">
          <div>
            <h2>Your workspace, in numbers.</h2>
            <p>Real activity saved in this browser.</p>
          </div>
          <span className="local-data-label">
            <span />
            Local data
          </span>
        </header>
        <div className="stats-summary">
          {[
            { label: "Saved tactics", value: tactics.length },
            { label: "Personal lineups", value: personal.length },
            { label: "Playbooks", value: books.length },
            { label: "Saved utility references", value: favorites.length },
          ].map((item) => (
            <div key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
        <div className="stats-grid">
          <section className="stats-section">
            <h3>Map coverage</h3>
            <div className="coverage-head">
              <span>Map</span>
              <span>Tactics</span>
              <span>Lineups</span>
            </div>
            {MAPS.map((map) => (
              <div className="coverage-row" key={map.id}>
                <span>
                  <Map size={15} />
                  {map.name}
                </span>
                <span>
                  {
                    tactics.filter((record) => record.plan.mapId === map.id)
                      .length
                  }
                </span>
                <span>
                  {personal.filter((item) => item.mapId === map.id).length}
                </span>
              </div>
            ))}
          </section>
          <section className="stats-section">
            <h3>Utility on your boards</h3>
            <p>Placements across your saved tactics.</p>
            <div className="utility-stats">
              {kinds.map((kind) => (
                <div key={kind}>
                  <span className={`utility-stat-icon is-${kind}`}>
                    <UtilityIcon type={kind} size={28} />
                  </span>
                  <span>
                    {
                      {
                        smoke: "Smoke",
                        flash: "Flash",
                        molotov: "Molly",
                        he: "HE grenade",
                      }[kind]
                    }
                  </span>
                  <strong>{utilityTotals[kind]}</strong>
                </div>
              ))}
            </div>
            <div className="stats-note">
              <p>
                These are workspace stats, not Steam match or FACEIT performance
                stats.
              </p>
              <button onClick={() => onNavigate("board")}>
                Open the tactic board <ArrowRight size={16} />
              </button>
            </div>
          </section>
        </div>
      </section>
    );

  return (
    <section className="workspace-library">
      <header className="library-heading">
        <div>
          <h2>Keep the team on the same page.</h2>
          <p>Bring your saved tactics and lineups together.</p>
        </div>
        <button
          className="primary-button"
          onClick={() => begin()}
          disabled={editing}
        >
          <Plus size={17} />
          New playbook
        </button>
      </header>
      <div className="playbook-layout">
        <aside className="playbook-list" aria-label="Your playbooks">
          <div className="playbook-list-heading">
            Your playbooks <span>{books.length}</span>
          </div>
          {books.map((book) => (
            <button
              key={book.id}
              disabled={editing}
              className={selected?.id === book.id ? "is-selected" : ""}
              onClick={() => {
                setSelectedId(book.id);
                setEditing(false);
              }}
            >
              <BookOpen size={18} />
              <span>
                <strong>{book.name}</strong>
                <small>
                  {book.tacticIds.length} tactics · {book.lineupIds.length}{" "}
                  lineups
                </small>
              </span>
              <ChevronRight size={16} />
            </button>
          ))}
          {!books.length && <p>Your playbooks will appear here.</p>}
        </aside>
        <div className="playbook-content">
          {editing ? (
            <form className="playbook-form" onSubmit={save}>
              <div className="playbook-content-heading">
                <h3>{selectedId ? "Edit playbook" : "New playbook"}</h3>
                <button
                  className="icon-button"
                  type="button"
                  onClick={() => setEditing(false)}
                  aria-label="Cancel playbook editing"
                >
                  <X size={20} />
                </button>
              </div>
              <label>
                Playbook name
                <input
                  autoFocus
                  required
                  maxLength={100}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Mirage match plan"
                />
              </label>
              <label>
                Team notes
                <textarea
                  maxLength={2000}
                  rows={3}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Roles, timing, and the calls your team needs."
                />
              </label>
              <fieldset>
                <legend>Saved tactics</legend>
                {tactics.length ? (
                  tactics.map((record) => (
                    <label className="playbook-check" key={record.id}>
                      <input
                        type="checkbox"
                        checked={tacticIds.includes(record.id)}
                        onChange={() =>
                          setTacticIds((current) =>
                            current.includes(record.id)
                              ? current.filter((id) => id !== record.id)
                              : [...current, record.id],
                          )
                        }
                      />
                      <span>
                        {record.plan.name}
                        <small>
                          {
                            MAPS.find((map) => map.id === record.plan.mapId)
                              ?.name
                          }{" "}
                          · {record.plan.side} side
                        </small>
                      </span>
                    </label>
                  ))
                ) : (
                  <p>Save a tactic on the board to add it here.</p>
                )}
              </fieldset>
              <fieldset>
                <legend>Saved lineups</legend>
                {lineups.length ? (
                  lineups.map((item) => (
                    <label className="playbook-check" key={item.id}>
                      <input
                        type="checkbox"
                        checked={lineupIds.includes(item.id)}
                        onChange={() =>
                          setLineupIds((current) =>
                            current.includes(item.id)
                              ? current.filter((id) => id !== item.id)
                              : [...current, item.id],
                          )
                        }
                      />
                      <span>
                        {item.title}
                        <small>
                          {MAPS.find((map) => map.id === item.mapId)?.name} ·{" "}
                          {item.side} side · {item.type}
                        </small>
                      </span>
                    </label>
                  ))
                ) : (
                  <p>
                    Add a personal lineup or save a utility reference first.
                  </p>
                )}
              </fieldset>
              {error && (
                <p className="library-error" role="alert">
                  {error}
                </p>
              )}
              <div className="playbook-form-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() =>
                    exportJson(
                      {
                        format: "utility-lab-playbook",
                        version: 1,
                        book: { name, notes, tacticIds, lineupIds },
                        tactics: tactics.filter((item) =>
                          tacticIds.includes(item.id),
                        ),
                        lineups: lineups.filter((item) =>
                          lineupIds.includes(item.id),
                        ),
                      },
                      name,
                    )
                  }
                >
                  Export draft
                </button>
                <button className="primary-button" type="submit">
                  <Check size={17} />
                  Save playbook
                </button>
              </div>
            </form>
          ) : selected ? (
            <>
              <div className="playbook-content-heading">
                <div>
                  <BookOpen size={22} />
                  <h3>{selected.name}</h3>
                </div>
                <button
                  className="secondary-button"
                  onClick={() => begin(selected)}
                >
                  Edit playbook
                </button>
              </div>
              {selected.notes && (
                <p className="playbook-notes">{selected.notes}</p>
              )}
              <h4>Round plans</h4>
              {selectedTactics.map((record) => (
                <button
                  className="playbook-tactic"
                  key={record.id}
                  onClick={() => onOpenTactic(record)}
                >
                  <span className="playbook-tactic-icon">
                    <Layers2 size={22} />
                  </span>
                  <span>
                    <strong>{record.plan.name}</strong>
                    <small>
                      {MAPS.find((map) => map.id === record.plan.mapId)?.name} ·{" "}
                      {record.plan.side} side · {record.plan.objects.length}{" "}
                      objects
                    </small>
                  </span>
                  <ArrowRight size={19} />
                </button>
              ))}
              {!selectedTactics.length && (
                <p className="library-empty-note">
                  No saved tactics in this playbook yet. Edit it to add your
                  round plans.
                </p>
              )}
              <h4>Lineups</h4>
              {selectedLineups.map((item) => (
                <div className="playbook-lineup" key={item.id}>
                  <UtilityIcon
                    type={item.type.toLowerCase() as UtilityKind}
                    size={25}
                  />
                  <div>
                    <strong>{item.title}</strong>
                    <small>
                      {MAPS.find((map) => map.id === item.mapId)?.name} ·{" "}
                      {item.side} side · {item.target}
                    </small>
                  </div>
                </div>
              ))}
              {!selectedLineups.length && (
                <p className="library-empty-note">No saved lineups added.</p>
              )}
              <div className="playbook-bottom-actions">
                <button
                  className="secondary-button"
                  onClick={() =>
                    exportJson(
                      {
                        format: "utility-lab-playbook",
                        version: 1,
                        book: selected,
                        tactics: selectedTactics,
                        lineups: selectedLineups,
                      },
                      selected.name,
                    )
                  }
                >
                  <Download size={16} />
                  Export playbook
                </button>
                <button className="library-delete" onClick={remove}>
                  <Trash2 size={16} />
                  Delete playbook
                </button>
              </div>
            </>
          ) : (
            <div className="playbook-empty">
              <span>
                <BookOpen size={36} strokeWidth={1.4} />
              </span>
              <h3>A good plan is worth keeping.</h3>
              <p>
                Build a playbook from your saved tactics, personal lineups, and
                team notes.
              </p>
              <button className="primary-button" onClick={() => begin()}>
                <FilePlus2 size={17} />
                Create your first playbook
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
