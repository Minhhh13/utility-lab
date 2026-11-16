import { useEffect, useRef, useState, type FormEvent } from "react";
import { exportFile } from "./file-transfer";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BookOpen,
  Check,
  ChevronRight,
  Copy,
  Download,
  FilePlus2,
  Layers2,
  Map as MapIcon,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { MAPS } from "./maps";
import { uid, validateSavedTactics, type SavedTactic } from "./board-model";
import {
  FAVORITE_UTILITIES_KEY,
  USER_UTILITIES_KEY,
  UTILITY_REFERENCES,
  readUserUtilities,
  readUtilityFavorites,
  type UtilityReference,
} from "./utility-data";
import UtilityIcon, { type UtilityKind } from "./UtilityIcon";
import { GUIDE_LIBRARY } from "./guide-library";
import { expandedMapForId, loadLinkedGuides } from "./expanded-catalogue";
import { portableLineups, storeLineupMedia } from "./media-store";
import {
  BOOKS_KEY,
  PLAYBOOK_DRAFT_KEY,
  TACTICS_KEY,
  MAX_PLAYBOOKS,
  MAX_PLAYBOOK_STEPS,
  MAX_PLAYBOOK_FILE_BYTES,
  createPlaybookFile,
  mergePlaybookFile,
  parsePlaybookFile,
  persistPlaybookImport,
  readPlaybookDraft,
  readPlaybooks,
  validatePlaybook,
  type Playbook,
  type PlaybookDraft,
  type PlaybookStep,
} from "./playbook-model";
import "./workspace-library.css";

export { readPlaybooks } from "./playbook-model";
const BASE_BUILTIN_LINEUPS: UtilityReference[] = [
  ...GUIDE_LIBRARY,
  ...UTILITY_REFERENCES,
];
const kinds = ["smoke", "flash", "molotov", "he"] as const;
const typeNames = {
  smoke: "Smoke",
  flash: "Flash",
  molotov: "Molly",
  he: "HE grenade",
};
const mapName = (id: string) => MAPS.find((map) => map.id === id)?.name || id;
function stored(key: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}
function readWorkspace() {
  return {
    books: readPlaybooks(),
    tactics: validateSavedTactics(stored(TACTICS_KEY)),
    personal: readUserUtilities(),
    favorites: readUtilityFavorites(),
  };
}
function emptyDraft(): PlaybookDraft {
  return {
    id: uid(),
    editingId: null,
    name: "",
    notes: "",
    tacticIds: [],
    lineupIds: [],
    steps: [],
  };
}
const exportJson = (value: unknown, name: string) =>
  exportFile(
    new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
    `${name.replace(/[^a-z0-9_-]/gi, "-") || "playbook"}.json`,
  );
