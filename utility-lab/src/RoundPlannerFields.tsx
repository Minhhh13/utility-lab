import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { uid, type SavedTactic } from "./board-model";
import { getMap, MAPS } from "./maps";
import { createRoundSetup, MAX_CUE_SECONDS, MAX_PLAYBOOK_STEPS, type PlaybookDraft, type PlaybookStep, type PlayerId } from "./playbook-model";
import type { UtilityReference } from "./utility-data";
import "./round-planner-fields.css";

type Props = {
  draft: PlaybookDraft;
  update: (changes: Partial<PlaybookDraft>) => void;
  tactics: SavedTactic[];
  lineups: UtilityReference[];
};

function LineupPicker({ step, index, lineups, onChange }: {
  step: PlaybookStep;
  index: number;
  lineups: UtilityReference[];
  onChange: (id: string | undefined) => void;
}) {
  const [query, setQuery] = useState("");
  const search = query.trim().toLowerCase();
  const choices = lineups.filter(item => item.id === step.lineupId ||
    [item.title, item.target, item.from, item.type, item.side, getMap(item.mapId).name].join(" ").toLowerCase().includes(search));
  return <div className="round-lineup-picker">
    <label>
      Find a lineup
      <input type="search" aria-label={`Search cue ${index + 1} lineups`} value={query}
        onChange={event => setQuery(event.target.value)} placeholder="Search name, callout or utility" />
    </label>
    <label>
      Lineup
      <select aria-label={`Cue ${index + 1} lineup`} value={step.lineupId || ""} onChange={event => onChange(event.target.value || undefined)}>
        <option value="">No linked lineup</option>
        {step.lineupId && !choices.some(item => item.id === step.lineupId) &&
          <option value={step.lineupId}>Unavailable lineup · replace or clear</option>}
        {choices.map(item => <option key={item.id} value={item.id}>
          {getMap(item.mapId).name} · {item.side} · {item.title}
        </option>)}
      </select>
    </label>
    {search && !choices.length && <p className="library-empty-note" role="status">No matching lineups.</p>}
  </div>;
}

