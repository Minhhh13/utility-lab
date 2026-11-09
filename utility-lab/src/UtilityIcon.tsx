import type { CSSProperties } from "react";
export type UtilityKind = "smoke" | "flash" | "molotov" | "he";
type Props = {
  type: UtilityKind;
  size?: number;
  className?: string;
  x?: number;
  y?: number;
  style?: CSSProperties;
};

/** Consistent, recognizable grenade silhouettes shared by tools and map markers. */
export default function UtilityIcon({
  type,
  size = 24,
  className,
  x,
  y,
  style,
}: Props) {
  return (
    <svg
      width={size}
      height={size}
      x={x}
      y={y}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      {type === "smoke" && (
        <>
          <rect
            x="9"
            y="10"
            width="14"
            height="19"
            rx="3"
            fill="currentColor"
            fillOpacity=".14"
          />
          <path d="M12 10V6h8v4M11 6l2-3h8l3 5-4 2M9 15h14M9 24h14M13 19h6" />
          <circle cx="25" cy="5" r="2.1" />
        </>
      )}
      {type === "flash" && (
        <>
          <rect
            x="10"
            y="10"
            width="13"
            height="19"
            rx="3"
            fill="currentColor"
            fillOpacity=".14"
          />
          <path d="M13 10V6h7v4M12 6l2-3h8l3 7-3 3" />
          <circle cx="7" cy="6" r="2.2" />
          <path
            d="M9 7l4 1M14 14h1M19 14h1M14 19h1M19 19h1M14 24h1M19 24h1"
            strokeWidth="2.6"
          />
        </>
      )}
      {type === "molotov" && (
        <>
          <path
            d="M13 10h6v6l4 5v7a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2v-7l4-5z"
            fill="currentColor"
            fillOpacity=".14"
          />
          <path d="M12 10h8M13 6h6v4M10 23l12 3M15 6c-2-2-2-4 0-5 1 2 3 1 4 3 2-1 4 0 5 2-3 1-5-1-7 0" />
          <path d="M13 17h6" />
        </>
      )}
      {type === "he" && (
        <>
          <path
            d="M10 14c-3 3-4 9-2 13 2 4 14 4 16 0 2-4 1-10-2-13z"
            fill="currentColor"
            fillOpacity=".18"
          />
          <path d="M12 14V9h8v5M11 9l2-4h7l5 12M8 20h16M7 25h18M13 15l-1 13M19 15l1 13" />
          <circle cx="25" cy="6" r="3" />
        </>
      )}
    </svg>
  );
}
