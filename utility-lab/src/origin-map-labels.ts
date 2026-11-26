type Point = { x: number; y: number };
type Bounds = Point & { width: number; height: number };
export type OriginMapLabel = Point & { id: string; name: string; target?: boolean; count?: boolean };

export function shortOriginLabel(name: string) {
  return name.length > 23 ? name.slice(0, 22) + "…" : name;
}

let canvas: CanvasRenderingContext2D | null;
function textWidth(name: string) {
  canvas ??= document.createElement("canvas").getContext("2d");
  if (!canvas) return name.length * 8;
  canvas.font = "600 11px Manrope, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  return canvas.measureText(name).width;
}

function overlap(a: Bounds, b: Bounds) {
  return Math.max(0, Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x))
    * Math.max(0, Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y));
}

/** Place captions in screen pixels, while the destination, standing pins and hit
 * circles retain their registered map coordinates. The destination is first. */
export function layoutOriginMapLabels(labels: OriginMapLabel[], bounds: Bounds, unit: number) {
  const placed = new Map<string, Point>();
  if (!labels.length || !(unit > 0)) return placed;
  const frame = { x: 2, y: 2, width: bounds.width/unit-4, height: bounds.height/unit-4 };
  const points = labels.map(label => ({ ...label, x: (label.x-bounds.x)/unit, y: (label.y-bounds.y)/unit }));
  const reserved: Bounds[] = [];
  for (const pin of points) {
    const r = pin.target ? 16 : 18;
    reserved.push({x:pin.x-r,y:pin.y-r,width:2*r,height:2*r});
    if (pin.count) reserved.push({x:pin.x+3,y:pin.y-22,width:20,height:20});
  }
  for (const pin of points) {
    if (pin.x<0 || pin.y<0 || pin.x>frame.width+4 || pin.y>frame.height+4) continue;
    // Includes the 3 px halo and a gap between neighbouring labels.
    const width = Math.ceil(textWidth(pin.name))+8, height = 20;
    const sign = pin.target ? 1 : -1;
    let best: Bounds | undefined, lowest = Infinity;
    // Try the adjacent sides first. More crowded groups can use another ring.
    for (let extra=0; extra<=84 && lowest>0; extra+=14) {
      const dx=width/2+20+extra, dy=height/2+20+extra;
      const cornersX=dx-7, cornersY=dy-7;
      const offsets=[[0,sign*dy],[0,-sign*dy],[dx,0],[-dx,0],
        [cornersX,sign*cornersY],[-cornersX,sign*cornersY],
        [cornersX,-sign*cornersY],[-cornersX,-sign*cornersY]];
      for (const [x,y] of offsets) {
        const box = {x:pin.x+x-width/2,y:pin.y+y-height/2,width,height};
        const clipped = Math.max(0,width*height-overlap(box,frame));
        const score = clipped*2+reserved.reduce((sum,old)=>sum+overlap(box,old),0);
        if (score < lowest) { best=box; lowest=score; }
        if (lowest<.001) { lowest=0; break; }
      }
    }
    if (!best) continue;
    reserved.push(best);
    // SVG text is positioned by its baseline, roughly 4 px below the center at 11 px.
    placed.set(pin.id,{x:bounds.x+(best.x+width/2)*unit,y:bounds.y+(best.y+height/2+4)*unit});
  }
  return placed;
}