export default function RoundPlannerFields({ draft, update, tactics, lineups }: Props) {
  const round = draft.round ?? createRoundSetup();
  const map = getMap(round.mapId);
  const [activeId, setActiveId] = useState<string | undefined>(() => draft.steps[0]?.id);
  const activeIndex = Math.max(0, draft.steps.findIndex(step => step.id === activeId));
  const active = draft.steps[activeIndex];
  const cueNumber = activeIndex + 1;
  function changeCue(values: Partial<PlaybookStep>) {
    update({ steps: draft.steps.map(step => step.id === active.id ? { ...step, ...values } : step) });
  }
  function addCue() {
    const id = uid();
    const lastTime = draft.steps.reduce((latest, step) => Math.max(latest, step.atSeconds ?? 0), 0);
    update({ steps: [...draft.steps, { id, title: "", atSeconds: draft.steps.length ? Math.min(MAX_CUE_SECONDS, lastTime + 5) : 0, role: "", timing: "", notes: "" }] });
    setActiveId(id);
  }
  function moveCue(direction: number) {
    const next = draft.steps.slice();
    const target = activeIndex + direction;
    [next[target], next[activeIndex]] = [next[activeIndex], next[target]];
    update({ steps: next });
    setActiveId(active.id);
  }
  return <>
    <div className="round-map-fields">
      <label>Round map
        <select value={map.id} onChange={event => {
          const next = getMap(event.target.value);
          update({ round: { ...round, mapId: next.id, levelId: next.levels[0].id } });
        }}>
          {MAPS.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </label>
      {map.levels.length > 1 && <label>Round floor
        <select value={round.levelId} onChange={event => update({ round: { ...round, levelId: event.target.value } })}>
          {map.levels.map(level => <option key={level.id} value={level.id}>{level.name}</option>)}
        </select>
      </label>}
    </div>
    <fieldset className="round-roster">
      <legend>Players and roles</legend>
      <div className="round-roster-head" aria-hidden="true"><span>Slot</span><span>Player name</span><span>Role</span></div>
      {round.players.map((player, index) => {
        const slot = index + 1;
        function changePlayer(values: Partial<typeof player>) {
          update({ round: { ...round, players: round.players.map(item => item.id === player.id ? { ...item, ...values } : item) } });
        }
        return <div className="round-roster-row" key={player.id}>
          <span className="round-slot-number" aria-hidden="true">{slot}</span>
          <input aria-label={`Player ${slot} name`} value={player.name} placeholder={`Player ${slot}`}
            maxLength={60} onChange={event => changePlayer({ name: event.target.value })} />
          <input aria-label={`Player ${slot} role`} value={player.role} placeholder="Assign role"
            maxLength={100} onChange={event => changePlayer({ role: event.target.value })} />
        </div>;
      })}
    </fieldset>
    <fieldset className="planner-cues">
      <legend>Timed cues</legend>
      <p>Set each call in seconds from round start. Cues with the same time play together.</p>
      {draft.steps.length > 0 && <div className="planner-cue-list" aria-label="Cues to edit">
        {draft.steps.map((step, index) => {
          const player = round.players.find(item => item.id === step.playerId);
          return <button type="button" key={step.id} aria-pressed={active.id === step.id}
            aria-label={`Edit cue ${index + 1}: ${step.title || "Untitled cue"}`}
            onClick={() => setActiveId(step.id)}>
            <span>{step.atSeconds ?? 0}s</span><strong>{step.title || "Untitled cue"}</strong>
            <small>{player?.name || (player ? `Player ${player.id.slice(1)}` : "Team")}</small>
          </button>;
        })}
      </div>}
      {active && <div className="round-step-editor planner-active-cue" key={active.id}>
        <div className="round-step-heading">
          <strong>Cue {cueNumber}</strong>
          <div>
            <button type="button" className="icon-button" aria-label={`Move cue ${cueNumber} up`}
              disabled={activeIndex === 0} onClick={() => moveCue(-1)}><ArrowUp size={16} /></button>
            <button type="button" className="icon-button" aria-label={`Move cue ${cueNumber} down`}
              disabled={activeIndex === draft.steps.length - 1} onClick={() => moveCue(1)}><ArrowDown size={16} /></button>
            <button type="button" className="icon-button" aria-label={`Remove cue ${cueNumber}`}
              onClick={() => update({ steps: draft.steps.filter(step => step.id !== active.id) })}><Trash2 size={16} /></button>
          </div>
        </div>
        <label>Call
          <input aria-label={`Cue ${cueNumber} call`} required maxLength={120} value={active.title}
            placeholder="What should happen?" onChange={event => changeCue({ title: event.target.value })} />
        </label>
        <div className="round-step-pair">
          <label>Player
            <select aria-label={`Cue ${cueNumber} player`} value={active.playerId || ""} onChange={event =>
              changeCue({ playerId: (event.target.value || undefined) as PlayerId | undefined })}>
              <option value="">Whole team</option>
              {round.players.map((player, index) => <option key={player.id} value={player.id}>
                {player.name || `Player ${index + 1}`}{player.role ? ` · ${player.role}` : ""}
              </option>)}
            </select>
          </label>
          <label>Elapsed seconds
            <input aria-label={`Cue ${cueNumber} elapsed seconds`} type="number" min={0} max={MAX_CUE_SECONDS}
              step={1} required value={active.atSeconds ?? ""}
              onChange={event => changeCue({ atSeconds: event.target.value === "" ? undefined : event.target.valueAsNumber })} />
          </label>
        </div>
        {active.role && <label>Original role
          <input aria-label={`Cue ${cueNumber} original role`} value={active.role} maxLength={100}
            onChange={event => changeCue({ role: event.target.value })} />
        </label>}
        <label>Trigger
          <input aria-label={`Cue ${cueNumber} trigger`} value={active.timing} maxLength={80}
            placeholder="Optional, e.g. on the caller’s signal" onChange={event => changeCue({ timing: event.target.value })} />
        </label>
        <label>Instructions
          <textarea aria-label={`Cue ${cueNumber} notes`} rows={2} maxLength={1000} value={active.notes}
            onChange={event => changeCue({ notes: event.target.value })} />
        </label>
        <label>Tactic
          <select aria-label={`Cue ${cueNumber} tactic`} value={active.tacticId || ""}
            onChange={event => changeCue({ tacticId: event.target.value || undefined })}>
            <option value="">No linked tactic</option>
            {active.tacticId && !tactics.some(item => item.id === active.tacticId) &&
              <option value={active.tacticId}>Missing tactic · replace or clear</option>}
            {tactics.map(record => <option key={record.id} value={record.id}>{getMap(record.plan.mapId).name} · {record.plan.name}</option>)}
          </select>
        </label>
        <LineupPicker step={active} index={activeIndex} lineups={lineups} onChange={lineupId => changeCue({ lineupId })} />
      </div>}
      <button type="button" className="secondary-button planner-add-cue" disabled={draft.steps.length >= MAX_PLAYBOOK_STEPS} onClick={addCue}>
        <Plus size={17} />Add cue
      </button>
    </fieldset>
  </>;
}
