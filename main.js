var S = Object.defineProperty;
var L = (h, t, e) => t in h ? S(h, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : h[t] = e;
var l = (h, t, e) => (L(h, typeof t != "symbol" ? t + "" : t, e), e);
const f = "boarding-popover-item", O = "boarding-clearfix", P = "boarding-btn-group", E = "boarding-popover-tip", T = "boarding-popover-title", x = "boarding-popover-description", b = "boarding-popover-footer", B = "boarding-close-btn", H = "boarding-next-btn", N = "boarding-prev-btn", _ = "boarding-navigation-btns", v = "boarding-coutout-svg", g = "boarding-disabled", u = "boarding-close-only-btn", A = (h = "") => {
  const t = document.createElement("div");
  t.id = f, t.className = h;
  const e = document.createElement("div");
  e.classList.add(E);
  const i = document.createElement("div");
  i.classList.add(T), i.innerText = "Popover Title";
  const o = document.createElement("div");
  o.classList.add(x), o.innerText = "Popover Description";
  const s = document.createElement("div");
  s.classList.add(b, O);
  const n = document.createElement("button");
  n.classList.add(B), n.innerText = "Close";
  const r = document.createElement("span");
  r.classList.add(P, _);
  const p = document.createElement("button");
  p.classList.add(N), p.innerText = "&larr; Previous";
  const a = document.createElement("button");
  return a.classList.add(H), a.innerText = "Next &rarr;", r.appendChild(p), r.appendChild(a), s.appendChild(n), s.appendChild(r), t.appendChild(e), t.appendChild(i), t.appendChild(o), t.appendChild(s), {
    popoverWrapper: t,
    popoverTip: e,
    popoverTitle: i,
    popoverDescription: o,
    popoverFooter: s,
    popoverPrevBtn: p,
    popoverNextBtn: a,
    popoverCloseBtn: n,
    popoverFooterBtnGroup: r
  };
};
function R(h) {
  if (!h || !("nodeType" in h && h.nodeType === 1 && typeof h.nodeName == "string"))
    throw new Error("Html Element expected");
}
function d(h) {
  if (!h)
    throw new Error(
      `Variable was expected to not be falsy, but isntead was: ${h}`
    );
}
function D(h) {
  const t = h.getBoundingClientRect();
  return t.top >= 0 && t.left >= 0 && t.bottom <= (window.innerHeight || document.documentElement.clientHeight) && t.right <= (window.innerWidth || document.documentElement.clientWidth);
}
function w(h, t) {
  !h || D(h) || h.scrollIntoView(t);
}
function y({
  hightlightBox: h,
  padding: t = 0
}) {
  const e = window.innerWidth, i = window.innerHeight, o = h.x - t, s = h.y - t, n = h.x + h.width + t, r = h.y + h.height + t;
  return `M${e},0L0,0L0,${i}L${e},${i}L${e},0ZM${n},${s}L${o},${s}L${o},${r}L${n},${r}L${n},${s}Z`;
}
function k({
  hightlightBox: h,
  padding: t = 0,
  fillColor: e = "rgb(0,0,0)",
  opacity: i = 1,
  animated: o = !0
}) {
  const s = window.innerWidth, n = window.innerHeight, r = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  r.classList.add(v), o && r.classList.add(`${v}-animated`), r.setAttribute("viewBox", `0 0 ${s} ${n}`), r.setAttribute("xmlSpace", "preserve"), r.setAttribute("xmlnsXlink", "http://www.w3.org/1999/xlink"), r.setAttribute("version", "version"), r.style.fillRule = "evenodd", r.style.clipRule = "evenodd", r.style.strokeLinejoin = "round", r.style.strokeMiterlimit = "2", r.style.zIndex = "10000", r.style.position = "fixed", r.style.top = "0", r.style.left = "0", r.style.right = "0", r.style.bottom = "0", r.style.pointerEvents = "none";
  const p = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  return p.setAttribute(
    "d",
    y({ hightlightBox: h, padding: t })
  ), p.style.fill = e, p.style.opacity = `${i}`, p.style.pointerEvents = "auto", p.style.cursor = "pointer", p.style.transition = "0.4s ease", r.appendChild(p), r;
}
class I {
  constructor(t) {
    l(this, "options");
    l(this, "cutoutSVGElement");
    l(this, "currentHighlightedElement");
    l(this, "previouslyHighlightedElement");
    this.options = {
      opacity: 0.75,
      ...t
    };
  }
  highlight(t) {
    t.isSame(this.currentHighlightedElement) || (t.onHighlightStarted(), this.currentHighlightedElement && !this.currentHighlightedElement.isSame(this.previouslyHighlightedElement) && this.currentHighlightedElement.onDeselected(), this.previouslyHighlightedElement = this.currentHighlightedElement, this.currentHighlightedElement = t, this.updateCutout(t), t.onHighlighted());
  }
  clear(t = !1) {
    var e, i, o;
    this.currentHighlightedElement && ((i = (e = this.options).onReset) == null || i.call(e, this.currentHighlightedElement)), (o = this.currentHighlightedElement) == null || o.onDeselected(), this.currentHighlightedElement = void 0, this.previouslyHighlightedElement = void 0, this.options.animate && !t ? this.unmountCutoutElement() : this.unmountCutoutElement();
  }
  refresh() {
    var i;
    if (!this.currentHighlightedElement)
      return;
    d(this.cutoutSVGElement);
    const t = window.innerWidth, e = window.innerHeight;
    this.cutoutSVGElement.setAttribute("viewBox", `0 0 ${t} ${e}`), (i = this.currentHighlightedElement.getPopover()) == null || i.refresh(), this.updateCutout(this.currentHighlightedElement, !1);
  }
  getOverlayElement() {
    return this.cutoutSVGElement;
  }
  mountCutoutElement(t) {
    if (this.cutoutSVGElement)
      throw new Error("Already mounted SVG");
    const e = k(t);
    this.cutoutSVGElement = e, document.body.appendChild(e);
  }
  unmountCutoutElement() {
    if (!this.cutoutSVGElement)
      throw new Error("No SVG found to unmount");
    document.body.removeChild(this.cutoutSVGElement), this.cutoutSVGElement = void 0;
  }
  updateCutout(t, e = this.options.animate) {
    this.currentHighlightedElement = t;
    const i = t.getElement().getBoundingClientRect(), o = {
      hightlightBox: {
        x: i.x,
        y: i.y,
        width: i.width,
        height: i.height
      },
      padding: this.options.padding,
      opacity: this.options.opacity,
      animated: this.options.animate
    };
    if (!this.cutoutSVGElement)
      this.mountCutoutElement(o);
    else {
      const s = this.cutoutSVGElement.firstElementChild;
      if ((s == null ? void 0 : s.tagName) === "path") {
        const n = s.style.transition;
        e || (s.style.transition = "none"), s.setAttribute(
          "d",
          y(o)
        ), e || setTimeout(() => {
          s.style.transition = n;
        }, 0);
      } else
        throw new Error("No existing path found on SVG but we want one :(");
    }
  }
}
const m = ["top", "bottom", "left", "right"];
class V {
  constructor(t, e, i, o) {
    l(this, "highlightElement");
    l(this, "popover");
    l(this, "padding");
    l(this, "finalOffset");
    this.highlightElement = t, this.popover = e, this.padding = i, this.finalOffset = i + o;
  }
  setBestPosition(t, e) {
    var s;
    const i = this.findOptimalPosition(t, e), o = (s = this.popover.getPopoverElements()) == null ? void 0 : s.popoverWrapper;
    d(o), o.style.left = typeof i.left == "number" ? `${i.left}px` : "auto", o.style.right = typeof i.right == "number" ? `${i.right}px` : "auto", o.style.top = typeof i.top == "number" ? `${i.top}px` : "auto", o.style.bottom = typeof i.bottom == "number" ? `${i.bottom}px` : "auto";
  }
  getHighlightElemRect() {
    return this.highlightElement.getBoundingClientRect();
  }
  getPopoverDimensions() {
    var e;
    const t = (e = this.popover.getPopoverElements()) == null ? void 0 : e.popoverWrapper.getBoundingClientRect();
    return d(t), {
      width: t.width + this.finalOffset,
      height: t.height + this.finalOffset
    };
  }
  checkIfSideOptimal(t) {
    const e = this.getPopoverDimensions(), i = this.getHighlightElemRect();
    switch (t) {
      case "top":
        const o = i.top - e.height;
        return {
          side: "top",
          value: o,
          isOptimal: o >= 0
        };
      case "bottom":
        const s = window.innerHeight - (i.bottom + e.height);
        return {
          side: "bottom",
          value: s,
          isOptimal: s >= 0
        };
      case "left":
        const n = i.left - e.width;
        return {
          side: "left",
          value: n,
          isOptimal: n >= 0
        };
      case "right":
        const r = window.innerWidth - (i.right + e.width);
        return {
          side: "right",
          value: r,
          isOptimal: r >= 0
        };
    }
  }
  findOptimalSide(t = 0) {
    const e = m[t], i = this.checkIfSideOptimal(e);
    return i.isOptimal ? i : t === m.length - 1 ? "none" : this.findOptimalSide(t + 1);
  }
  normalizeAlignment(t, e, i, o, s) {
    switch (t) {
      case "start":
        return Math.min(i - this.padding, o - e);
      case "end":
        return Math.min(
          i - e + s + this.padding,
          o - e
        );
      case "center":
        const n = i - e / 2 + s / 2, r = Math.min(n, o - e), p = Math.min(n, o);
        return p !== n ? p : r !== n ? r : Math.max(0, n);
    }
  }
  findOptimalPosition(t, e) {
    let i;
    if (e ? (i = this.checkIfSideOptimal(e), i.isOptimal || (i = this.findOptimalSide())) : i = this.findOptimalSide(), i === "none") {
      const o = this.getPopoverDimensions();
      return {
        left: window.innerWidth / 2 - (o.width - this.finalOffset) / 2,
        top: window.innerHeight / 2 - (o.height - this.finalOffset) / 2
      };
    } else {
      const o = this.getPopoverDimensions(), s = this.getHighlightElemRect(), n = {};
      switch (i.side) {
        case "top":
          n.top = i.value, n.left = this.normalizeAlignment(
            t,
            o.width - this.finalOffset,
            s.left,
            window.innerWidth,
            s.width
          );
          break;
        case "bottom":
          console.log(o.width - this.finalOffset), n.bottom = i.value, n.left = this.normalizeAlignment(
            t,
            o.width - this.finalOffset,
            s.left,
            window.innerWidth,
            s.width
          );
          break;
        case "left":
          n.left = i.value, n.top = this.normalizeAlignment(
            t,
            o.height - this.finalOffset,
            s.top,
            window.innerHeight,
            s.height
          );
          break;
        case "right":
          n.right = i.value, n.top = this.normalizeAlignment(
            t,
            o.height - this.finalOffset,
            s.top,
            window.innerHeight,
            s.height
          );
          break;
      }
      return this.setPopoverTipPosition(i.side, t), n;
    }
  }
  setPopoverTipPosition(t, e) {
    var o;
    const i = (o = this.popover.getPopoverElements()) == null ? void 0 : o.popoverTip;
    d(i), i.className = E, i.classList.add(
      `boarding-tipside-${t}`,
      `boarding-tipalign-${e}`
    );
  }
}
class $ {
  constructor({
    showButtons: t = !0,
    offset: e = 10,
    alignment: i = "start",
    closeBtnText: o = "Close",
    doneBtnText: s = "Done",
    startBtnText: n = "Next &rarr;",
    nextBtnText: r = "Next &rarr;",
    prevBtnText: p = "&larr; Previous",
    ...a
  }) {
    l(this, "options");
    l(this, "popover");
    l(this, "highlightElement");
    this.options = {
      showButtons: t,
      offset: e,
      alignment: i,
      closeBtnText: o,
      doneBtnText: s,
      startBtnText: n,
      nextBtnText: r,
      prevBtnText: p,
      ...a
    };
  }
  hide() {
    !this.popover || (this.highlightElement = void 0, this.popover.popoverWrapper.style.display = "none");
  }
  show(t) {
    this.highlightElement = t, this.attachNode(), d(this.popover), d(this.highlightElement), this.setInitialState(), this.popover.popoverTitle.innerHTML = this.options.title || "", this.popover.popoverDescription.innerHTML = this.options.description || "", this.renderFooter(), this.setPosition(), w(
      this.popover.popoverWrapper,
      this.options.scrollIntoViewOptions
    );
  }
  refresh() {
    !this.highlightElement || this.setPosition();
  }
  getPopoverElements() {
    return this.popover;
  }
  getShowButtons() {
    return this.options.showButtons;
  }
  setInitialState() {
    d(this.popover), this.popover.popoverWrapper.style.display = "block", this.popover.popoverWrapper.style.left = "0", this.popover.popoverWrapper.style.top = "0", this.popover.popoverWrapper.style.bottom = "", this.popover.popoverWrapper.style.right = "";
  }
  setPosition() {
    d(this.highlightElement), new V(
      this.highlightElement.getElement(),
      this,
      this.options.padding,
      this.options.offset
    ).setBestPosition(this.options.alignment, this.options.prefferedSide);
  }
  attachNode() {
    var a;
    this.popover && ((a = this.popover.popoverWrapper.parentElement) == null || a.removeChild(
      this.popover.popoverWrapper
    ));
    const {
      popoverWrapper: t,
      popoverTip: e,
      popoverTitle: i,
      popoverDescription: o,
      popoverFooter: s,
      popoverPrevBtn: n,
      popoverNextBtn: r,
      popoverCloseBtn: p
    } = A(this.options.className);
    this.options.animate && t.classList.add(`${f}-animated`), document.body.appendChild(t), this.popover = {
      popoverWrapper: t,
      popoverTip: e,
      popoverTitle: i,
      popoverDescription: o,
      popoverFooter: s,
      popoverPrevBtn: n,
      popoverNextBtn: r,
      popoverCloseBtn: p
    };
  }
  renderFooter() {
    d(this.popover), this.popover.popoverNextBtn.innerHTML = this.options.nextBtnText, this.popover.popoverPrevBtn.innerHTML = this.options.prevBtnText, this.popover.popoverCloseBtn.innerHTML = this.options.closeBtnText;
    const t = this.options.totalCount && this.options.totalCount !== 1;
    if (!this.options.showButtons) {
      this.popover.popoverFooter.style.display = "none";
      return;
    }
    t ? (this.popover.popoverNextBtn.style.display = "inline-block", this.popover.popoverPrevBtn.style.display = "inline-block", this.popover.popoverCloseBtn.classList.remove(u)) : (this.popover.popoverNextBtn.style.display = "none", this.popover.popoverPrevBtn.style.display = "none", this.popover.popoverCloseBtn.classList.add(u)), this.popover.popoverFooter.style.display = "block", this.options.isFirst ? (this.popover.popoverPrevBtn.classList.add(g), this.popover.popoverNextBtn.innerHTML = this.options.startBtnText) : this.popover.popoverPrevBtn.classList.remove(g), this.options.isLast ? this.popover.popoverNextBtn.innerHTML = this.options.doneBtnText : this.popover.popoverNextBtn.innerHTML = this.options.nextBtnText;
  }
}
class M {
  constructor({
    options: t,
    highlightDomElement: e,
    popover: i
  }) {
    l(this, "options");
    l(this, "highlightDomElement");
    l(this, "popover");
    this.highlightDomElement = e, this.options = t, this.popover = i;
  }
  isSame(t) {
    return !t || !t.highlightDomElement ? !1 : t.highlightDomElement === this.highlightDomElement;
  }
  getElement() {
    return this.highlightDomElement;
  }
  getPopover() {
    return this.popover;
  }
  onDeselected() {
    var t, e, i;
    (t = this.popover) == null || t.hide(), (i = (e = this.options).onDeselected) == null || i.call(e, this);
  }
  onHighlightStarted() {
    var t, e;
    (e = (t = this.options).onHighlightStarted) == null || e.call(t, this);
  }
  onHighlighted() {
    var t, e, i;
    w(this.highlightDomElement, this.options.scrollIntoViewOptions), (t = this.popover) == null || t.show(this), (i = (e = this.options).onHighlighted) == null || i.call(e, this);
  }
  onNext() {
    var t, e;
    (e = (t = this.options).onNext) == null || e.call(t, this);
  }
  onPrevious() {
    var t, e;
    (e = (t = this.options).onPrevious) == null || e.call(t, this);
  }
}
class F {
  constructor(t) {
    l(this, "isActivated");
    l(this, "options");
    l(this, "steps");
    l(this, "currentStep");
    l(this, "currentMovePrevented");
    l(this, "overlay");
    const {
      strictClickHandling: e = !0,
      animate: i = !0,
      opacity: o = 0.75,
      padding: s = 10,
      scrollIntoViewOptions: n = {
        behavior: "auto",
        block: "center"
      },
      allowClose: r = !0,
      keyboardControl: p = !0,
      overlayClickNext: a = !1,
      ...c
    } = { ...t };
    this.options = {
      strictClickHandling: e,
      animate: i,
      opacity: o,
      padding: s,
      scrollIntoViewOptions: n,
      allowClose: r,
      keyboardControl: p,
      overlayClickNext: a,
      ...c
    }, this.isActivated = !1, this.steps = [], this.currentStep = 0, this.currentMovePrevented = !1, this.overlay = new I({
      animate: this.options.animate,
      padding: this.options.padding,
      onReset: this.options.onReset
    }), this.onResize = this.onResize.bind(this), this.onKeyUp = this.onKeyUp.bind(this), this.onClick = this.onClick.bind(this), this.moveNext = this.moveNext.bind(this), this.movePrevious = this.movePrevious.bind(this), this.preventMove = this.preventMove.bind(this);
  }
  start(t = 0) {
    if (!this.steps || this.steps.length === 0)
      throw new Error("There are no steps defined to iterate");
    this.attachEventListeners(), this.isActivated = !0, this.currentStep = t, this.overlay.highlight(this.steps[t]);
  }
  highlight(t) {
    const e = typeof t == "object" && "element" in t ? t : { element: t }, i = this.prepareElementFromStep(e);
    !i || (this.attachEventListeners(), this.isActivated = !0, this.overlay.highlight(i));
  }
  refresh() {
    this.overlay.refresh();
  }
  movePrevious() {
    const t = this.steps[this.currentStep - 1];
    if (!t) {
      this.reset();
      return;
    }
    this.overlay.highlight(t), this.currentStep -= 1;
  }
  preventMove() {
    this.currentMovePrevented = !0;
  }
  moveNext() {
    const t = this.steps[this.currentStep + 1];
    if (!t) {
      this.reset();
      return;
    }
    this.overlay.highlight(t), this.currentStep += 1;
  }
  hasNextStep() {
    return !!this.steps[this.currentStep + 1];
  }
  hasPreviousStep() {
    return !!this.steps[this.currentStep - 1];
  }
  reset(t = !1) {
    this.currentStep = 0, this.isActivated = !1, this.overlay.clear(t), this.removeEventListeners();
  }
  hasHighlightedElement() {
    return !!this.overlay.currentHighlightedElement;
  }
  getHighlightedElement() {
    return this.overlay.currentHighlightedElement;
  }
  getLastHighlightedElement() {
    return this.overlay.previouslyHighlightedElement;
  }
  defineSteps(t) {
    this.steps = [];
    for (let e = 0; e < t.length; e++) {
      const i = this.prepareElementFromStep(
        t[e],
        t,
        e
      );
      !i || this.steps.push(i);
    }
  }
  getSteps() {
    return this.steps;
  }
  setSteps(t) {
    this.steps = t;
  }
  attachEventListeners() {
    window.addEventListener("resize", this.onResize, !1), window.addEventListener("scroll", this.onResize, !1), window.addEventListener("keyup", this.onKeyUp, !1), "ontouchstart" in document.documentElement ? window.addEventListener("touchstart", this.onClick, !1) : window.addEventListener("click", this.onClick, !1);
  }
  removeEventListeners() {
    window.removeEventListener("resize", this.onResize, !1), window.removeEventListener("scroll", this.onResize, !1), window.removeEventListener("keyup", this.onKeyUp, !1), window.removeEventListener("click", this.onClick, !1), window.removeEventListener("touchstart", this.onClick, !1);
  }
  onClick(t) {
    var p, a;
    if (!this.overlay.currentHighlightedElement)
      return;
    R(t.target);
    const e = this.overlay.currentHighlightedElement, i = e.getElement().contains(t.target), o = (p = e.getPopover()) == null ? void 0 : p.getPopoverElements(), s = o == null ? void 0 : o.popoverWrapper.contains(t.target), n = (a = this.overlay.getOverlayElement()) == null ? void 0 : a.contains(t.target), r = !s && !n && !i;
    if (this.options.strictClickHandling && r) {
      t.preventDefault(), t.stopImmediatePropagation(), t.stopPropagation();
      return;
    }
    if (n && this.options.overlayClickNext) {
      this.handleNext();
      return;
    }
    if (n && this.options.allowClose) {
      this.reset();
      return;
    }
    if (o) {
      const c = t.target.contains(o.popoverNextBtn), C = t.target.contains(o.popoverPrevBtn);
      if (t.target.contains(o.popoverCloseBtn)) {
        this.reset();
        return;
      }
      c ? this.handleNext() : C && this.handlePrevious();
    }
  }
  onResize() {
    !this.isActivated || this.refresh();
  }
  onKeyUp(t) {
    var i;
    if (!this.isActivated || !this.options.keyboardControl)
      return;
    if (t.key === "Escape" && this.options.allowClose) {
      this.reset();
      return;
    }
    const e = this.getHighlightedElement();
    !e || !e.getPopover() || !((i = e.getPopover()) != null && i.getShowButtons()) || (t.key === "ArrowRight" ? this.handleNext() : t.key === "ArrowLeft" && this.handlePrevious());
  }
  handleNext() {
    this.currentMovePrevented = !1;
    const t = this.steps[this.currentStep];
    t == null || t.onNext(), !this.currentMovePrevented && this.moveNext();
  }
  handlePrevious() {
    this.currentMovePrevented = !1;
    const t = this.steps[this.currentStep];
    t == null || t.onPrevious(), !this.currentMovePrevented && this.movePrevious();
  }
  prepareElementFromStep(t, e = [], i = 0) {
    var n;
    const o = typeof t.element == "string" ? document.querySelector(t.element) : t.element;
    if (!o)
      return console.warn(`Element to highlight ${t.element} not found`), null;
    let s = null;
    if ((n = t.popover) != null && n.title) {
      const r = [
        this.options.className,
        t.popover.className
      ].filter((p) => p).join(" ");
      s = new $({
        padding: this.options.padding,
        offset: this.options.offset,
        animate: this.options.animate,
        scrollIntoViewOptions: this.options.scrollIntoViewOptions,
        title: t.popover.title,
        description: t.popover.description,
        prefferedSide: t.popover.prefferedSide || this.options.prefferedSide,
        alignment: t.popover.alignment || this.options.alignment,
        showButtons: t.popover.showButtons || this.options.showButtons,
        doneBtnText: t.popover.doneBtnText || this.options.doneBtnText,
        closeBtnText: t.popover.closeBtnText || this.options.closeBtnText,
        nextBtnText: t.popover.nextBtnText || this.options.nextBtnText,
        startBtnText: t.popover.startBtnText || this.options.startBtnText,
        prevBtnText: t.popover.prevBtnText || this.options.prevBtnText,
        className: r,
        totalCount: e.length,
        currentIndex: i,
        isFirst: i === 0,
        isLast: e.length === 0 || i === e.length - 1
      });
    }
    return new M({
      highlightDomElement: o,
      options: {
        scrollIntoViewOptions: this.options.scrollIntoViewOptions,
        onHighlightStarted: this.options.onHighlightStarted,
        onHighlighted: this.options.onHighlighted,
        onDeselected: this.options.onDeselected,
        onNext: t.onNext,
        onPrevious: t.onPrevious
      },
      popover: s
    });
  }
}
export {
  F as Boarding
};
