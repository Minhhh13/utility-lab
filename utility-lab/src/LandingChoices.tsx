import {ChevronRight} from "lucide-react";
import UtilityIcon, {type UtilityKind} from "./UtilityIcon";
import {utilityColor, type UtilityType} from "./utility-data";
import type {UtilityMarkerGroup} from "./utility-markers";
import "./landing-choices.css";

export type LandingChoicesProps = {
  groups: UtilityMarkerGroup[];
  type: UtilityType;
  areaLabel: string;
  onChoose: (group: UtilityMarkerGroup) => void;
};

/** Exact landing choices within the chosen area and utility. This step only
 * selects map data; media belongs to the later throw-from selection. */
export default function LandingChoices({groups, type, areaLabel, onChoose}: LandingChoicesProps) {
  const normalize = (label: string) => label.trim().toLocaleLowerCase();
  const counts = new Map<string, number>();
  for(const group of groups) {
    const label = normalize(group.label);
    counts.set(label, (counts.get(label) || 0) + 1);
  }
  const seen = new Map<string, number>();
  const spots = groups.map(group => {
    const label = normalize(group.label);
    const ordinal = (seen.get(label) || 0) + 1;
    seen.set(label, ordinal);
    return (counts.get(label) || 0) > 1 ? ordinal : null;
  });

  return <section className="ul-landing-choices" aria-label="Landing spot choices">
    <header className="ul-landing-heading">
      <h2>Choose landing spot</h2>
      <p>{areaLabel}</p>
    </header>
    {groups.length ? <ul className="ul-landing-list" aria-label="Landing spots">
      {groups.map((group, index) => <li key={group.id}>
        <button type="button" className="ul-landing-choice"
          aria-label={`Choose ${group.label} landing spot ${index + 1}`}
          onClick={() => onChoose(group)}>
          <span className="ul-landing-icon" style={{color: utilityColor(type)}}>
            <UtilityIcon type={type.toLowerCase() as UtilityKind} size={27}/>
          </span>
          <span className="ul-landing-copy">
            <span className="ul-landing-name">
              <strong>{group.label}</strong>
              {spots[index] !== null && <span className="ul-landing-spot">Spot {spots[index]}</span>}
            </span>
            <small>Choose throw-from location</small>
          </span>
          <ChevronRight className="ul-landing-chevron" size={16} aria-hidden="true"/>
        </button>
      </li>)}
    </ul> : <p className="ul-landing-empty" role="status">No landing spots available.</p>}
  </section>;
}
