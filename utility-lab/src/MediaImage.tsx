import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";
import { isStoredMedia, localPhotoSource } from "./media-store";
import { confirmPhotoLoaded, forgetCachedPhoto } from "./photo-preload";

export default function MediaImage({
  src = "",
  alt = "",
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  const [attempt, setAttempt] = useState(0);
  const identity = `${src}:${attempt}`;
  const imageRef = useRef<HTMLImageElement>(null);
  const [resource, setResource] = useState({ source: "", url: "" });
  const [status, setStatus] = useState({
    identity,
    state: "loading" as "loading" | "loaded" | "failed",
  });
  const state = status.identity === identity ? status.state : "loading";
  const stored = isStoredMedia(src);
  const resolved = stored
    ? resource.source === identity
      ? resource.url
      : ""
    : src;
  const online = /^https?:\/\//.test(src);
  useEffect(() => {
    if (!stored) return;
    let active = true,
      release = () => {};
    void localPhotoSource(src)
      .then((result) => {
        if (!active) return result.release();
        release = result.release;
        setResource({ source: identity, url: result.url });
      })
      .catch(() => {
        if (active) setStatus({ identity, state: "failed" });
      });
    return () => {
      active = false;
      release();
    };
  }, [src, stored, identity]);
  useEffect(() => {
    if (imageRef.current?.complete && imageRef.current.naturalWidth > 0) {
      confirmPhotoLoaded(src);
      setStatus({ identity, state: "loaded" });
    }
  }, [identity, resolved, src]);
  if (state === "failed")
    return (
      <div
        className="media-unavailable media-photo-error"
        role="group"
        aria-label={`${alt}. Photo unavailable.`}
      >
        <p>
          {online
            ? "Couldn’t load this photo."
            : "Photo unavailable on this device."}
        </p>
        <button type="button" onClick={() => {
          void forgetCachedPhoto(src).finally(()=>setAttempt((value) => value + 1));
        }}>
          Retry photo
        </button>
      </div>
    );
  return (
    <>
      {state === "loading" && (
        <div className="media-photo-loading" role="status">
          Loading photo…
        </div>
      )}
      {!!resolved && (
        <img
          {...props}
          ref={imageRef}
          key={identity}
          src={resolved}
          alt={alt}
          referrerPolicy="strict-origin-when-cross-origin"
          style={{ ...props.style, opacity: state === "loaded" ? 1 : 0 }}
          onLoad={(event) => {
            confirmPhotoLoaded(src);
            setStatus({ identity, state: "loaded" });
            props.onLoad?.(event);
          }}
          onError={(event) => {
            void forgetCachedPhoto(src);
            setStatus({ identity, state: "failed" });
            props.onError?.(event);
          }}
        />
      )}
    </>
  );
}
