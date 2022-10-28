import { OVERLAY_PADDING } from "../common/constants";
import {
  createSvgCutout,
  CutoutDefinition,
  generateSvgCutoutPathString,
} from "./cutout";
import HighlightElement from "./highlight-element";

interface OverlayOptions {
  padding: number;
  onReset?: (element: HighlightElement) => void;
  animate?: boolean;
}

/**
 * Responsible for overlay creation and manipulation i.e.
 * cutting out the visible part, animating between the sections etc
 */
class Overlay {
  private options: OverlayOptions;
  private cutoutSVGElement?: SVGSVGElement;

  public lastActiveHighlightElement?: HighlightElement; // TODO: needed for what?

  constructor(options: Partial<OverlayOptions>) {
    this.options = {
      padding: OVERLAY_PADDING,
      ...options,
    };
  }

  private mountCutoutElement(cutoutDefinition: CutoutDefinition) {
    if (this.cutoutSVGElement) {
      throw new Error("Already mounted SVG");
    }
    const newSvgElement = createSvgCutout(cutoutDefinition);
    this.cutoutSVGElement = newSvgElement;
    document.body.appendChild(newSvgElement);
  }

  public unmountCutoutElement() {
    if (!this.cutoutSVGElement) {
      throw new Error("No SVG found to unmount");
    }
    // rm lastActiveElementRef
    this.lastActiveHighlightElement = undefined;
    // rm from body
    document.body.removeChild(this.cutoutSVGElement);
    // rm from memory
    this.cutoutSVGElement = undefined;
  }

  public updateCutout(highlightElement: HighlightElement) {
    // update lastActiveElement to new element provided
    this.lastActiveHighlightElement = highlightElement;

    const boundingClientRect = highlightElement
      .getDomElement()
      .getBoundingClientRect();

    const cutoutBoxSettings: CutoutDefinition = {
      hightlightBox: {
        x: boundingClientRect.x,
        y: boundingClientRect.y,
        width: boundingClientRect.width,
        height: boundingClientRect.height,
      },
      padding: this.options.padding,
    };

    // mount svg if its not mounted already
    if (!this.cutoutSVGElement) {
      this.mountCutoutElement(cutoutBoxSettings);
    } else {
      // otherwise update existing SVG path
      const pathElement = this.cutoutSVGElement.firstElementChild;

      if (pathElement?.tagName === "path") {
        pathElement.setAttribute(
          "d",
          generateSvgCutoutPathString(cutoutBoxSettings)
        );
      } else {
        throw new Error("No existing path found on SVG but we want one :(");
      }
    }
  }

  // /**
  //  * Prepares the overlay
  //  */
  // private attachNode() {
  //   let pageOverlay = this.document.getElementById(ID_OVERLAY);
  //   if (!pageOverlay) {
  //     pageOverlay = OVERLAY_ELEMENT();
  //     document.body.appendChild(pageOverlay);
  //   }

  //   this.node = pageOverlay;
  //   this.node.style.opacity = "0";

  //   if (!this.options.animate) {
  //     // For non-animation cases remove the overlay because we achieve this overlay by having
  //     // a higher box-shadow on the stage. Why are we doing it that way? Because the stage that
  //     // is shown "behind" the highlighted element to make it pop out of the screen, it introduces
  //     // some stacking contexts issues. To avoid those issues we just make the stage background
  //     // transparent and achieve the overlay using the shadow so to make the element below it visible
  //     // through the stage even if there are stacking issues.
  //     if (this.node.parentElement) {
  //       this.node.parentElement.removeChild(this.node);
  //     }
  //   }
  // }

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
    if (element.isSame(this.lastActiveHighlightElement)) {
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
      this.lastActiveHighlightElement &&
      !element.isSame(this.lastActiveHighlightElement)
    ) {
      this.lastActiveHighlightElement.onDeselected();
    }

    // TODO: still needed
    // // get the position of element around which we need to draw
    // const position = element.getCalculatedPosition();
    // if (!position.canHighlight()) {
    //   return;
    // }

    // this.lastHighlightedElement = this.highlightedElement; // TODO: what was the difference between the two?

    this.updateCutout(element);

    // Element has been highlighted
    element.onHighlighted();

    this.lastActiveHighlightElement = element;
  }

  // /**
  //  * Returns the currently selected element
  //  * @returns {null|*}
  //  * @public
  //  */
  // getHighlightedElement() {
  //   return this.highlightedElement;
  // }

  // /**
  //  * Gets the element that was highlighted before current element
  //  * @returns {null|*}
  //  * @public
  //  */
  // getLastHighlightedElement() {
  //   return this.lastHighlightedElement;
  // }

  /**
   * Removes the overlay and cancel any listeners
   * @public
   */
  clear(immediate = false) {
    // Callback for when overlay is about to be reset
    if (this.lastActiveHighlightElement) {
      this.options.onReset?.(this.lastActiveHighlightElement);
    }

    // Deselect the highlighted element if any
    this.lastActiveHighlightElement?.onDeselected();

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
    if (!this.lastActiveHighlightElement) {
      return;
    }
    this.updateCutout(this.lastActiveHighlightElement);
  }
}

export default Overlay;
