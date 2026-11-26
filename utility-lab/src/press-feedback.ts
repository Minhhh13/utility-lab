// Use the clicked control itself so SVG pins, top-layer dialogs and newly
// mounted tools all get feedback without overlays or changes to their hit area.
const actionSelector = [
  "button", "summary", "a[href]", "select", '[role="button"]', '[role="tab"]',
  '[role="option"]', '[role="menuitem"]', '[role="switch"]',
  'input:is([type="button"],[type="submit"],[type="checkbox"],[type="radio"])',
  "label",
].join(",");

export function installPressFeedback() {
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let active: Animation | undefined;

  function cancel() {
    active?.cancel();
    active = undefined;
  }

  function release(event: MouseEvent) {
    // Native keyboard activation and assistive technology clicks have no pointer
    // click count. A keyboard action should take effect immediately.
    if (!event.detail || event.button !== 0 || reducedMotion.matches || document.hidden) return;
    if (!(event.target instanceof Element)) return;
    let target = event.target.closest(actionSelector);
    if (!target || target.closest(':disabled,[aria-disabled="true"],[inert]')) return;
    if (target instanceof HTMLInputElement) target = target.labels?.[0] ?? target;
    if (target instanceof HTMLLabelElement && !target.control?.matches('input:is([type="radio"],[type="checkbox"],[type="file"]):enabled')) return;

    cancel();
    // An empty end keyframe restores the underlying opacity, including a
    // persistent selected/disabled state the action may just have changed.
    const animation = target.animate([{ opacity: .66 }, {}], {
      duration: 180, easing: "cubic-bezier(.23,1,.32,1)", id: "control-press",
    });
    active = animation;
    animation.onfinish = () => {
      if (active === animation) active = undefined;
    };
  }

  document.addEventListener("click", release, true);
  document.addEventListener("keydown", cancel, true);
  document.addEventListener("visibilitychange", cancel);
  reducedMotion.addEventListener("change", cancel);
  return () => {
    cancel();
    document.removeEventListener("click", release, true);
    document.removeEventListener("keydown", cancel, true);
    document.removeEventListener("visibilitychange", cancel);
    reducedMotion.removeEventListener("change", cancel);
  };
}
