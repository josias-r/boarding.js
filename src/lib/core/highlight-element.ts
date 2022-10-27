import { ANIMATION_DURATION_MS } from "../common/constants";
import Overlay from "./overlay";
import Popover, { Position } from "./popover";

export interface HighlightElementOptions {
  onDeselected?: (element: HighlightElement) => void;
  onNext?: (element: HighlightElement) => void;
  onPrevious?: (element: HighlightElement) => void;
  onHighlightStarted?: (element: HighlightElement) => void;
  onHighlighted?: (element: HighlightElement) => void;
  scrollIntoViewOptions?: ScrollIntoViewOptions | null;
  animate?: boolean;
}

/**
 * Wrapper around DOMElements to enrich them
 * with the functionality necessary
 */
class HighlightElement {
  public highlightDomElement: HTMLElement;

  public options: HighlightElementOptions;
  public popover: Popover | null;

  private overlay: Overlay;

  private animationTimeout?: number;
  constructor({
    highlightDomElement,
    options,
    popover,
    overlay,
  }: {
    highlightDomElement: HTMLElement;
    options: HighlightElementOptions;
    popover: Popover | null;
    overlay: Overlay;
  }) {
    this.highlightDomElement = highlightDomElement;
    this.options = options;
    this.overlay = overlay;
    this.popover = popover;
  }

  /**
   * Checks if the current element is visible in viewport
   */
  public isInView(): boolean {
    return true;
    // TODO: create bringInView helper

    // let top = this.node.offsetTop;
    // let left = this.node.offsetLeft;
    // const width = this.node.offsetWidth;
    // const height = this.node.offsetHeight;

    // let el: HTMLElement = this.node;

    // while (el.offsetParent) {
    //   el = el.offsetParent as HTMLElement | null;
    //   top += el.offsetTop;
    //   left += el.offsetLeft;
    // }

    // return (
    //   top >= this.window.scrollY &&
    //   left >= this.window.scrollX &&
    //   top + height <= this.window.scrollY + this.window.innerHeight &&
    //   left + width <= this.window.scrollX + this.window.innerWidth
    // );
  }

  /**
   * Brings the element to middle of the view port if not in view
   */
  public bringInView() {
    // If the highlightDomElement is not there or already is in view
    if (!this.highlightDomElement || this.isInView()) {
      return;
    }

    try {
      this.highlightDomElement.scrollIntoView(
        this.options.scrollIntoViewOptions || {
          behavior: "auto",
          block: "center",
        }
      );
    } catch (e) {
      // TODO check if this is still a valid concern
      // // `block` option is not allowed in older versions of firefox, scroll manually
      // this.scrollManually();
    }
  }

  /**
   * Gets the calculated position on screen, around which
   * we need to draw
   */
  public getCalculatedPosition(): Position {
    const body = document.body;
    const documentElement = document.documentElement;

    const scrollTop =
      window.scrollY || documentElement.scrollTop || body.scrollTop;
    const scrollLeft =
      window.scrollX || documentElement.scrollLeft || body.scrollLeft;
    const elementRect = this.highlightDomElement.getBoundingClientRect();

    // TODO: use element rect only
    return {
      top: elementRect.top + scrollTop,
      left: elementRect.left + scrollLeft,
      right: elementRect.left + scrollLeft + elementRect.width,
      bottom: elementRect.top + scrollTop + elementRect.height,
    };
  }

  /**
   * Gets the popover for the current element if any
   */
  public getPopover() {
    return this.popover;
  }

  /**
   * Is called when element is about to be deselected
   * i.e. when moving the focus to next element of closing
   */
  public onDeselected() {
    this.hidePopover();

    // this.removeHighlightClasses();

    // If there was any animation in progress, cancel that
    window.clearTimeout(this.animationTimeout);

    if (this.options.onDeselected) {
      this.options.onDeselected(this);
    }
  }

  /**
   * Checks if the given element is same as the current element
   */
  public isSame(element?: HighlightElement | null) {
    if (!element || !element.highlightDomElement) {
      return false;
    }

    return element.highlightDomElement === this.highlightDomElement;
  }

  /**
   * Is called when the element is about to be highlighted
   */
  public onHighlightStarted() {
    this.options.onHighlightStarted?.(this);
  }

  /**
   * Is called when the element has been successfully highlighted
   */
  public onHighlighted() {
    const highlightedElement = this;
    if (!highlightedElement.isInView()) {
      highlightedElement.bringInView();
    }

    // Show the popover once the item has been
    // brought in the view, this would allow us to handle
    // the cases where the container has scroll overflow
    this.showPopover();

    this.options.onHighlighted?.(this);
  }

  /**
   * Gets the DOM Element behind that this class resolves around
   */
  public getDomElement() {
    return this.highlightDomElement;
  }

  /**
   * Hides the popover if possible
   */
  public hidePopover() {
    if (!this.popover) {
      return;
    }

    this.popover.hide();
  }

  /**
   * Shows the popover on the current element
   */
  public showPopover() {
    if (!this.popover) {
      return;
    }

    const showAtPosition = this.getCalculatedPosition();

    // For first highlight, show it immediately because there won't be any animation
    let showAfterMs = ANIMATION_DURATION_MS;
    // If animation is disabled or  if it is the first display, show it immediately
    if (!this.options.animate || !this.overlay.lastActiveHighlightElement) {
      showAfterMs = 0;
    }

    // TODO: remove timeout and handle with CSS
    this.animationTimeout = window.setTimeout(() => {
      this.popover?.show(showAtPosition);
    }, showAfterMs);
  }
}

export default HighlightElement;
