import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, Check, Copy, Download, Pause, Play, SkipBack } from "lucide-react";
import BoardObjectDrawing from "./BoardObjectDrawing";
import type { SavedTactic } from "./board-model";
import { clockTime, cueSheetHash, cueSheetText, makeCueSheet, parseCueSheet, playerName } from "./cue-sheet";
import { exportFile } from "./file-transfer";
import { expandedMapForId } from "./expanded-catalogue";
import { getMap } from "./maps";
import { getRoundPlan, ROUND_CLOCK_SECONDS, type Playbook } from "./playbook-model";
import { lineupLink } from "./routes";
import type { UtilityReference } from "./utility-data";
import UtilityTargetMarker from "./UtilityTargetMarker";
import "./playbook-playback.css";

type PlaybackProps = { book: Playbook; tactics: SavedTactic[]; lineups: UtilityReference[]; guidesPending?: boolean };

function customRadar(map: string, level: string): string {
  try {
    const stored = localStorage.getItem(`utility-lab:radar:v1:${map}:${level}`);
    return stored && stored.length <= 2_000_000 && /^data:image\/(png|jpeg|webp);base64,/.test(stored) ? stored : "";
  } catch {
    return "";
  }
}

export default function PlaybookPlayback({ book, tactics, lineups, guidesPending }: PlaybackProps) {
  const plan = useMemo(() => getRoundPlan(book, tactics), [book, tactics]);
  const steps = useMemo(() => [...plan.steps].sort((a, b) => a.atSeconds - b.atSeconds), [plan]);
  const cueGroups = useMemo(() => {
    const byTime = new Map<number, typeof steps>();
    for (const step of steps) {
      const group = byTime.get(step.atSeconds);
      if (group) group.push(step);
      else byTime.set(step.atSeconds, [step]);
    }
    return [...byTime];
  }, [steps]);
  const duration = Math.max(ROUND_CLOCK_SECONDS, steps[steps.length - 1]?.atSeconds || 0);
  const [elapsed, setElapsed] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  useEffect(() => {
    if (startedAt === null) return;
    const timer = window.setInterval(() => {
      const seconds = Math.floor((performance.now() - startedAt) / 1000);
      setElapsed(Math.min(duration, seconds));
      if (seconds >= duration) setStartedAt(null);
    }, 100);
    return () => window.clearInterval(timer);
  }, [startedAt, duration]);

  function seek(seconds: number) {
    setElapsed(seconds);
    setStartedAt(null);
  }
  function togglePlayback() {
    if (startedAt !== null) {
      setStartedAt(null);
      return;
    }
    const start = elapsed >= duration ? 0 : elapsed;
    setElapsed(start);
    setStartedAt(performance.now() - start * 1000);
  }

  const past = steps.filter(step => step.atSeconds <= elapsed);
  const activeTime = past[past.length - 1]?.atSeconds;
  const active = past.filter(step => step.atSeconds === activeTime);
  const next = steps.find(step => step.atSeconds > elapsed);
  const attached = book.tacticIds.map(id => tactics.find(item => item.id === id));
  const initialBoard = attached.find(item => item && item.plan.mapId === plan.round.mapId
    && item.plan.levelId === plan.round.levelId && !steps.some(step => step.tacticId === item.id));
  const lastBoard = [...past].reverse().map(step => tactics.find(item => item.id === step.tacticId)).find(Boolean) || initialBoard;
  const activeGuides = active.map(step => lineups.find(item => item.id === step.lineupId)).filter((item): item is UtilityReference => !!item);
  const currentBoard = active.some(step => step.tacticId && step.tacticId === lastBoard?.id) ? lastBoard : undefined;
  const floorReference = currentBoard?.plan || activeGuides[0] || lastBoard?.plan || plan.round;
  const map = getMap(floorReference.mapId);
  const level = map.levels.find(item => item.id === floorReference.levelId) || map.levels[0];
  const board = lastBoard?.plan.mapId === map.id && lastBoard.plan.levelId === level.id ? lastBoard : undefined;
  const pins = [...new Map(activeGuides.filter(item => item.mapId === map.id && item.levelId === level.id).map(item => [item.id, item])).values()];
  const custom = useMemo(() => customRadar(map.id, level.id), [map.id, level.id]);
  const sheets = useMemo(() => plan.round.players.map(player => ({
    player, href: cueSheetHash(makeCueSheet(book, plan.round.mapId, player, steps, tactics, lineups)),
    pending: !!guidesPending && steps.some(step => (!step.playerId || step.playerId === player.id) && step.lineupId
      && expandedMapForId(step.lineupId) && !lineups.some(item => item.id === step.lineupId)),
  })), [plan, book, steps, tactics, lineups, guidesPending]);

  return <section className="pb-rehearsal" aria-label="Round rehearsal">
    <div className="pb-rehearsal-heading"><h4>Round rehearsal</h4><span>{map.name}{map.levels.length > 1 && ` · ${level.name}`}</span></div>
    <div className="pb-stage">
      <figure className="pb-radar">
        <svg viewBox="0 0 1000 1000" role="img" aria-label={`${map.name} ${level.name} rehearsal radar`} data-tactic-id={board?.id}>
          {custom || !level.image.endsWith(".svg") ? <image href={custom || level.image} width="1000" height="1000" className={custom ? "" : "pb-raster"} />
            : <>
              <image className="pb-dark-radar" href={level.image} width="1000" height="1000" />
              <image className="pb-light-radar" href={level.image.replace(".svg", "-light.svg")} width="1000" height="1000" />
            </>}
          {board?.plan.objects.map(object => <BoardObjectDrawing key={object.id} object={object} />)}
          {pins.map(item => <g key={item.id} transform={`translate(${item.x} ${item.y})`}>
            <title>{item.title}</title><UtilityTargetMarker types={[item.type]} radius={26} compact />
          </g>)}
        </svg>
        <figcaption>{board?.plan.name || `${map.name} radar`}</figcaption>
      </figure>
      <div className="pb-live-cues">
        <p className="pb-eyebrow">{active.length ? `At ${clockTime(activeTime!)}` : "At round start"}</p>
        {active.map(step => {
          const player = plan.round.players.find(item => item.id === step.playerId);
          const guide = lineups.find(item => item.id === step.lineupId);
          return <div key={step.id} className="pb-live-cue">
            <span>{[player ? playerName(player) : "Team", player?.role || step.role].filter(Boolean).join(" · ")}</span>
            <strong>{step.title}</strong>
            {step.timing && <p>{step.timing}</p>}
            {step.notes && <p>{step.notes}</p>}
            {guide && <a href={lineupLink(guide, location.href)}>{guide.title}<ArrowUpRight size={14} /></a>}
          </div>;
        })}
        {!active.length && <span>{steps.length ? "Waiting for the first cue." : "Add timed cues to rehearse this round."}</span>}
        {next && <button className="pb-next" onClick={() => seek(next.atSeconds)}>Next · {clockTime(next.atSeconds)}<strong>{next.title}</strong></button>}
      </div>
    </div>
    <div className="pb-transport">
      <button type="button" className="pb-play" onClick={togglePlayback} aria-label={startedAt !== null ? "Pause round" : "Play round"}>
        {startedAt !== null ? <Pause size={17} /> : <Play size={17} />}{startedAt !== null ? "Pause" : "Play"}
      </button>
      <button type="button" className="pb-reset" aria-label="Restart timeline" onClick={() => seek(0)}><SkipBack size={16} /></button>
      <input type="range" aria-label="Round timeline" aria-valuetext={`${clockTime(elapsed)} elapsed`} min="0" max={duration} step="1"
        value={elapsed} onChange={event => seek(Number(event.target.value))} />
      <span className="pb-clock"><b>{clockTime(elapsed)}</b> / {clockTime(duration)}</span>
    </div>
    {cueGroups.length > 0 && <details className="pb-cue-index">
      <summary>Round cues <span>({steps.length})</span></summary>
      <ol aria-label="Jump to a round cue">{cueGroups.map(([seconds, cues]) => <li key={seconds}>
        <button type="button" aria-current={seconds === activeTime ? "step" : undefined} onClick={() => seek(seconds)}>
          <time>{clockTime(seconds)}</time>
          <span className="pb-index-calls">{cues.map(cue => {
            const player = plan.round.players.find(item => item.id === cue.playerId);
            return <span key={cue.id}><strong>{cue.title}</strong><small>{player ? playerName(player) : cue.role || "Team"}</small></span>;
          })}</span>
        </button>
      </li>)}</ol>
    </details>}
    <div className="pb-sheets">
      <h4>Player cue sheets</h4>
      <div className="pb-players">{sheets.map(({ player, href, pending }) => <a key={player.id} href={pending ? undefined : href}
        aria-disabled={pending || undefined} aria-label={`Open ${playerName(player)}’s cue sheet`}>
        <span><strong>{playerName(player)}</strong>{(player.role || pending) && <small>{pending ? "Loading guides…" : player.role}</small>}</span><ArrowUpRight size={16} />
      </a>)}</div>
    </div>
  </section>;
}

