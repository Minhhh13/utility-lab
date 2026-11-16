import type {MapFrame} from './board-navigation';

/** Leave Fit breathing room in map coordinates, not in a clipped CSS viewport.
 * Keeping it independent of screen size also preserves the manual camera when
 * the header or aspect frame changes. Artwork and pins keep their source units. */
export function lineupMapFrame(bounds:MapFrame):MapFrame {
  const x=bounds.width*.1;
  // Extra headroom keeps upper map pins below the context dock at Fit, even
  // in a short window. This is framing space, never a clipped input inset.
  const top=bounds.height*.2;
  const bottom=bounds.height*.1;
  return {x:bounds.x-x,y:bounds.y-top,width:bounds.width+2*x,height:bounds.height+top+bottom};
}
