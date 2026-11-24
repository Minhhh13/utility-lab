import { useEffect, useId, useRef, useState } from "react";
import { Check, Copy, Link2, LoaderCircle, Share2, X } from "lucide-react";
import { objectLabel, type TacticFile } from "./board-model";
import { MAPS } from "./maps";
import { decodeTacticShareCode, encodeTacticShareCode, MAX_SHARE_CODE_LENGTH, tacticShareUrl } from "./share-code";
import BoardObjectDrawing from "./BoardObjectDrawing";
import "./tactic-share.css";

export type TacticShareDialogProps = {
  file?: TacticFile;
  initialCode?: string;
  onEditCopy: (file: TacticFile) => void;
  onClose: () => void;
  onNotify: (message: string) => void;
};

export default function TacticShareDialog({ file, initialCode = "", onEditCopy, onClose, onNotify }: TacticShareDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const codeField = useRef<HTMLTextAreaElement>(null);
  const operation = useRef(0);
  const [mode, setMode] = useState<"share" | "open">(initialCode || !file ? "open" : "share");
  const [code, setCode] = useState("");
  const [input, setInput] = useState(initialCode);
  const [preview, setPreview] = useState<TacticFile | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [compatibility, setCompatibility] = useState(false);
  const titleId = useId();

  useEffect(() => { dialog.current?.showModal(); return () => { operation.current++; }; }, []);
  useEffect(() => {
    if (mode !== "share" || !file) return;
    const request = ++operation.current;
    setBusy(true); setError(""); setCode(""); setCopied("");
    void encodeTacticShareCode(file, !compatibility).then(value => {
      if (operation.current === request) setCode(value);
    }).catch(reason => {
      if (operation.current === request) setError(reason instanceof Error ? reason.message : "Could not create this share code.");
    }).finally(() => { if (operation.current === request) setBusy(false); });
  }, [file, mode, compatibility]);
  useEffect(() => { if (initialCode) void openCode(initialCode); }, [initialCode]);

  async function openCode(value = input) {
    const request = ++operation.current;
    setBusy(true); setError(""); setPreview(null);
    try {
      const result = await decodeTacticShareCode(value);
      if (request === operation.current) setPreview(result);
    } catch (reason) {
      if (request === operation.current) setError(reason instanceof Error ? reason.message : "Could not open this share code.");
    } finally { if (request === operation.current) setBusy(false); }
  }
  function switchMode(next: "share" | "open") {
    operation.current++; setBusy(false); setError(""); setCopied(""); setMode(next);
  }
  async function copy(value: string, label: string) {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(value); setCopied(label); onNotify(`${label} copied.`);
    } catch {
      codeField.current?.focus(); codeField.current?.select();
      setError("Clipboard access is unavailable. The code is selected; copy it with your device’s Copy command.");
    }
  }
  const map = MAPS.find(item => item.id === preview?.plan.mapId);
  const level = map?.levels.find(item => item.id === preview?.plan.levelId);
  const originalImage = level?.image || "";
  const previewImage = preview?.mapImage || (document.documentElement.dataset.theme === "light" && originalImage.endsWith(".svg") ? originalImage.replace(".svg", "-light.svg") : originalImage);

  return <dialog ref={dialog} className="tactic-share-dialog" onClose={onClose} aria-labelledby={titleId}>
    <header className="ts-heading">
      <div><h2 id={titleId}>{mode === "share" ? "Share this tactic" : preview ? "Shared tactic preview" : "Open a share code"}</h2><p>{mode === "share" ? "Send a complete copy to a friend’s Utility Lab." : "Preview safely, then choose whether to edit a copy."}</p></div>
      <button className="icon-button" aria-label="Close tactic sharing" onClick={() => dialog.current?.close()}><X size={21} /></button>
    </header>
    {file && <nav className="ts-tabs" aria-label="Tactic sharing">
      <button aria-pressed={mode === "share"} onClick={() => switchMode("share")}><Share2 size={16} />Create code</button>
      <button aria-pressed={mode === "open"} onClick={() => switchMode("open")}><Link2 size={16} />Open code</button>
    </nav>}
    <div className="ts-content">
      {mode === "share" ? <>
        <div className="ts-summary"><strong>{file?.plan.name}</strong><span>{MAPS.find(item => item.id === file?.plan.mapId)?.name} · {file?.plan.side} · {file?.plan.objects.length} objects{file?.mapImage ? " · custom radar included" : ""}</span></div>
        <label className="ts-label" htmlFor={`${titleId}-code`}>Portable share code</label>
        <textarea ref={codeField} id={`${titleId}-code`} className="ts-code" readOnly value={code} placeholder={busy ? "Creating code…" : ""} spellCheck={false} />
        <div className="ts-actions"><button className="ts-button ts-primary" disabled={busy || !code} onClick={() => void copy(code, "Share code")}>{copied === "Share code" ? <Check size={16} /> : <Copy size={16} />}Copy code</button><button className="ts-button" disabled={busy || !code || code.length > 24_000} onClick={() => void copy(tacticShareUrl(code, location.href), "Share link")}>{copied === "Share link" ? <Check size={16} /> : <Link2 size={16} />}Copy link</button></div>
        {code.length > 24_000 && <p className="ts-note">This tactic is too large for a reliable link. Send the full code or export its JSON file.</p>}
        <label className="ts-check"><input type="checkbox" checked={compatibility} onChange={event => setCompatibility(event.target.checked)} />Compatibility code (larger, for older browsers)</label>
        <p className="ts-note">The link opens a copy of this board and its notes at {location.host}. You can also paste the code into Open code in any Utility Lab workspace.</p>
      </> : <>
        <form onSubmit={event => { event.preventDefault(); void openCode(); }}>
          <label className="ts-label" htmlFor={`${titleId}-input`}>Utility Lab code or share link</label>
          <textarea autoFocus={!initialCode} id={`${titleId}-input`} className="ts-code" value={input} onChange={event => { setInput(event.target.value); setError(""); setPreview(null); }} maxLength={MAX_SHARE_CODE_LENGTH + 4096} placeholder="UL1.…" spellCheck={false} />
          <button className="ts-button ts-primary" disabled={busy || !input.trim()} type="submit">{busy ? <LoaderCircle className="ts-loading" size={16} /> : <Link2 size={16} />}Preview tactic</button>
        </form>
        {preview && <section className="ts-preview" aria-label="Read-only shared tactic preview">
          <div className="ts-preview-title"><div><h3>{preview.plan.name}</h3><p>{map?.name} · {level?.name} · {preview.plan.side} side · {preview.plan.objects.length} objects</p></div><span>Read only</span></div>
          <svg className="ts-preview-map" viewBox="0 0 1000 1000" role="img" aria-label={`${map?.name} ${level?.name} shared tactic, ${preview.plan.objects.length} objects`}><rect width={1000} height={1000} fill="var(--canvas)" /><image href={previewImage} width={1000} height={1000} preserveAspectRatio="xMidYMid meet" />{preview.plan.objects.map(object => <BoardObjectDrawing key={object.id} object={object} />)}</svg>
          {map?.credit && <p className="ts-map-credit">{map.credit.includes("setpos.gg") ? <a href="https://setpos.gg" target="_blank" rel="noreferrer">Minimaps by setpos.gg</a> : map.credit}</p>}
          {preview.plan.illustrative && <p className="ts-note">This tactic includes illustrative example placements.</p>}
          {preview.plan.notes && <div className="ts-preview-notes"><h4>Round notes</h4><p>{preview.plan.notes}</p></div>}
          <details><summary>Objects ({preview.plan.objects.length})</summary><ul>{preview.plan.objects.map(object => <li key={object.id}>{objectLabel(object)}</li>)}</ul></details>
          <p className="ts-note">Your existing board stays untouched while you preview. Edit a copy opens this map and floor; Undo restores its previous board.</p>
          <button className="ts-button ts-primary" onClick={() => { onEditCopy(preview); dialog.current?.close(); }}>Edit a copy</button>
        </section>}
      </>}
      {error && <p className="ts-error" role="alert">{error}</p>}
      {busy && mode === "share" && <p className="ts-note" role="status">Creating a portable code…</p>}
    </div>
  </dialog>;
}
