import { ChevronLeft, ChevronRight, MapPinned } from "lucide-react";
import type { ReactNode } from "react";
import PhotoZoom from "./PhotoZoom";
import LineupStandingMap from "./LineupStandingMap";
import { photoStepName } from "./lineup-copy";
import { preloadPhoto } from "./photo-preload";
import type { GalleryStep } from "./lineup-walkthrough";
import type { UtilityPhoto, UtilityReference } from "./utility-data";

function PhotoCredit({ photo }: { photo: UtilityPhoto }) {
  if (!(photo.creator || photo.source || photo.license || photo.capturedAt || photo.gameBuild)) return null;
  return <div className="ul-photo-credit">
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

export default function LineupGallery({ record, steps, stepIndex, viewIndex, select, advance, formats, sourceVideo, onShowThrows }: {
  record: UtilityReference; steps: GalleryStep[]; stepIndex: number; viewIndex: number;
  select: (step: number, view?: number) => void; advance: (direction: number) => void;
  formats: ReactNode; sourceVideo: ReactNode;
  onShowThrows?: () => void;
}) {
  const step = steps[stepIndex];
  const view = step.views[viewIndex];
  const photo = view.photo;
  const first = stepIndex === 0 && viewIndex === 0;
  const label = step.stage === "setup" ? step.name : photo ? photoStepName(photo.kind, stepIndex, photo.caption) : step.label;
  const caption = photo ? (first && !record.userCreated && (photo.kind === "position" || /^Position & aim/i.test(photo.caption))
    ? record.steps[0] || photo.caption : photo.caption)
    : step.stage === "setup" ? "See the standing setup in the original guide video." : "See the landing in the original guide video.";
  const toolbar = <div className="ul-photo-toolbar ul-photo-toolbar-compact">{formats}</div>;
  const image = photo && <PhotoZoom key={`${stepIndex}:${viewIndex}:${photo.image}`} formats={formats} photo={photo}
    title={`${record.title}, ${step.name}`} onSwipe={steps.length > 1 ? advance : undefined} onReady={() => {
      const next = step.views[viewIndex + 1] ?? steps[(stepIndex + 1) % steps.length].views[0];
      if (next.photo && next.photo.image !== photo.image) preloadPhoto(next.photo.image);
    }}/>;
  return <div className="ul-photo-viewer" aria-label="Lineup photo slides" data-stage={step.stage}>
    <div className="ul-photo-stage">
      {view.standingMap
        ? <LineupStandingMap record={record} fallback={image}>{toolbar}</LineupStandingMap>
        : photo ? image : <>{toolbar}<div className="ul-stage-video">{sourceVideo}</div></>}
      {steps.length > 1 && <>
        <button className="ul-slide-prev" aria-label="Previous photo" onClick={() => advance(-1)}><ChevronLeft size={24}/></button>
        <button className="ul-slide-next" aria-label="Next photo" onClick={() => advance(1)}><ChevronRight size={24}/></button>
      </>}
    </div>
    <div className="ul-gallery-guide">
      <div className={`ul-photo-details${onShowThrows ? " has-map-link" : ""}`}>
        <div className="ul-photo-caption" aria-live="polite">
          <span>{stepIndex + 1} / {steps.length}</span>
          <div><strong className="ul-photo-kind">{label}</strong><p>{caption}</p></div>
        </div>
        {photo && <PhotoCredit photo={photo}/>}
        {onShowThrows && <button type="button" className="ul-guide-map-link" onClick={onShowThrows}
          aria-label="Show throw locations on map" title="Show throw locations on map">
          <MapPinned size={17} aria-hidden="true"/><span>Throw locations</span>
        </button>}
      </div>
      {step.views.length > 1 && <div className="ul-step-views" role="group" aria-label={`${step.label} photos`}>
        {step.views.map(({ photo: p }, i) => <button key={i} aria-pressed={i === viewIndex} onClick={() => select(stepIndex, i)}>
          {p?.kind === "release" ? "Throw" : i === 0 ? "Full view" : p?.caption === "Aim detail" ? "Aim detail" : `View ${i + 1}`}
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
