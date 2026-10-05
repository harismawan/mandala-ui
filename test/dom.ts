// jsdom globals for component tests. Loaded through the bunfig [test] preload: Bun links CommonJS imports
// (react-dom) before an ES module's own imports run, so react-dom must see `window` before any test file is
// evaluated or it falls back to its IE-era change-event path. Only names Bun does not already define are added
// (fetch, URL, crypto and friends stay Bun's); the api suites are unaffected because nothing in them reads the DOM.
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost/",
  pretendToBeVisual: true,
});
const win = dom.window as unknown as Record<string, unknown>;
for (const key of Object.getOwnPropertyNames(win)) {
  if (key in globalThis) continue;
  Object.defineProperty(globalThis, key, { value: win[key], configurable: true, writable: true });
}
for (const key of ["window", "document"])
  Object.defineProperty(globalThis, key, { value: win[key], configurable: true, writable: true });
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// jsdom has neither <dialog> modal methods nor the Popover API; the components only need open state + events.
const W = dom.window;
const dialogProto = W.HTMLDialogElement.prototype as unknown as Record<string, unknown>;
if (!dialogProto.showModal) {
  dialogProto.showModal = function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  dialogProto.close = function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new W.Event("close"));
  };
}
const elProto = W.HTMLElement.prototype as unknown as Record<string, unknown>;
if (!elProto.showPopover) {
  const fire = (el: HTMLElement, open: boolean) => {
    el.toggleAttribute("data-open", open);
    el.style.display = open ? "block" : ""; // jsdom's UA sheet hides [popover] and knows no :popover-open
    const e = new W.Event("toggle");
    Object.assign(e, { newState: open ? "open" : "closed" });
    el.dispatchEvent(e);
  };
  elProto.showPopover = function (this: HTMLElement) {
    fire(this, true);
  };
  elProto.hidePopover = function (this: HTMLElement) {
    fire(this, false);
  };
}
if (!elProto.scrollIntoView) elProto.scrollIntoView = () => undefined;
