import { BoardingOptions } from "../boarding-types";
import { bringInView } from "../common/utils";
import Popover, { Position } from "./popover";

export interface HighlightElementOptions
  extends Pick<BoardingOptions, "scrollIntoViewOptions"> {
  /**
   * Callback to be called when element is about to be highlighted
   */
  onHighlightStarted?: (element: HighlightElement) => void;
  /**
   * Callback to be called when element has been highlighted
   */
  onHighlighted?: (element: HighlightElement) => void;
  /**
   * Callback to be called when element has been deselected
   */
  onDeselected?: (element: HighlightElement) => void;
  /**
   * Is called when the next element is about to be highlighted
   */
  onNext?: (element: HighlightElement) => void;
  /**
   * Is called when the previous element is about to be highlighted
   */
  onPrevious?: (element: HighlightElement) => void;
}

/**
 * Wrapper around DOMElements to enrich them
 * with the functionality necessary
 */
class HighlightElement {
  private options: HighlightElementOptions;
  private highlightDomElement: HTMLElement;
  private popover: Popover | null;

  constructor({
    options,
    highlightDomElement,
    popover,
  }: {
    options: HighlightElementOptions;
    highlightDomElement: HTMLElement;
    popover: Popover | null;
  }) {
    this.highlightDomElement = highlightDomElement;
    this.options = options;
    this.popover = popover;
  }

  /**
   * Gets the calculated position on screen, around which
   * we need to draw
   */
  public getCalculatedPosition(): Position {
    const elementRect = this.highlightDomElement.getBoundingClientRect();

    return {
      top: elementRect.top,
      left: elementRect.left,
      right: elementRect.left + elementRect.width,
      bottom: elementRect.top + elementRect.height,
    };
  }

  /**
   * Checks if the given element has the same underlying DOM element as the current one
   */
  public isSame(element?: HighlightElement | null) {
    if (!element || !element.highlightDomElement) {
      return false;
    }

    return element.highlightDomElement === this.highlightDomElement;
  }

  /**
   * Gets the DOM Element behind that this class resolves around
   */
  public getElement() {
    return this.highlightDomElement;
  }
  /**
   * Gets the popover that is connected to the element
   */
  public getPopover() {
    return this.popover;
  }

  /**
   * Is called when element is about to be deselected
   * i.e. when moving the focus to next element of closing
   */
  public onDeselected() {
    this.popover?.hide();

    // TODO: animation handling
    // // If there was any animation in progress, cancel that
    // window.clearTimeout(this.animationTimeout);

    this.options.onDeselected?.(this);
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
    bringInView(this.highlightDomElement, this.options.scrollIntoViewOptions);

    // Show the popover once the item has been
    // brought in the view, this would allow us to handle
    // the cases where the container has scroll overflow
    this.popover?.show(this);

    this.options.onHighlighted?.(this);
  }

  /**
   * Is called when the element is about to be highlighted
   */
  public onNext() {
    this.options.onNext?.(this);
  }
  /**
   * Is called when the element is about to be highlighted
   */
  public onPrevious() {
    this.options.onPrevious?.(this);
  }
}

export default HighlightElement;