export function SharedCueSheet({ payload }: { payload: string }) {
  const sheet = useMemo(() => parseCueSheet(payload), [payload]);
  const [copied, setCopied] = useState(false);
  const [manual, setManual] = useState(false);
  const [error, setError] = useState("");
  const field = useRef<HTMLInputElement>(null);
  useEffect(() => { if (manual) field.current?.select(); }, [manual]);
  if (!sheet) return <section className="pb-sheet-page">
    <h2>Couldn’t open this cue sheet</h2><p>The link may be incomplete. Ask your teammate for a new link or the text file.</p>
    <a href="#playbooks">Open Playbooks</a>
  </section>;
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(location.href);
      setCopied(true);
    } catch {
      setManual(true);
      field.current?.select();
    }
  }
  return <section className="pb-sheet-page" aria-label="Player cue sheet">
    <a className="pb-back" href={`#playbooks?${new URLSearchParams({ book: sheet.bookId })}`}><ArrowLeft size={16} /> Playbooks</a>
    <header><p className="pb-eyebrow">{sheet.map} · {sheet.book}</p><h2>{sheet.player}</h2>
      {sheet.role && <p className="pb-sheet-role">{sheet.role}</p>}</header>
    <div className="pb-sheet-actions">
      <button type="button" onClick={() => void copyLink()}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? "Link copied" : "Copy sheet link"}</button>
      <button type="button" onClick={() => {
        setError("");
        void exportFile(new Blob([cueSheetText(sheet)], { type: "text/plain;charset=utf-8" }), `${sheet.book} - ${sheet.player}.txt`)
          .catch((reason: unknown) => { if (!(reason instanceof DOMException && reason.name === "AbortError")) setError("Couldn’t save the cue sheet. Try again."); });
      }}><Download size={16} />Save text file</button>
    </div>
    {(["localhost", "127.0.0.1", "[::1]"].includes(location.hostname) || location.href.length > 24_000) &&
      <p className="pb-share-note">{location.href.length > 24_000
        ? "For messaging apps with a link length limit, send the text file."
        : "To share from localhost, send the text file. For a phone link, open the planner at its Wi-Fi network address."}</p>}
    {manual && <label className="pb-copy-field">Copy this link<input ref={field} readOnly value={location.href} onFocus={event => event.currentTarget.select()} /></label>}
    {error && <p role="alert">{error}</p>}
    <h3>Timed cues</h3>
    {!sheet.cues.length && <p>This player has no assigned or team cues.</p>}
    <ol className="pb-sheet-cues">{sheet.cues.map((cue, index) => <li key={index}>
      <time>{clockTime(cue.seconds)}</time>
      <div>{(cue.team || cue.role) && <span className="pb-team">{[cue.team ? "Team" : "", cue.role].filter(Boolean).join(" · ")}</span>}<h4>{cue.title}</h4>
        {cue.timing && <p>{cue.timing}</p>}{cue.notes && <p>{cue.notes}</p>}
        {cue.tactic && <p className="pb-sheet-resource">Board · {cue.tactic}</p>}
        {cue.guide && <div className="pb-sheet-resource">
          {cue.guide.link ? <a href={cue.guide.link}>{cue.guide.title} <ArrowUpRight size={14} /></a> : <strong>{cue.guide.title}</strong>}
          {cue.guide.detail && <p>{cue.guide.detail}</p>}
        </div>}
      </div>
    </li>)}</ol>
  </section>;
}
