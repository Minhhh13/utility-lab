import type { BoardObject } from "./board-model.ts";
import { routeGeometry } from "./route-geometry.ts";

export type BoardRouteProps = { object: BoardObject; color: string };

/** Plain SVG keeps selection, map-space scaling, and image export identical. */
export default function BoardRoute({ object, color }: BoardRouteProps) {
  const route = routeGeometry(object.points || [{ x: object.x, y: object.y }]);
  return (
    <g data-object-id={object.id} data-object-kind="route">
      <path
        data-route-hit="true"
        d={route.hitPath}
        fill="none"
        stroke="transparent"
        strokeWidth="30"
        strokeLinecap="round"
        strokeLinejoin="round"
        pointerEvents="stroke"
      />
      {route.headPath && <>
        <path
          data-route-shaft="true"
          d={route.shaftPath}
          fill="none"
          stroke={color}
          strokeWidth={route.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          pointerEvents="none"
        />
        <path
          data-route-head="true"
          d={route.headPath}
          fill={color}
          pointerEvents="none"
        />
      </>}
    </g>
  );
}
