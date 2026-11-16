import type { CSSProperties } from "react";
import "./brand-mark.css";

type BrandMarkProps = {
  size?: number;
  className?: string;
};

/** The original route symbol, kept on its 48-unit optical grid.
 * Its surrounding brand button/wordmark supplies the accessible name.
 */
export default function BrandMark({
  size = 34,
  className = "",
}: BrandMarkProps) {
  const dimensions = {
    "--ul-brand-size": `${Number.isFinite(size) ? Math.max(16, size) : 34}px`,
  } as CSSProperties;
  return (
    <span
      className={`ul-brand-mark ${className}`.trim()}
      style={dimensions}
      aria-hidden="true"
    >
      <svg
        className="ul-brand-mark__symbol"
        viewBox="0 0 48 48"
        fill="none"
        focusable="false"
      >
        <g data-brand-symbol="route" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="m21.53 12.97-8.56 8.56M14 24h20m1.03 2.47-8.79 8.79" />
          <circle cx="24" cy="10.5" r="3.5" />
          <circle cx="10.5" cy="24" r="3.5" />
          <circle cx="37.5" cy="24" r="3.5" />
          <rect x="21.1" y="34.6" width="5.8" height="5.8" rx="1.5" transform="rotate(45 24 37.5)" fill="currentColor" stroke="none" />
        </g>
      </svg>
    </span>
  );
}
