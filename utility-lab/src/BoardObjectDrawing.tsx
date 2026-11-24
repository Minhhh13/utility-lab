import { penPath, type BoardObject, type ObjectKind } from "./board-model";
import BoardRoute from "./BoardRoute";
import UtilityIcon, { type UtilityKind } from "./UtilityIcon";

export const boardObjectColors: Record<ObjectKind, string> = {
  t: "var(--marker-t,#e6c986)",
  ct: "var(--marker-ct,#91b9ed)",
  route: "var(--marker-route,#a8c3ff)",
  pen: "var(--marker-pen,#edf0e9)",
  smoke: "var(--marker-smoke,#8ad6cb)",
  flash: "var(--marker-flash,#eed69a)",
  molotov: "var(--marker-molotov,#f59a83)",
  he: "var(--marker-he,#c4a7ed)",
  text: "var(--marker-text,#edf0e9)",
};

export default function BoardObjectDrawing({
  object,
}: {
  object: BoardObject;
}) {
  const color = (object.kind === "pen" || object.kind === "route") && object.color
    ? object.color : boardObjectColors[object.kind];
  if (object.kind === "pen") {
    const path = penPath(object.points || []);
    return <g data-object-id={object.id} data-object-kind="pen">
      <path d={path} fill="none" stroke="transparent" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" />
      <path d={path} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </g>;
  }
  if (object.kind === "route") return <BoardRoute object={object} color={color} />;
  if (object.kind === "text")
    return (
      <g
        data-object-id={object.id}
        transform={`translate(${object.x} ${object.y})`}
      >
        <rect
          x="-8"
          y="-24"
          width={Math.max(50, (object.label?.length || 9) * 12.6 + 16)}
          height="36"
          rx="5"
          fill="var(--canvas)"
          fillOpacity=".9"
        />
        <text
          x="0"
          y="0"
          fill={color}
          fontSize="22"
          fontFamily="Manrope, Arial, sans-serif"
          fontWeight="600"
          stroke="none"
        >
          {object.label || "New label"}
        </text>
      </g>
    );
  const isPlayer = object.kind === "t" || object.kind === "ct";
  const code =
    object.kind === "t"
      ? `T${object.number || 1}`
      : object.kind === "ct"
        ? `C${object.number || 1}`
        : (
            { smoke: "S", flash: "F", molotov: "M", he: "H" } as Record<
              string,
              string
            >
          )[object.kind];
  return (
    <g
      data-object-id={object.id}
      transform={`translate(${object.x} ${object.y})`}
    >
      <circle r="28" fill="transparent" />
      {object.kind === "ct" ? (
        <rect
          x="-19"
          y="-19"
          width="38"
          height="38"
          rx="8"
          fill={color}
          stroke="var(--canvas)"
          strokeWidth="3"
        />
      ) : object.kind === "flash" ? (
        <path
          d="M0 -25 L25 0 L0 25 L-25 0 Z"
          fill="var(--canvas)"
          stroke={color}
          strokeWidth="3"
        />
      ) : object.kind === "molotov" ? (
        <path
          d="M0 -26 L25 19 L-25 19 Z"
          fill="var(--canvas)"
          stroke={color}
          strokeWidth="3"
        />
      ) : object.kind === "he" ? (
        <path
          d="M-11 -21 L11 -21 L24 0 L11 21 L-11 21 L-24 0 Z"
          fill="var(--canvas)"
          stroke={color}
          strokeWidth="3"
        />
      ) : (
        <circle
          r={isPlayer ? 21 : 24}
          fill={isPlayer ? color : "var(--canvas)"}
          stroke={isPlayer ? "var(--canvas)" : color}
          strokeWidth="3"
          strokeDasharray={object.kind === "smoke" ? "6 3" : undefined}
        />
      )}
      {isPlayer ? (
        <text
          y={object.kind === "molotov" ? 7 : 6}
          textAnchor="middle"
          fill={isPlayer ? "var(--marker-ink,#142026)" : color}
          fontFamily="Manrope, Arial, sans-serif"
          fontSize={isPlayer ? 17 : 18}
          fontWeight="700"
          pointerEvents="none"
        >
          {code}
        </text>
      ) : (
        <UtilityIcon
          type={object.kind as UtilityKind}
          size={35}
          x={-17.5}
          y={-17.5}
          style={{ color, pointerEvents: "none" }}
        />
      )}
      {object.label && (
        <g pointerEvents="none">
          <rect
            x={-(object.label.length * 5.3 + 7)}
            y="30"
            width={object.label.length * 10.6 + 14}
            height="25"
            rx="4"
            fill="var(--canvas)"
            fillOpacity=".94"
          />
          <text
            y="48"
            textAnchor="middle"
            fill="var(--text)"
            fontSize="18"
            fontFamily="Manrope, Arial, sans-serif"
          >
            {object.label}
          </text>
        </g>
      )}
    </g>
  );
}
