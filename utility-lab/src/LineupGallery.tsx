import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import PhotoZoom from "./PhotoZoom";
import LineupStandingMap from "./LineupStandingMap";
import { photoStepName } from "./lineup-copy";
import { preloadPhoto } from "./photo-preload";
import type { GalleryStep } from "./lineup-walkthrough";
import type { UtilityPhoto, UtilityReference } from "./utility-data";

function PhotoCredit({ photo, magnifyAim }: { photo: UtilityPhoto; magnifyAim?: boolean }) {
  if (!(magnifyAim || photo.creator || photo.source || photo.license || photo.capturedAt || photo.gameBuild)) return null;
  return <div className="ul-photo-credit">
    {magnifyAim && <span>2.5× aim crop</span>}
    {photo.region && <span>Source panel</span>}
    {photo.creator && <span>Photo: {photo.creator}</span>}
    {photo.source && <a href={photo.source} target="_blank" rel="noreferrer">Photo source</a>}
    {photo.license && (photo.licenseUrl
      ? <a href={photo.licenseUrl} target="_blank" rel="noreferrer">{photo.license}</a>
      : <span>{photo.license}</span>)}
    {photo.gameBuild && <span>CS2 build {photo.gameBuild}</span>}
    {photo.capturedAt && <span>Captured {photo.capturedAt}</span>}
  </div>;
}

export default function LineupGallery({ record, steps, stepIndex, viewIndex, select, advance, formats, sourceVideo, guideMap }: {
  record: UtilityReference; steps: GalleryStep[]; stepIndex: number; viewIndex: number;
  select: (step: number, view?: number) => void; advance: (direction: number) => void;
  formats: ReactNode; sourceVideo: ReactNode;
  guideMap: ReactNode;
}) {
  const step = steps[stepIndex];
  const view = step.views[viewIndex];
  const photo = view.photo;
  const first = stepIndex === 0 && viewIndex === 0;
  const label = step.stage === "setup" || step.stage === "detail" ? step.name : photo ? photoStepName(photo.kind, stepIndex, photo.caption) : step.label;
  const caption = photo ? (first && !record.userCreated && (photo.kind === "position" || /^Position & aim/i.test(photo.caption))
    ? record.steps[0] || photo.caption : view.caption || photo.caption)
    : step.stage === "setup" ? "See the standing setup in the original guide video." : "See the landing in the original guide video.";
  const toolbar = <div className="ul-photo-toolbar ul-photo-toolbar-compact">{formats}</div>;
  const image = photo && <PhotoZoom key={`${stepIndex}:${viewIndex}:${photo.image}`} formats={formats} photo={photo} magnifyAim={view.magnifyAim}
    title={`${record.title}, ${step.name}`} onSwipe={steps.length > 1 ? advance : undefined} onReady={() => {
      const next = steps[(stepIndex + 1) % steps.length].views[0];
      if (next.photo && !next.standingMap && next.photo.image !== photo.image) preloadPhoto(next.photo.image);
    }}/>;
  return <div className="ul-photo-viewer" aria-label="Lineup photo slides" data-stage={step.stage}>
    <div className="ul-photo-stage">
      {view.standingMap
        ? <LineupStandingMap record={record} fallback={image}>{toolbar}</LineupStandingMap>
        : photo ? image : <>{toolbar}<div className="ul-stage-video">{sourceVideo}</div></>}
      {steps.length > 1 && <>
        <button className="ul-slide-prev" aria-label="Previous photo" aria-keyshortcuts="A" title="Previous photo (A)" onClick={() => advance(-1)}>
          <ChevronLeft size={20}/><kbd aria-hidden="true">A</kbd>
        </button>
        <button className="ul-slide-next" aria-label="Next photo" aria-keyshortcuts="D" title="Next photo (D)" onClick={() => advance(1)}>
          <ChevronRight size={20}/><kbd aria-hidden="true">D</kbd>
        </button>
      </>}
    </div>
    <div className="ul-gallery-guide">
      <div className="ul-photo-details has-map-link">
        <div className="ul-photo-caption" aria-live="polite">
          <span>{stepIndex + 1} / {steps.length}</span>
          <div><strong className="ul-photo-kind">{label}</strong><p>{caption}</p></div>
        </div>
        {photo && <PhotoCredit photo={photo} magnifyAim={view.magnifyAim}/>}
        {guideMap}
      </div>
      {step.views.length > 1 && <div className="ul-step-views" role="group" aria-label={`${step.label} photos`}>
        {step.views.map(({ photo: p, label: viewLabel }, i) => <button key={i} aria-pressed={i === viewIndex} onClick={() => select(stepIndex, i)}>
          {viewLabel ?? (p?.kind === "release" ? "Throw" : i === 0 ? "Full view" : p?.caption === "Aim detail" ? "Aim detail" : `View ${i + 1}`)}
        </button>)}
      </div>}
      {steps.length > 1 && <div className={`ul-photo-dots${step.stage ? " ul-guide-steps" : ""}`} role="group" aria-label="Choose lineup photo">
        {steps.map((s, i) => <button key={i} className={i === stepIndex ? "is-active" : ""} aria-pressed={i === stepIndex}
          aria-label={`${s.stage ? "Step" : "Photo"} ${i + 1}: ${s.name}`} onClick={() => select(i)}>
          <span className="ul-photo-step-number">{i + 1}</span><span>{s.label}</span>
        </button>)}
      </div>}
    </div>
  </div>;
}
