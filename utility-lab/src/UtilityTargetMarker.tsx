import GrenadeIcon, { type UtilityKind } from "./UtilityIcon";
import { UTILITY_TYPES, utilityColor, type UtilityType } from "./utility-data";
import "./utility-target-marker.css";

export type UtilityTargetMarkerProps = {
  types: readonly UtilityType[];
  /** Radius in the containing SVG's units. The parent owns its 44px hit area. */
  radius?: number;
  color?: (type: UtilityType) => string;
  compact?: boolean;
};

/** A target's available utility, drawn around SVG origin (0, 0). */
export default function UtilityTargetMarker({ types, radius = 24, color = utilityColor, compact = false }: UtilityTargetMarkerProps) {
  const available = UTILITY_TYPES.filter(type => types.includes(type));
  if (!available.length) return null;
  const count = available.length;
  if (compact) {
    const size = radius * (count === 1 ? 1.38 : .85);
    const gap = radius * .46;
    const points = count === 1 ? [{x:0,y:0}]
      : count === 2 ? [{x:-gap,y:0},{x:gap,y:0}]
      : count === 3 ? [{x:0,y:-gap},{x:-gap,y:gap},{x:gap,y:gap}]
      : [{x:-gap,y:-gap},{x:gap,y:-gap},{x:-gap,y:gap},{x:gap,y:gap}];
    return <g className="ul-target-marker" aria-hidden="true" pointerEvents="none">
      <circle className="ul-target-marker-backplate" r={radius}/>
      {available.map((type,index) => <g key={type} data-utility={type}>
        <GrenadeIcon type={type.toLowerCase() as UtilityKind} size={size}
          x={points[index].x-size/2} y={points[index].y-size/2}
          style={{color:color(type),strokeWidth:2.15}}/>
      </g>)}
      <circle className="ul-target-marker-outline" r={radius} fill="none" strokeWidth={radius*.065}/>
    </g>;
  }
  const polar = (angle: number, distance = radius) => ({ x: Math.cos(angle) * distance, y: Math.sin(angle) * distance });
  const iconSize = radius * (count === 1 ? 1.28 : count === 2 ? .92 : count === 3 ? .78 : .70);
  const iconDistance = count === 1 ? 0 : radius * (count === 2 ? .47 : .54);

  return <g className="ul-target-marker" aria-hidden="true" pointerEvents="none">
    <circle className="ul-target-marker-backplate" r={radius} />
    {available.map((type, index) => {
      const start = -Math.PI / 2 + index * Math.PI * 2 / count;
      const end = start + Math.PI * 2 / count;
      const a = polar(start), b = polar(end), icon = polar((start + end) / 2, iconDistance);
      return <g key={type} data-utility={type}>
        {count === 1
          ? <circle r={radius} fill={color(type)} opacity=".12" />
          : <path d={`M 0 0 L ${a.x} ${a.y} A ${radius} ${radius} 0 ${end - start > Math.PI ? 1 : 0} 1 ${b.x} ${b.y} Z`} fill={color(type)} opacity={compact ? .4 : .16} />}
        {(!compact || count === 1) && <GrenadeIcon type={type.toLowerCase() as UtilityKind} size={iconSize}
          x={icon.x - iconSize / 2} y={icon.y - iconSize / 2}
          style={{ color: color(type), strokeWidth: 2.15 }} />}
      </g>;
    })}
    {count > 1 && available.map((type, index) => {
      const end = polar(-Math.PI / 2 + index * Math.PI * 2 / count);
      return <line key={type} x1="0" y1="0" x2={end.x} y2={end.y}
        className="ul-target-marker-divider" strokeWidth={radius * .055} />;
    })}
    <circle className="ul-target-marker-outline" r={radius} fill="none" strokeWidth={radius * .065} />
  </g>;
}
