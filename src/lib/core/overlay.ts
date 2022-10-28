import { BoardingOptions } from "../boarding-types";
import { OVERLAY_OPACITY } from "../common/constants";
import { assertVarIsNotFalsy, PartialExcept } from "../common/utils";
import {
  createSvgCutout,
  CutoutDefinition,
  generateSvgCutoutPathString,
} from "./cutout";
import HighlightElement from "./highlight-element";

export interface OverlayOptions
  extends Pick<BoardingOptions, "animate" | "padding"> {
  /**
   * Is called when the overlay is about to reset
   */
  onReset?: (element: HighlightElement) => void;
  /**
   * Opacity for the overlay
   * @default 0.75
   */
  opacity: number;
}

/**
 * Responsible for overlay creation and manipulation i.e.
 * cutting out the visible part, animating between the sections etc
 */
class Overlay {
  private options: OverlayOptions;
  private cutoutSVGElement?: SVGSVGElement;

  public currentHighlightedElement?: HighlightElement;
  public previouslyHighlightedElement?: HighlightElement;

  constructor(options: PartialExcept<OverlayOptions, "animate" | "padding">) {
    this.options = {
      // padding: Padding default will come from outside, as it affects more then just the overlay
      opacity: OVERLAY_OPACITY,
      ...options,
    };
  }

  /**
   * Highlights the dom element on the screen
   */
  public highlight(element: HighlightElement) {
    // if (!element || !element.node) {
    //   console.warn(
    //     "Invalid element to highlight. Must be an instance of `Element`"
    //   );
    //   return;
    // }

    // If highlighted element is not changed from last time
    if (element.isSame(this.currentHighlightedElement)) {
      return;
    }

    // TODO: implement unmount animation again
    // // There might be hide timer from last time
    // // which might be getting triggered
    // window.clearTimeout(this.hideTimer);

    // Trigger the hook for highlight started
    element.onHighlightStarted();

    // Old element has been deselected
    if (
      this.currentHighlightedElement &&
      !this.currentHighlightedElement.isSame(this.previouslyHighlightedElement)
    ) {
      this.currentHighlightedElement.onDeselected();
    }

    this.previouslyHighlightedElement = this.currentHighlightedElement;
    this.currentHighlightedElement = element;

    this.updateCutout(element);

    // Element has been highlighted
    element.onHighlighted();
  }

  /**
   * Removes the overlay and cancel any listeners
   * @param immediate immediately unmount overlay or animate out
   */
  public clear(immediate = false) {
    // Callback for when overlay is about to be reset
    if (this.currentHighlightedElement) {
      this.options.onReset?.(this.currentHighlightedElement);
    }

    // Deselect the highlighted element if any
    this.currentHighlightedElement?.onDeselected();

    // Unset highlightedElements
    this.currentHighlightedElement = undefined;
    this.previouslyHighlightedElement = undefined;

    // // Clear any existing timers and remove node
    // window.clearTimeout(this.hideTimer);

    if (this.options.animate && !immediate) {
      // this.node.style.opacity = "0";
      // this.hideTimer = this.window.setTimeout(
      //   this.removeNode,
      //   ANIMATION_DURATION_MS
      // );
      // TODO: implement unmount animation again
      this.unmountCutoutElement();
    } else {
      this.unmountCutoutElement();
    }
  }

  /**
   * Refreshes the overlay i.e. sets the size according to current window size
   * And moves the highlight around if necessary
   */
  public refresh() {
    // If no highlighted element, cancel the refresh
    if (!this.currentHighlightedElement) {
      return;
    }

    assertVarIsNotFalsy(this.cutoutSVGElement);

    // update svg viewBox
    const windowX = window.innerWidth;
    const windowY = window.innerHeight;
    this.cutoutSVGElement.setAttribute("viewBox", `0 0 ${windowX} ${windowY}`);

    this.currentHighlightedElement.getPopover()?.refresh();
    this.updateCutout(this.currentHighlightedElement, false);
  }

  /**
   * Get's the overlay SVG element - required so we can highlight it for the strict click handler
   */
  public getOverlayElement() {
    return this.cutoutSVGElement;
  }

  private mountCutoutElement(cutoutDefinition: CutoutDefinition) {
    if (this.cutoutSVGElement) {
      throw new Error("Already mounted SVG");
    }
    const newSvgElement = createSvgCutout(cutoutDefinition);
    this.cutoutSVGElement = newSvgElement;
    document.body.appendChild(newSvgElement);
  }

  private unmountCutoutElement() {
    if (!this.cutoutSVGElement) {
      throw new Error("No SVG found to unmount");
    }

    // rm from body
    document.body.removeChild(this.cutoutSVGElement);
    // rm from memory
    this.cutoutSVGElement = undefined;
  }

  private updateCutout(
    highlightElement: HighlightElement,
    animated = this.options.animate
  ) {
    // update lastActiveElement to new element provided
    this.currentHighlightedElement = highlightElement;

    const boundingClientRect = highlightElement
      .getElement()
      .getBoundingClientRect();

    const cutoutBoxSettings: CutoutDefinition = {
      hightlightBox: {
        x: boundingClientRect.x,
        y: boundingClientRect.y,
        width: boundingClientRect.width,
        height: boundingClientRect.height,
      },
      padding: this.options.padding,
      opacity: this.options.opacity,
    };

    // mount svg if its not mounted already
    if (!this.cutoutSVGElement) {
      this.mountCutoutElement(cutoutBoxSettings);
    } else {
      // otherwise update existing SVG path
      const pathElement = this.cutoutSVGElement
        .firstElementChild as SVGPathElement | null;

      if (pathElement?.tagName === "path") {
        const pathElementTransitionBak = pathElement.style.transition;
        if (!animated) {
          pathElement.style.transition = "none";
        }
        pathElement.setAttribute(
          "d",
          generateSvgCutoutPathString(cutoutBoxSettings)
        );

        if (!animated) {
          // set timeout is necessary, otherwise disabling transition would be ignored, becase it gets added in sync again (immediately)
          setTimeout(() => {
            pathElement.style.transition = pathElementTransitionBak;
          }, 0);
        }
      } else {
        throw new Error("No existing path found on SVG but we want one :(");
      }
    }
  }
}

export default Overlay;
