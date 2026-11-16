import { useEffect, useRef, useState } from "react";
import {
  Download,
  Upload,
  X,
  HardDrive,
  ShieldCheck,
  WifiOff,
} from "lucide-react";
import { MAPS } from "./maps";
import { BUNDLED_GUIDE_PHOTOS } from "./guide-library";
import {
  captureWorkspace,
  parseWorkspaceBackup,
  mergeWorkspace,
  persistWorkspace,
  MAX_WORKSPACE_BYTES,
  type WorkspaceBackup,
} from "./workspace-backup";
import { portableLineups, storeLineupMedia } from "./media-store";
import "./workspace-settings.css";
import { exportFile } from "./file-transfer";

export default function WorkspaceSettings({
  onClose,
  onRestored,
}: {
  onClose: () => void;
  onRestored: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    file = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  const [pending, setPending] = useState<WorkspaceBackup | null>(null),
    [appearance, setAppearance] = useState(false);
  const [usage, setUsage] = useState<number | null>(null),
    [persistent, setPersistent] = useState(false);
  const [offlineProgress, setOfflineProgress] = useState("");
  useEffect(() => {
    dialog.current?.showModal();
    void navigator.storage?.estimate().then((v) => setUsage(v.usage || 0));
    void navigator.storage?.persisted?.().then(setPersistent);
  }, []);
  async function exportBackup() {
    setBusy(true);
    setError("");
    try {
      const data = captureWorkspace(localStorage);
      data.lineups = await portableLineups(data.lineups);
      const blob = new Blob([JSON.stringify(data)], {
        type: "application/json",
      });
      if (blob.size > MAX_WORKSPACE_BYTES)
        throw new Error(
          "This backup is too large. Export individual playbooks or lineups instead.",
        );
      parseWorkspaceBackup(data);
      await exportFile(
        blob,
        `utility-lab-workspace-${new Date().toISOString().slice(0, 10)}.json`,
      );
      try {
        localStorage.setItem("ul:last-backup", new Date().toISOString());
      } catch {
        /* Export already contains the complete workspace. */
      }
      setMessage("Workspace backup prepared, including your uploaded photos.");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "The backup could not be exported.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function chooseBackup(selected?: File) {
    if (!selected) return;
    setBusy(true);
    setError("");
    setPending(null);
    try {
      if (selected.size > MAX_WORKSPACE_BYTES)
        throw new Error("Choose a workspace backup smaller than 256 MB.");
      setPending(parseWorkspaceBackup(JSON.parse(await selected.text())));
      setMessage("");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "This is not a readable workspace backup.",
      );
    } finally {
      setBusy(false);
      if (file.current) file.current.value = "";
    }
  }
  async function restore() {
    if (!pending) return;
    setBusy(true);
    setError("");
    try {
      const current = captureWorkspace(localStorage);
      current.lineups = await portableLineups(current.lineups);
      const next = mergeWorkspace(current, pending);
      next.lineups = await storeLineupMedia(next.lineups);
      if (appearance) next.appearance = pending.appearance;
      persistWorkspace(localStorage, next, appearance);
      window.dispatchEvent(new Event("utility-lab:workspace-changed"));
      setPending(null);
      setMessage(
        "Backup merged. Existing records and map drafts were kept; conflicting records were imported as copies.",
      );
      onRestored();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "The backup could not be restored. Your existing workspace was kept.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function keepOffline(photosOnly = false) {
    setBusy(true);
    setError("");
    try {
      const registration = await navigator.serviceWorker?.getRegistration();
      if (!registration?.active)
        throw new Error(
          "Offline installation needs the production app on localhost or HTTPS. Open the URL printed by npm start and try again. Plain HTTP phone connections can browse while the local server is running.",
        );
      const urls = photosOnly
        ? BUNDLED_GUIDE_PHOTOS
        : [
            ...new Set(
              MAPS.flatMap((map) =>
                map.levels.flatMap((level) => [
                  level.image,
                  ...(level.image.endsWith(".svg")
                    ? [level.image.replace(".svg", "-light.svg")]
                    : []),
                  (level.radarImage || level.image).replace(
                    "/maps/",
                    "/map-thumbnails/",
                  ),
                ]),
              ),
            ),
            "/art/launch-dust-cs1999.webp",
            "/art/launch-dust-source.webp",
            "/art/launch-dust-csgo.webp",
            "/art/pixel-smoke.png",
          ];
      await new Promise<void>((resolve, reject) => {
        const channel = new MessageChannel();
        const timeout = setTimeout(() => {
          channel.port1.close();
          reject(
            new Error(
              "The offline install did not finish. Check the local server and try again.",
            ),
          );
        }, 60_000);
        channel.port1.onmessage = (event) => {
          if (event.data?.done) {
            clearTimeout(timeout);
            channel.port1.close();
            event.data.error ? reject(new Error(event.data.error)) : resolve();
          } else
            setOfflineProgress(
              `${event.data.completed} of ${event.data.total} assets`,
            );
        };
        registration.active!.postMessage({ type: "CACHE_OFFLINE", urls }, [
          channel.port2,
        ]);
      });
      setOfflineProgress(
        photosOnly
          ? "All bundled photo guides are ready offline."
          : "All supported maps and launch artwork are ready offline.",
      );
      setMessage(
        "Creator videos and hosted photo posts need internet. Uploaded photos stay available locally.",
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Offline assets could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function requestPersistence() {
    try {
      const result = await navigator.storage?.persist?.();
      setPersistent(!!result);
      setMessage(
        result
          ? "The browser granted persistent storage for this workspace."
          : "The browser did not grant persistent storage. Keep an exported workspace backup.",
      );
    } catch {
      setError(
        "Persistent storage is not available here. You can still export backups.",
      );
    }
  }
  return (
    <dialog
      className="workspace-settings"
      ref={dialog}
      onClose={onClose}
      aria-labelledby="workspace-settings-title"
      onCancel={(e) => {
        if (busy) e.preventDefault();
      }}
    >
      <div className="dialog-heading">
        <div>
          <h2 id="workspace-settings-title">Your workspace</h2>
          <p>Backups, offline maps and local storage.</p>
        </div>
        <button
          className="icon-button"
          disabled={busy}
          onClick={() => dialog.current?.close()}
          aria-label="Close workspace settings"
        >
          <X size={21} />
        </button>
      </div>
      <section>
        <h3>
          <Download size={19} />
          Back up everything
        </h3>
        <p>
          Save tactics, personal lineups with photos, playbooks, starred
          references, map drafts and appearance in one portable file.
        </p>
        <div className="settings-actions">
          <button
            className="primary-button"
            disabled={busy}
            onClick={() => void exportBackup()}
          >
            <Download size={16} />
            Export workspace
          </button>
          <button
            className="secondary-button"
            disabled={busy}
            onClick={() => file.current?.click()}
          >
            <Upload size={16} />
            Import backup
          </button>
        </div>
        <input
          ref={file}
          type="file"
          accept=".json,application/json"
          hidden
          aria-label="Workspace backup file"
          onChange={(e) => void chooseBackup(e.target.files?.[0])}
        />
        {pending && (
          <div className="backup-preview">
            <h4>Import preview</h4>
            <p>
              {pending.tactics.length} tactics · {pending.lineups.length}{" "}
              personal lineups · {pending.books.length} playbooks ·{" "}
              {pending.drafts.length} map drafts
            </p>
            <p>
              Matching records are reused. Conflicts become copies. Existing map
              drafts stay in place.
            </p>
            <label>
              <input
                type="checkbox"
                checked={appearance}
                onChange={(e) => setAppearance(e.target.checked)}
              />
              Use the backup’s theme and palette
            </label>
            <div className="settings-actions">
              <button
                className="primary-button"
                disabled={busy}
                onClick={() => void restore()}
              >
                Merge backup
              </button>
              <button
                className="secondary-button"
                disabled={busy}
                onClick={() => setPending(null)}
              >
                Cancel import
              </button>
            </div>
          </div>
        )}
      </section>
      <section>
        <h3>
          <WifiOff size={19} />
          Keep maps offline
        </h3>
        <p>
          Download both map styles, every supported floor and the opening
          artwork. The board and your personal photo guides work without
          internet after installation.
        </p>
        <button
          className="secondary-button"
          disabled={busy}
          onClick={() => void keepOffline()}
        >
          Download all maps
        </button>
        {offlineProgress && <p role="status">{offlineProgress}</p>}
        <p>
          Save the bundled standing and aim photos for offline viewing.
          Source-hosted galleries and videos need internet.
        </p>
        <button
          className="secondary-button"
          disabled={busy}
          onClick={() => void keepOffline(true)}
        >
          Download photo guides
        </button>
      </section>
      <section>
        <h3>
          <HardDrive size={19} />
          On this device
        </h3>
        <p>
          {usage === null
            ? "Storage usage is reported when the browser supports it."
            : `${(usage / 1024 / 1024).toFixed(1)} MB used by this local app.`}{" "}
          {persistent
            ? "Persistent storage is enabled."
            : "Browser data can be removed by the browser or device settings."}
        </p>
        <button
          className="secondary-button"
          disabled={busy || persistent}
          onClick={() => void requestPersistence()}
        >
          <ShieldCheck size={16} />
          {persistent ? "Storage protected" : "Request persistent storage"}
        </button>
        <p>
          Your data stays in this browser. Import a backup on another device to
          move your workspace.
        </p>
      </section>
      {busy && (
        <p className="settings-status" role="status">
          Working locally…
        </p>
      )}
      {message && (
        <p className="settings-status" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="settings-error" role="alert">
          {error}
        </p>
      )}
    </dialog>
  );
}
