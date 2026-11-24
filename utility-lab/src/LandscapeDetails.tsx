import type { SceneId } from "./launch-scenes";

// Coordinates follow the 1672 × 941 painting, including its crop on a phone.
export default function LandscapeDetails({ scene }: { scene: SceneId }) {
  return (
    <svg className="landscape-details" aria-hidden="true" viewBox="0 0 1672 941" preserveAspectRatio="xMidYMid slice">
      {scene === "foundry" && <>
        <defs>
          <radialGradient id="launch-lamplight">
            <stop stopColor="#ffdf95" stopOpacity=".7" />
            <stop offset="1" stopColor="#ffc97d" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g className="foundry-lamps" fill="url(#launch-lamplight)">
          <ellipse cx="1105" cy="558" rx="32" ry="20" />
          <ellipse cx="1341" cy="503" rx="45" ry="24" />
          <ellipse cx="1552" cy="553" rx="25" ry="16" />
          <ellipse cx="1348" cy="842" rx="82" ry="9" />
        </g>
      </>}
      {scene === "temple" && [[283,716],[493,660],[775,698],[925,565],[1144,692],[1518,736]].map(([x,y],i) => (
        <g key={x} transform={`translate(${x} ${y})`}>
          <g className="temple-firefly" style={{animationDelay:`-${i * 1.35}s`}}>
            <circle r="6" fill="#ffdd7a" opacity=".18" />
            <rect x="-1.5" y="-1.5" width="3" height="3" fill="#fff1a4" />
          </g>
        </g>
      ))}
      {scene === "dunes" && <g className="dunes-sand" fill="#f3c186">
        <path d="M714 790h13v2h-13z M743 783h5v2h-5z M790 795h9v2h-9z M834 785h5v2h-5z M869 791h12v2h-12z M916 783h3v2h-3z" />
      </g>}
    </svg>
  );
}