type Props = {
  view: "playbooks" | "stats";
  onNavigate: (view: "board" | "utilities") => void;
  onOpenTactic: (record: SavedTactic) => void;
  onOpenLineup: (record: UtilityReference) => void;
  onNotify: (message: string) => void;
};
export default function WorkspaceLibrary({
  view,
  onNavigate,
  onOpenTactic,
  onOpenLineup,
  onNotify,
}: Props) {
  const [workspace, setWorkspace] = useState(readWorkspace);
  const { books, tactics, personal, favorites } = workspace;
  const [draft, setDraft] = useState<PlaybookDraft | null>(readPlaybookDraft);
  const [expandedLinks, setExpandedLinks] = useState<UtilityReference[]>([]);
  const [linksLoading, setLinksLoading] = useState(true);
  const [linksError, setLinksError] = useState("");
  const [linksRetry, setLinksRetry] = useState(0);
  const linkedIds = [...new Set([
    ...favorites,
    ...books.flatMap(book => [...book.lineupIds, ...book.steps.flatMap(step => step.lineupId || [])]),
    ...(draft?.lineupIds || []),
    ...(draft?.steps.flatMap(step => step.lineupId || []) || []),
  ])].sort().join("\n");
  useEffect(() => {
    let current = true;
    setLinksLoading(true);
    setLinksError("");
    void loadLinkedGuides(linkedIds ? linkedIds.split("\n") : []).then((records) => {
      if (current) { setExpandedLinks(records); setLinksLoading(false); }
    }).catch(() => { if (current) { setLinksLoading(false); setLinksError("Couldn’t load your linked lineups."); } });
    return () => { current = false; };
  }, [linkedIds, linksRetry]);
  const BUILTIN_LINEUPS = [...new Map([...BASE_BUILTIN_LINEUPS, ...expandedLinks].map(record => [record.id, record])).values()];
  const [selectedId, setSelectedId] = useState<string | null>(
    () => readPlaybookDraft()?.editingId || null,
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [draftWarning, setDraftWarning] = useState("");
  const [bookSearch, setBookSearch] = useState("");
  const [resourceSearch, setResourceSearch] = useState("");
  const [statsMap, setStatsMap] = useState("all");
  const [statsSide, setStatsSide] = useState("all");
  const [statsType, setStatsType] = useState("all");
  const importInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const refresh = () => setWorkspace(readWorkspace());
    window.addEventListener("storage", refresh);
    window.addEventListener("utility-lab:workspace-changed", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("utility-lab:workspace-changed", refresh);
    };
  }, []);
  useEffect(() => {
    try {
      if (draft)
        sessionStorage.setItem(PLAYBOOK_DRAFT_KEY, JSON.stringify(draft));
      else sessionStorage.removeItem(PLAYBOOK_DRAFT_KEY);
      setDraftWarning("");
    } catch {
      setDraftWarning(
        "Draft recovery is unavailable. Export the draft before reloading this page.",
      );
    }
  }, [draft]);
  const allLineups = [
    ...new Map(
      [...BUILTIN_LINEUPS, ...personal].map((item) => [item.id, item]),
    ).values(),
  ];
  const selected = books.find((book) => book.id === selectedId) || books[0];
  const attachedIds = draft?.lineupIds || selected?.lineupIds || [];
  const lineups = allLineups.filter(
    (item) =>
      item.userCreated ||
      favorites.includes(item.id) ||
      attachedIds.includes(item.id),
  );
  const editing = draft !== null;
  const baseline = draft?.editingId
    ? books.find((book) => book.id === draft.editingId)
    : null;
  const dirty =
    !!draft &&
    (baseline
      ? JSON.stringify({ ...draft, editingId: undefined }) !==
        JSON.stringify({ ...baseline, editingId: undefined })
      : !!(
          draft.name ||
          draft.notes ||
          draft.tacticIds.length ||
          draft.lineupIds.length ||
          draft.steps.length
        ));
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function begin(book?: Playbook) {
    setDraft(
      book ? { ...structuredClone(book), editingId: book.id } : emptyDraft(),
    );
    setError("");
    setResourceSearch("");
  }
  function cancel() {
    if (
      dirty &&
      !confirm(
        "Discard your unsaved playbook changes? Your saved playbook will be kept.",
      )
    )
      return;
    setDraft(null);
    setError("");
  }
  function update(values: Partial<PlaybookDraft>) {
    setDraft((current) => (current ? { ...current, ...values } : current));
  }
  function persistBooks(next: Playbook[]) {
    localStorage.setItem(BOOKS_KEY, JSON.stringify(next));
    setWorkspace((current) => ({ ...current, books: next }));
  }
  function save(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    const book = validatePlaybook(draft);
    if (!book) {
      setError(
        "Give the playbook and every round step a name. Keep names and notes within their shown limits.",
      );
      return;
    }
    if (!draft.editingId && books.length >= MAX_PLAYBOOKS) {
      setError(
        "This browser has 100 playbooks. Export and remove one to make room.",
      );
      return;
    }
    try {
      persistBooks([book, ...books.filter((item) => item.id !== book.id)]);
      setSelectedId(book.id);
      setDraft(null);
      setError("");
      onNotify("Playbook saved on this device.");
    } catch {
      setError(
        "Browser storage is full or unavailable. Your draft is still here; export it before closing the page.",
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
    try {
      persistBooks(books.filter((book) => book.id !== selected.id));
      setSelectedId(null);
      onNotify("Playbook removed. Your tactics and lineups are still saved.");
    } catch {
      setError("Storage is unavailable. Your playbook was kept.");
    }
  }
  function duplicate() {
    if (!selected) return;
    if (books.length >= MAX_PLAYBOOKS) {
      setError(
        "This browser has 100 playbooks. Export and remove one to make room.",
      );
      return;
    }
    const copy = {
      ...structuredClone(selected),
      id: uid(),
      name: `${selected.name.slice(0, 93)} (copy)`,
      steps: selected.steps.map((step) => ({ ...step, id: uid() })),
    };
    try {
      persistBooks([copy, ...books]);
      setSelectedId(copy.id);
      onNotify("Playbook duplicated. Linked tactics and lineups are shared.");
    } catch {
      setError("Storage is unavailable. The original playbook was kept.");
    }
  }
  async function exportBook(book: Playbook) {
    setBusy(true);
    setError("");
    try {
      const linked = await loadLinkedGuides(book.lineupIds);
      const available = [...new Map([...linked, ...allLineups].map(record => [record.id, record])).values()];
      const file = createPlaybookFile(book, tactics, available);
      file.lineups = await portableLineups(file.lineups);
      await exportJson(file, book.name);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not export this playbook. Your saved data is unchanged.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function importBook(file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      if (file.size > MAX_PLAYBOOK_FILE_BYTES)
        throw new Error("Choose a playbook file smaller than 250 MB.");
      const parsed = parsePlaybookFile(JSON.parse(await file.text()));
      const current = readWorkspace();
      // Resolve library IDs before collision checks; a portable file can still
      // restore its full record payload while offline.
      const incoming = await loadLinkedGuides(parsed.book.lineupIds).catch(() => []);
      const knownLineups = [...new Map([...BUILTIN_LINEUPS, ...incoming].map(record => [record.id, record])).values()];
      const merged = mergePlaybookFile(
        parsed,
        {
          books: current.books,
          tactics: current.tactics,
          lineups: current.personal,
        },
        knownLineups,
      );
      const restoredLineups = await storeLineupMedia(merged.lineups);
      const restoredFavorites = [
        ...new Set([
          ...current.favorites,
          ...merged.importedBook.lineupIds.filter((id) =>
            knownLineups.some((item) => item.id === id),
          ),
        ]),
      ].slice(0, 500);
      persistPlaybookImport(localStorage, {
        [TACTICS_KEY]: JSON.stringify(merged.tactics),
        [USER_UTILITIES_KEY]: JSON.stringify(restoredLineups),
        [FAVORITE_UTILITIES_KEY]: JSON.stringify(restoredFavorites),
        [BOOKS_KEY]: JSON.stringify(merged.books),
      });
      setWorkspace(readWorkspace());
      setSelectedId(merged.importedBook.id);
      window.dispatchEvent(new Event("utility-lab:workspace-changed"));
      onNotify(
        `Playbook imported${merged.missingReferences ? ` with ${merged.missingReferences} missing reference${merged.missingReferences === 1 ? "" : "s"}` : " with its tactics and lineups"}. Existing records were kept.`,
      );
    } catch (cause) {
      setError(
        cause instanceof SyntaxError
          ? "This file is not valid JSON. Choose an exported Utility Lab playbook."
          : cause instanceof DOMException
            ? "The import could not be saved to browser storage. Existing records were kept. Export a backup and free storage before trying again."
            : cause instanceof Error
              ? cause.message
              : "Could not import this file. Existing records were kept.",
      );
    } finally {
      setBusy(false);
      if (importInput.current) importInput.current.value = "";
    }
  }
  function toggleReference(kind: "tactic" | "lineup", id: string) {
    if (!draft) return;
    const key = kind === "tactic" ? "tacticIds" : "lineupIds",
      stepKey = kind === "tactic" ? "tacticId" : "lineupId";
    const exists =
      draft[key].includes(id) ||
      draft.steps.some((step) => step[stepKey] === id);
    update({
      [key]: exists
        ? draft[key].filter((value) => value !== id)
        : [...draft[key], id],
      steps: exists
        ? draft.steps.map((step) =>
            step[stepKey] === id ? { ...step, [stepKey]: undefined } : step,
          )
        : draft.steps,
    });
  }
  function updateStep(id: string, values: Partial<PlaybookStep>) {
    if (!draft) return;
    update({
      steps: draft.steps.map((step) =>
        step.id === id ? { ...step, ...values } : step,
      ),
    });
  }
  function moveStep(index: number, direction: number) {
    if (!draft) return;
    const next = [...draft.steps];
    [next[index], next[index + direction]] = [
      next[index + direction],
      next[index],
    ];
    update({ steps: next });
  }
  function renderTactic(id: string) {
    const record = tactics.find((item) => item.id === id);
    return record ? (
      <button
        className="playbook-tactic"
        key={id}
        onClick={() => onOpenTactic(record)}
      >
        <span className="playbook-tactic-icon">
          <Layers2 size={22} />
        </span>
        <span>
          <strong>{record.plan.name}</strong>
          <small>
            {mapName(record.plan.mapId)} · {record.plan.side} side ·{" "}
            {record.plan.objects.length} objects
          </small>
        </span>
        <ArrowRight size={19} />
      </button>
    ) : (
      <p className="library-missing" key={id}>
        Missing saved tactic <span>{id}</span>. Edit the playbook to remove or
        replace this reference.
      </p>
    );
  }
  function renderLineup(id: string) {
    const item = allLineups.find((record) => record.id === id);
    if (!item && expandedMapForId(id) && (linksLoading || linksError))
      return <p className="library-missing" role="status" key={id}>{linksLoading ? "Loading lineup…" : "Lineup temporarily unavailable."}</p>;
    return item ? (
      <button
        className="playbook-lineup"
        key={id}
        onClick={() => onOpenLineup(item)}
      >
        <UtilityIcon type={item.type.toLowerCase() as UtilityKind} size={25} />
        <span>
          <strong>{item.title}</strong>
          <small>
            {mapName(item.mapId)} · {item.side} side · {item.type} ·{" "}
            {item.target}
          </small>
        </span>
        <ArrowRight size={17} />
      </button>
    ) : (
      <p className="library-missing" key={id}>
        Missing lineup <span>{id}</span>. Edit the playbook to remove or replace
        this reference.
      </p>
    );
  }
  if (view === "stats") {
    const matches = (mapId: string, side: string) =>
      (statsMap === "all" || statsMap === mapId) &&
      (statsSide === "all" || statsSide === side);
    const scopedTactics = tactics.filter((item) =>
      matches(item.plan.mapId, item.plan.side),
    );
    const scopedPersonal = personal.filter(
      (item) =>
        matches(item.mapId, item.side) &&
        (statsType === "all" || item.type === statsType),
    );
    const scopedSaved = allLineups.filter(
      (item) =>
        favorites.includes(item.id) &&
        matches(item.mapId, item.side) &&
        (statsType === "all" || item.type === statsType),
    );
    const scopedLineups = [
      ...new Map(
        [...scopedPersonal, ...scopedSaved].map((item) => [item.id, item]),
      ).values(),
    ];
    const utilityTotals = Object.fromEntries(
      kinds.map((kind) => [
        kind,
        scopedTactics.reduce(
          (sum, record) =>
            sum +
            record.plan.objects.filter((object) => object.kind === kind).length,
          0,
        ),
      ]),
    ) as Record<UtilityKind, number>;
    return (
      <section className="workspace-library stats-page">
        <header className="library-heading">
          <div>
            <h2>Your workspace, in numbers.</h2>
            <p>Saved plans and utility coverage on this device.</p>
          </div>
          <span className="local-data-label">
            <span />
            Local data
          </span>
        </header>
        <div
          className="library-filters"
          aria-label="Workspace statistics filters"
        >
          <label>
            Map
            <select
              aria-label="Statistics map"
              value={statsMap}
              onChange={(event) => setStatsMap(event.target.value)}
            >
              <option value="all">All maps</option>
              {MAPS.map((map) => (
                <option value={map.id} key={map.id}>
                  {map.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Side
            <select
              aria-label="Statistics side"
              value={statsSide}
              onChange={(event) => setStatsSide(event.target.value)}
            >
              <option value="all">Both sides</option>
              <option value="T">T side</option>
              <option value="CT">CT side</option>
            </select>
          </label>
          <label>
            Utility
            <select
              aria-label="Statistics utility"
              value={statsType}
              onChange={(event) => setStatsType(event.target.value)}
            >
              <option value="all">All utility</option>
              {["Smoke", "Flash", "Molotov", "HE"].map((kind) => (
                <option key={kind}>{kind}</option>
              ))}
            </select>
          </label>
          {(statsMap !== "all" ||
            statsSide !== "all" ||
            statsType !== "all") && (
            <button
              className="secondary-button"
              onClick={() => {
                setStatsMap("all");
                setStatsSide("all");
                setStatsType("all");
              }}
            >
              Clear filters
            </button>
          )}
        </div>
        <div className="stats-summary">
          {[
            { label: "Saved tactics", value: scopedTactics.length },
            { label: "Personal lineups", value: scopedPersonal.length },
            { label: "Playbooks", value: books.length },
            { label: "Saved utility references", value: scopedSaved.length },
          ].map((item) => (
            <div key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
        <p className="library-scope-note">
          Map and side filter tactics and lineups. Utility filters lineups and
          placements. Playbooks shows the device total.
        </p>
        <div className="stats-grid">
          <section className="stats-section">
            <h3>Map coverage</h3>
            <p>Choose a map to inspect its saved work.</p>
            <div className="coverage-head">
              <span>Map</span>
              <span>Tactics</span>
              <span>Lineups</span>
            </div>
            {MAPS.filter(
              (map) => statsMap === "all" || map.id === statsMap,
            ).map((map) => (
              <button
                className="coverage-row coverage-button"
                key={map.id}
                aria-label={`Filter statistics to ${map.name}`}
                onClick={() => setStatsMap(map.id)}
              >
                <span>
                  <MapIcon size={15} />
                  {map.name}
                </span>
                <span>
                  {
                    scopedTactics.filter(
                      (record) => record.plan.mapId === map.id,
                    ).length
                  }
                </span>
                <span>
                  {scopedLineups.filter((item) => item.mapId === map.id).length}
                </span>
              </button>
            ))}
            <p className="library-scope-note">
              Lineups counts your personal and saved references once each.
            </p>
          </section>
          <section className="stats-section">
            <h3>Utility on your boards</h3>
            <p>Placements across the filtered saved tactics.</p>
            <div className="utility-stats">
              {kinds
                .filter(
                  (kind) =>
                    statsType === "all" || kind === statsType.toLowerCase(),
                )
                .map((kind) => (
                  <div key={kind}>
                    <span className={`utility-stat-icon is-${kind}`}>
                      <UtilityIcon type={kind} size={28} />
                    </span>
                    <span>{typeNames[kind]}</span>
                    <strong>{utilityTotals[kind]}</strong>
                  </div>
                ))}
            </div>
            <div className="stats-note">
              <p>
                These are workspace stats, not Steam match or FACEIT performance
                stats. Zero means nothing saved in this scope.
              </p>
              <button onClick={() => onNavigate("board")}>
                Open the tactic board <ArrowRight size={16} />
              </button>
            </div>
          </section>
        </div>
        <div className="stats-grid stats-records">
          <section className="stats-section">
            <h3>
              Saved tactics{statsMap !== "all" ? ` · ${mapName(statsMap)}` : ""}
            </h3>
            {scopedTactics
              .slice(0, 10)
              .map((record) => renderTactic(record.id))}
            {!scopedTactics.length && (
              <p className="library-empty-note">
                No tactics in this scope. Save a round plan on the board to
                start.
              </p>
            )}
          </section>
          <section className="stats-section">
            <h3>Lineup coverage</h3>
            <div className="lineup-coverage">
              <span>Utility</span>
              <span>T side</span>
              <span>CT side</span>
              {kinds
                .filter(
                  (kind) =>
                    statsType === "all" || kind === statsType.toLowerCase(),
                )
                .map((kind) => (
                  <div key={kind}>
                    <span>
                      <UtilityIcon type={kind} size={21} />
                      {typeNames[kind]}
                    </span>
                    <strong>
                      {
                        scopedLineups.filter(
                          (item) =>
                            item.type.toLowerCase() === kind &&
                            item.side === "T",
                        ).length
                      }
                    </strong>
                    <strong>
                      {
                        scopedLineups.filter(
                          (item) =>
                            item.type.toLowerCase() === kind &&
                            item.side === "CT",
                        ).length
                      }
                    </strong>
                  </div>
                ))}
            </div>
            {scopedLineups.slice(0, 8).map((item) => renderLineup(item.id))}
            {!scopedLineups.length && (
              <p className="library-empty-note">
                No personal or saved references match these filters. Add or save
                a lineup in Lineups.
              </p>
            )}
            <button
              className="library-text-link"
              onClick={() => onNavigate("utilities")}
            >
              Open Lineups <ArrowRight size={16} />
            </button>
          </section>
        </div>
      </section>
    );
  }
  const visibleBooks = books.filter((book) =>
    `${book.name} ${book.notes}`
      .toLowerCase()
      .includes(bookSearch.toLowerCase()),
  );
  const searchMatch = (name: string, mapId: string) =>
    `${name} ${mapName(mapId)}`
      .toLowerCase()
      .includes(resourceSearch.toLowerCase());
  return (
    <section className="workspace-library">
      <header className="library-heading">
        <div>
          <h2>Keep the team on the same page.</h2>
          <p>
            Sequence the round. Keep its tactics, lineups, and calls together.
          </p>
        </div>
        <div className="library-heading-actions">
          <input
            ref={importInput}
            type="file"
            accept="application/json,.json"
            aria-label="Import playbook JSON"
            hidden
            onChange={(event) => void importBook(event.target.files?.[0])}
          />
          <button
            className="secondary-button"
            disabled={editing || busy}
            onClick={() => importInput.current?.click()}
          >
            <Upload size={16} />
            {busy ? "Working…" : "Import playbook"}
          </button>
          <button
            className="primary-button"
            onClick={() => begin()}
            disabled={editing || busy}
          >
            <Plus size={17} />
            New playbook
          </button>
        </div>
      </header>
      {error && !editing && (
        <p className="library-error" role="alert">
          {error}
        </p>
      )}
      {linksError && <p className="library-error" role="alert">{linksError} <button className="library-text-link" onClick={() => setLinksRetry(attempt => attempt + 1)}>Try again</button></p>}
      <div className="playbook-layout">
        <aside className="playbook-list" aria-label="Your playbooks">
          <div className="playbook-list-heading">
            Your playbooks <span>{books.length}</span>
          </div>
          {books.length > 0 && (
            <label className="library-search">
              <Search size={16} />
              <input
                aria-label="Search playbooks"
                value={bookSearch}
                onChange={(event) => setBookSearch(event.target.value)}
                placeholder="Find a playbook"
              />
            </label>
          )}
          {visibleBooks.map((book) => (
            <button
              key={book.id}
              disabled={editing}
              className={selected?.id === book.id ? "is-selected" : ""}
              aria-pressed={selected?.id === book.id}
              onClick={() => {
                setSelectedId(book.id);
                setError("");
              }}
            >
              <BookOpen size={18} />
              <span>
                <strong>{book.name}</strong>
                <small>
                  {book.steps.length} steps · {book.tacticIds.length} tactics ·{" "}
                  {book.lineupIds.length} lineups
                </small>
              </span>
              <ChevronRight size={16} />
            </button>
          ))}
          {!books.length && <p>Your playbooks will appear here.</p>}
          {books.length > 0 && !visibleBooks.length && (
            <p>No playbooks match “{bookSearch}”.</p>
          )}
        </aside>
        <div className="playbook-content">
          {draft ? (
            <form className="playbook-form" onSubmit={save}>
              <div className="playbook-content-heading">
                <h3>{draft.editingId ? "Edit playbook" : "New playbook"}</h3>
                <button
                  className="icon-button"
                  type="button"
                  onClick={cancel}
                  aria-label="Cancel playbook editing"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="library-scope-note">
                Your draft recovers in this browser tab after a reload.
              </p>
              {draftWarning && (
                <p className="library-error" role="status">
                  {draftWarning}
                </p>
              )}
              <label>
                Playbook name
                <input
                  autoFocus
                  required
                  maxLength={100}
                  value={draft.name}
                  onChange={(event) => update({ name: event.target.value })}
                  placeholder="e.g. Mirage match plan"
                />
              </label>
              <label>
                Team notes
                <textarea
                  maxLength={2000}
                  rows={3}
                  value={draft.notes}
                  onChange={(event) => update({ notes: event.target.value })}
                  placeholder="The calls and priorities your team needs."
                />
              </label>
              <fieldset className="round-sequence-editor">
                <legend>Round sequence</legend>
                <p>
                  Order your calls, assign a role, and link the plan or lineup
                  to open during practice. Up to 40 steps.
                </p>
                {draft.steps.map((step, index) => (
                  <div className="round-step-editor" key={step.id}>
                    <div className="round-step-heading">
                      <strong>Step {index + 1}</strong>
                      <div>
                        <button
                          type="button"
                          className="icon-button"
                          aria-label={`Move step ${index + 1} up`}
                          disabled={index === 0}
                          onClick={() => moveStep(index, -1)}
                        >
                          <ArrowUp size={17} />
                        </button>
                        <button
                          type="button"
                          className="icon-button"
                          aria-label={`Move step ${index + 1} down`}
                          disabled={index === draft.steps.length - 1}
                          onClick={() => moveStep(index, 1)}
                        >
                          <ArrowDown size={17} />
                        </button>
                        <button
                          type="button"
                          className="icon-button"
                          aria-label={`Remove step ${index + 1}`}
                          onClick={() =>
                            update({
                              steps: draft.steps.filter(
                                (item) => item.id !== step.id,
                              ),
                            })
                          }
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                    <label>
                      Call
                      <input
                        aria-label={`Step ${index + 1} title`}
                        required
                        maxLength={120}
                        value={step.title}
                        onChange={(event) =>
                          updateStep(step.id, { title: event.target.value })
                        }
                        placeholder="e.g. Throw the execute smokes"
                      />
                    </label>
                    <div className="round-step-pair">
                      <label>
                        Role / player
                        <input
                          aria-label={`Step ${index + 1} role`}
                          maxLength={100}
                          value={step.role}
                          onChange={(event) =>
                            updateStep(step.id, { role: event.target.value })
                          }
                          placeholder="e.g. Support · Player 3"
                        />
                      </label>
                      <label>
                        Timing / trigger
                        <input
                          aria-label={`Step ${index + 1} timing`}
                          maxLength={80}
                          value={step.timing}
                          onChange={(event) =>
                            updateStep(step.id, { timing: event.target.value })
                          }
                          placeholder="e.g. 1:35 · on the call"
                        />
                      </label>
                    </div>
                    <label>
                      Instructions
                      <textarea
                        aria-label={`Step ${index + 1} notes`}
                        rows={2}
                        maxLength={1000}
                        value={step.notes}
                        onChange={(event) =>
                          updateStep(step.id, { notes: event.target.value })
                        }
                      />
                    </label>
                    <div className="round-step-pair">
                      <label>
                        Tactic
                        <select
                          aria-label={`Step ${index + 1} tactic`}
                          value={step.tacticId || ""}
                          onChange={(event) =>
                            updateStep(step.id, {
                              tacticId: event.target.value || undefined,
                            })
                          }
                        >
                          <option value="">No linked tactic</option>
                          {step.tacticId &&
                            !tactics.some(
                              (item) => item.id === step.tacticId,
                            ) && (
                              <option value={step.tacticId}>
                                Missing tactic — replace or clear
                              </option>
                            )}
                          {tactics.map((record) => (
                            <option key={record.id} value={record.id}>
                              {mapName(record.plan.mapId)} · {record.plan.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Lineup
                        <select
                          aria-label={`Step ${index + 1} lineup`}
                          value={step.lineupId || ""}
                          onChange={(event) =>
                            updateStep(step.id, {
                              lineupId: event.target.value || undefined,
                            })
                          }
                        >
                          <option value="">No linked lineup</option>
                          {step.lineupId &&
                            !allLineups.some(
                              (item) => item.id === step.lineupId,
                            ) && (
                              <option value={step.lineupId}>
                                Missing lineup — replace or clear
                              </option>
                            )}
                          {lineups.map((item) => (
                            <option key={item.id} value={item.id}>
                              {mapName(item.mapId)} · {item.side} · {item.title}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                ))}
                <button
                  className="secondary-button"
                  type="button"
                  disabled={draft.steps.length >= MAX_PLAYBOOK_STEPS}
                  onClick={() =>
                    update({
                      steps: [
                        ...draft.steps,
                        {
                          id: uid(),
                          title: "",
                          role: "",
                          timing: "",
                          notes: "",
                        },
                      ],
                    })
                  }
                >
                  <Plus size={16} />
                  Add round step
                </button>
              </fieldset>
              <div className="playbook-resource-heading">
                <h4>Attached resources</h4>
                <label className="library-search">
                  <Search size={16} />
                  <input
                    aria-label="Search saved resources"
                    placeholder="Search names or maps"
                    value={resourceSearch}
                    onChange={(event) => setResourceSearch(event.target.value)}
                  />
                </label>
              </div>
              <p className="library-scope-note">
                Step links are included automatically when you save. Unchecking
                an attached resource clears its step links.
              </p>
              <fieldset>
                <legend>Saved tactics</legend>
                {tactics
                  .filter((record) =>
                    searchMatch(record.plan.name, record.plan.mapId),
                  )
                  .map((record) => (
                    <label className="playbook-check" key={record.id}>
                      <input
                        type="checkbox"
                        checked={
                          draft.tacticIds.includes(record.id) ||
                          draft.steps.some(
                            (step) => step.tacticId === record.id,
                          )
                        }
                        onChange={() => toggleReference("tactic", record.id)}
                      />
                      <span>
                        {record.plan.name}
                        <small>
                          {mapName(record.plan.mapId)} · {record.plan.side} side
                        </small>
                      </span>
                    </label>
                  ))}
                {!tactics.length && (
                  <p>Save a tactic on the board to add it here.</p>
                )}
                {draft.tacticIds
                  .filter((id) => !tactics.some((item) => item.id === id))
                  .map((id) => (
                    <label className="playbook-check library-missing" key={id}>
                      <input
                        type="checkbox"
                        checked
                        onChange={() => toggleReference("tactic", id)}
                      />
                      <span>
                        Missing tactic: {id}
                        <small>Uncheck to remove its reference.</small>
                      </span>
                    </label>
                  ))}
              </fieldset>
              <fieldset>
                <legend>Saved lineups</legend>
                {lineups
                  .filter((item) => searchMatch(item.title, item.mapId))
                  .map((item) => (
                    <label className="playbook-check" key={item.id}>
                      <input
                        type="checkbox"
                        checked={
                          draft.lineupIds.includes(item.id) ||
                          draft.steps.some((step) => step.lineupId === item.id)
                        }
                        onChange={() => toggleReference("lineup", item.id)}
                      />
                      <span>
                        {item.title}
                        <small>
                          {mapName(item.mapId)} · {item.side} side · {item.type}
                        </small>
                      </span>
                    </label>
                  ))}
                {!lineups.length && (
                  <p>
                    Add a personal lineup or save a utility reference in Lineups
                    first.
                  </p>
                )}
                {draft.lineupIds
                  .filter((id) => !allLineups.some((item) => item.id === id))
                  .map((id) => (
                    <label className="playbook-check library-missing" key={id}>
                      <input
                        type="checkbox"
                        checked
                        onChange={() => toggleReference("lineup", id)}
                      />
                      <span>
                        Missing lineup: {id}
                        <small>Uncheck to remove its reference.</small>
                      </span>
                    </label>
                  ))}
              </fieldset>
              {resourceSearch &&
                !tactics.some((item) =>
                  searchMatch(item.plan.name, item.plan.mapId),
                ) &&
                !lineups.some((item) =>
                  searchMatch(item.title, item.mapId),
                ) && (
                  <p className="library-empty-note">
                    No saved resources match “{resourceSearch}”. Clear the
                    search to see the full list.
                  </p>
                )}
              {error && (
                <p className="library-error" role="alert">
                  {error}
                </p>
              )}
              <div className="playbook-form-actions">
                <button
                  className="secondary-button"
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void exportBook({
                      ...draft,
                      name: draft.name || "Untitled playbook",
                      steps: draft.steps.map((step) => ({
                        ...step,
                        title: step.title || "Untitled step",
                      })),
                      tacticIds: [
                        ...new Set([
                          ...draft.tacticIds,
                          ...draft.steps.flatMap((step) =>
                            step.tacticId ? [step.tacticId] : [],
                          ),
                        ]),
                      ],
                      lineupIds: [
                        ...new Set([
                          ...draft.lineupIds,
                          ...draft.steps.flatMap((step) =>
                            step.lineupId ? [step.lineupId] : [],
                          ),
                        ]),
                      ],
                    })
                  }
                >
                  Export draft
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={cancel}
                >
                  Cancel
                </button>
                <button
                  className="primary-button"
                  type="submit"
                  disabled={busy}
                >
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
              <h4>Round sequence</h4>
              {selected.steps.length ? (
                <ol className="round-sequence">
                  {selected.steps.map((step, index) => (
                    <li key={step.id}>
                      <span className="round-step-number">{index + 1}</span>
                      <div>
                        <h5>{step.title}</h5>
                        {(step.role || step.timing) && (
                          <p className="round-step-meta">
                            {[step.role, step.timing]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                        {step.notes && (
                          <p className="round-step-notes">{step.notes}</p>
                        )}
                        {step.tacticId && renderTactic(step.tacticId)}
                        {step.lineupId && renderLineup(step.lineupId)}
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="library-empty-note">
                  No round steps yet. Edit this playbook to order calls, roles,
                  and timing.
                </p>
              )}
              <h4>Round plans</h4>
              {selected.tacticIds.map(renderTactic)}
              {!selected.tacticIds.length && (
                <p className="library-empty-note">
                  No saved tactics in this playbook yet. Edit it to add your
                  round plans.
                </p>
              )}
              <h4>Lineups</h4>
              {selected.lineupIds.map(renderLineup)}
              {!selected.lineupIds.length && (
                <p className="library-empty-note">No saved lineups added.</p>
              )}
              <div className="playbook-bottom-actions">
                <div>
                  <button
                    className="secondary-button"
                    disabled={busy}
                    onClick={() => void exportBook(selected)}
                  >
                    <Download size={16} />
                    Export playbook
                  </button>
                  <button
                    className="secondary-button"
                    disabled={busy}
                    onClick={duplicate}
                  >
                    <Copy size={16} />
                    Duplicate
                  </button>
                </div>
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
                Build a playbook from saved tactics, personal lineups, and team
                calls. Import a shared playbook to restore its resources.
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
