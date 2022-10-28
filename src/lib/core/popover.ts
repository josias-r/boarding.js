import {
  CLASS_BTN_DISABLED,
  CLASS_CLOSE_ONLY_BTN,
  CLASS_POPOVER_TIP,
  ID_POPOVER,
  POPOVER_ELEMENT,
} from "../common/constants";
import {
  assertVarIsNotFalsy,
  bringInView,
  PartialExcept,
} from "../common/utils";
import HighlightElement from "./highlight-element";

// TODO: move interface to other file?
export interface Position {
  right: number;
  left: number;
  bottom: number;
  top: number;
}

interface BoardingPopoverOptionsStrict {
  /**
   * Title for the popover
   */
  title?: string;
  /**
   * Description for the popover
   */
  description: string;
  /**
   * Whether to show control buttons or not
   * @default true
   */
  showButtons: boolean;
  /**
   * Text on the button in the final step
   * @default 'Done'
   */
  doneBtnText: string;
  /**
   * Text on the close button
   * @default 'Close'
   */
  closeBtnText: string;
  /**
   * Text on the next button
   * @default 'Next'
   */
  nextBtnText: string;
  /**
   * Text on the next button
   * @default 'Next'
   */
  startBtnText: string;
  /**
   * Text on the previous button
   * @default 'Previous'
   */
  prevBtnText: string;
  /**
   * Total number of elements with popovers
   * @default 0
   */
  totalCount: number;
  /**
   * Additional offset of the popover
   * @default 0
   */
  offset: number;
  /**
   * Counter for the current popover
   * @default 0
   */
  currentIndex: number;
  /**
   * If the current popover is the first one
   * @default true
   */
  isFirst: boolean;
  /**
   * If the current popover is the last one
   * @default true
   */
  isLast: boolean;
  /**
   * Position for the popover on element
   * @default "auto"
   */
  position?:
    | "left"
    | "left-top"
    | "left-center"
    | "left-bottom"
    | "right"
    | "right-top"
    | "right-center"
    | "right-bottom"
    | "top"
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right"
    | "mid-center"
    | "auto";
  /**
   * className for the popover on element
   */
  className?: string;
  /**
   * padding for the popover on element
   */
  padding: number;
  scrollIntoViewOptions?: ScrollIntoViewOptions;
}

export type BoardingPopoverOptions = PartialExcept<
  BoardingPopoverOptionsStrict,
  "description"
>;
export type BoardingPopoverOptionsWithDefaults = PartialExcept<
  BoardingPopoverOptionsStrict,
  "padding" | "description"
>;

/**
 * Popover that is displayed on top of the highlighted element
 */
export default class Popover {
  private options: BoardingPopoverOptionsStrict;
  private popover?: {
    popoverWrapper: HTMLDivElement;
    popoverTip: HTMLDivElement;
    popoverTitle: HTMLDivElement;
    popoverDescription: HTMLDivElement;
    popoverFooter: HTMLDivElement;
    popoverPrevBtn: HTMLButtonElement;
    popoverNextBtn: HTMLButtonElement;
    popoverCloseBtn: HTMLButtonElement;
  };
  private highlightElement?: HighlightElement;

  constructor(options: BoardingPopoverOptionsWithDefaults) {
    this.options = {
      isFirst: true,
      isLast: true,
      totalCount: 1,
      currentIndex: 0,
      offset: 0,
      showButtons: true,
      closeBtnText: "Close",
      doneBtnText: "Done",
      startBtnText: "Next &rarr;",
      nextBtnText: "Next &rarr;",
      prevBtnText: "&larr; Previous",
      ...options,
    };
  }

  /**
   * Hides the popover
   */
  public hide() {
    // If hide is called when the node isn't created yet
    if (!this.popover) {
      return;
    }

    this.highlightElement = undefined;

    this.popover.popoverWrapper.style.display = "none";
  }

  /**
   * Shows the popover at the given position
   */
  public show(highlightElement: HighlightElement) {
    this.highlightElement = highlightElement;

    this.attachNode();
    assertVarIsNotFalsy(this.popover);
    this.setInitialState();

    // Set the title and descriptions
    this.popover.popoverTitle.innerHTML = this.options.title || "";
    this.popover.popoverDescription.innerHTML = this.options.description || "";

    this.renderFooter();

    this.setPosition();

    bringInView(
      this.popover.popoverWrapper,
      this.options.scrollIntoViewOptions
    );
  }

  /**
   * Refreshes the popover position based on the highlighted element
   */
  public refresh() {
    if (!this.highlightElement) {
      return;
    }

    this.setPosition();
  }

  /**
   * Get the popover HTML Elements
   */
  public getPopoverElements() {
    return this.popover;
  }

  /**
   * Sets the default state for the popover
   */
  private setInitialState() {
    assertVarIsNotFalsy(this.popover);
    this.popover.popoverWrapper.style.display = "block";
    this.popover.popoverWrapper.style.left = "0";
    this.popover.popoverWrapper.style.top = "0";
    this.popover.popoverWrapper.style.bottom = "";
    this.popover.popoverWrapper.style.right = "";

    // TODO: check if still necessary
    // Remove the positional classes from tip
    this.popover.popoverTip.className = CLASS_POPOVER_TIP;
  }

  /**
   * Prepares the dom element for popover
   */
  private attachNode() {
    const oldPopover = document.getElementById(ID_POPOVER);
    if (oldPopover) {
      oldPopover.parentElement?.removeChild(oldPopover);
    }

    const {
      popoverWrapper,
      popoverTip,
      popoverTitle,
      popoverDescription,
      popoverFooter,
      popoverPrevBtn,
      popoverNextBtn,
      popoverCloseBtn,
    } = POPOVER_ELEMENT(this.options.className);
    document.body.appendChild(popoverWrapper);

    this.popover = {
      popoverWrapper,
      popoverTip,
      popoverTitle,
      popoverDescription,
      popoverFooter,
      popoverPrevBtn,
      popoverNextBtn,
      popoverCloseBtn,
    };
  }

  /**
   * Position the popover around the given position
   */
  private setPosition() {
    assertVarIsNotFalsy(this.highlightElement);
    const position: Position = this.highlightElement.getCalculatedPosition();
    switch (this.options.position) {
      case "left":
      case "left-top":
        this.positionOnLeft(position);
        break;
      case "left-center":
        this.positionOnLeftCenter(position);
        break;
      case "left-bottom":
        this.positionOnLeftBottom(position);
        break;
      case "right":
      case "right-top":
        this.positionOnRight(position);
        break;
      case "right-center":
        this.positionOnRightCenter(position);
        break;
      case "right-bottom":
        this.positionOnRightBottom(position);
        break;
      case "top":
      case "top-left":
        this.positionOnTop(position);
        break;
      case "top-center":
        this.positionOnTopCenter(position);
        break;
      case "top-right":
        this.positionOnTopRight(position);
        break;
      case "bottom":
      case "bottom-left":
        this.positionOnBottom(position);
        break;
      case "bottom-center":
        this.positionOnBottomCenter(position);
        break;
      case "bottom-right":
        this.positionOnBottomRight(position);
        break;
      case "mid-center":
        this.positionOnMidCenter(position);
        break;
      case "auto":
      default:
        this.autoPosition(position);
        break;
    }
  }

  /**
   * Enables, disables buttons, sets the text and
   * decides if to show them or not
   */
  private renderFooter() {
    assertVarIsNotFalsy(this.popover);
    this.popover.popoverNextBtn.innerHTML = this.options.nextBtnText;
    this.popover.popoverPrevBtn.innerHTML = this.options.prevBtnText;
    this.popover.popoverCloseBtn.innerHTML = this.options.closeBtnText;

    const hasSteps = this.options.totalCount && this.options.totalCount !== 1;

    // If there was only one item, hide the buttons
    if (!this.options.showButtons) {
      this.popover.popoverFooter.style.display = "none";
      return;
    }

    // If this is just a single highlighted element i.e. there
    // are no other steps to go to – just hide the navigation buttons
    if (!hasSteps) {
      this.popover.popoverNextBtn.style.display = "none";
      this.popover.popoverPrevBtn.style.display = "none";
      this.popover.popoverCloseBtn.classList.add(CLASS_CLOSE_ONLY_BTN);
    } else {
      // @todo modify CSS to use block
      this.popover.popoverNextBtn.style.display = "inline-block";
      this.popover.popoverPrevBtn.style.display = "inline-block";
      this.popover.popoverCloseBtn.classList.remove(CLASS_CLOSE_ONLY_BTN);
    }

    this.popover.popoverFooter.style.display = "block";
    if (this.options.isFirst) {
      this.popover.popoverPrevBtn.classList.add(CLASS_BTN_DISABLED);
      this.popover.popoverNextBtn.innerHTML = this.options.startBtnText;
    } else {
      this.popover.popoverPrevBtn.classList.remove(CLASS_BTN_DISABLED);
    }

    if (this.options.isLast) {
      this.popover.popoverNextBtn.innerHTML = this.options.doneBtnText;
    } else {
      this.popover.popoverNextBtn.innerHTML = this.options.nextBtnText;
    }
  }

  /**
   * Shows the popover on the left of the given position
   */
  private positionOnLeft(elementPosition: Position) {
    assertVarIsNotFalsy(this.popover);
    const popoverWidth = this.getSize().width;
    const popoverMargin = this.options.padding + 10; // adding 10 to give it a little distance from the element

    this.popover.popoverWrapper.style.left = `${
      elementPosition.left - popoverWidth - popoverMargin
    }px`;
    this.popover.popoverWrapper.style.top = `${
      elementPosition.top + this.options.offset - this.options.padding
    }px`;
    this.popover.popoverWrapper.style.right = "";
    this.popover.popoverWrapper.style.bottom = "";

    this.popover.popoverTip.classList.add("right");
  }

  /**
   * Shows the popover on the left of the given position
   */
  positionOnLeftBottom(elementPosition: Position) {
    assertVarIsNotFalsy(this.popover);
    const popoverDimensions = this.getSize();

    const popoverWidth = popoverDimensions.width;
    const popoverMargin = this.options.padding + 10; // adding 10 to give it a little distance from the element

    this.popover.popoverWrapper.style.left = `${
      elementPosition.left - popoverWidth - popoverMargin
    }px`;
    this.popover.popoverWrapper.style.top = `${
      elementPosition.bottom +
      this.options.padding +
      this.options.offset -
      popoverDimensions.height
    }px`;
    this.popover.popoverWrapper.style.bottom = "";
    this.popover.popoverWrapper.style.right = "";

    this.popover.popoverTip.classList.add("right", "position-bottom");
  }

  /**
   * Shows the popover on the left center of the given position
   */
  private positionOnLeftCenter(elementPosition: Position) {
    assertVarIsNotFalsy(this.popover);
    const popoverDimensions = this.getSize();

    const popoverWidth = popoverDimensions.width;
    const popoverHeight = popoverDimensions.height;
    const popoverCenter = popoverHeight / 2;

    const popoverMargin = this.options.padding + 10; // adding 10 to give it a little distance from the element
    const elementCenter = (elementPosition.bottom - elementPosition.top) / 2;
    const topCenterPosition =
      elementPosition.top - popoverCenter + elementCenter + this.options.offset;

    this.popover.popoverWrapper.style.left = `${
      elementPosition.left - popoverWidth - popoverMargin
    }px`;
    this.popover.popoverWrapper.style.top = `${topCenterPosition}px`;
    this.popover.popoverWrapper.style.right = "";
    this.popover.popoverWrapper.style.bottom = "";

    this.popover.popoverTip.classList.add("right", "position-center");
  }

  /**
   * Shows the popover on the right of the given position
   */
  private positionOnRight(elementPosition: Position) {
    assertVarIsNotFalsy(this.popover);
    const popoverMargin = this.options.padding + 10; // adding 10 to give it a little distance from the element

    this.popover.popoverWrapper.style.left = `${
      elementPosition.right + popoverMargin
    }px`;
    this.popover.popoverWrapper.style.top = `${
      elementPosition.top + this.options.offset - this.options.padding
    }px`;
    this.popover.popoverWrapper.style.right = "";
    this.popover.popoverWrapper.style.bottom = "";

    this.popover.popoverTip.classList.add("left");
  }

  /**
   * Shows the popover on the right of the given position
   */
  private positionOnRightCenter(elementPosition: Position) {
    assertVarIsNotFalsy(this.popover);
    const popoverDimensions = this.getSize();
    const popoverMargin = this.options.padding + 10; // adding 10 to give it a little distance from the element

    const popoverHeight = popoverDimensions.height;
    const popoverCenter = popoverHeight / 2;
    const elementCenter = (elementPosition.bottom - elementPosition.top) / 2;
    const topCenterPosition =
      elementPosition.top - popoverCenter + elementCenter + this.options.offset;

    this.popover.popoverWrapper.style.left = `${
      elementPosition.right + popoverMargin
    }px`;
    this.popover.popoverWrapper.style.top = `${topCenterPosition}px`;
    this.popover.popoverWrapper.style.right = "";
    this.popover.popoverWrapper.style.bottom = "";

    this.popover.popoverTip.classList.add("left", "position-center");
  }

  /**
   * Shows the popover on the right of the given position
   */
  private positionOnRightBottom(elementPosition: Position) {
    assertVarIsNotFalsy(this.popover);
    const popoverMargin = this.options.padding + 10; // adding 10 to give it a little distance from the element
    const popoverDimensions = this.getSize();

    this.popover.popoverWrapper.style.left = `${
      elementPosition.right + popoverMargin
    }px`;
    this.popover.popoverWrapper.style.top = `${
      elementPosition.bottom +
      this.options.padding +
      this.options.offset -
      popoverDimensions.height
    }px`;
    this.popover.popoverWrapper.style.bottom = "";
    this.popover.popoverWrapper.style.right = "";

    this.popover.popoverTip.classList.add("left", "position-bottom");
  }

  /**
   * Shows the popover on the top of the given position
   */
  private positionOnTop(elementPosition: Position) {
    assertVarIsNotFalsy(this.popover);
    const popoverHeight = this.getSize().height;
    const popoverMargin = this.options.padding + 10; // adding 10 to give it a little distance from the element

    this.popover.popoverWrapper.style.top = `${
      elementPosition.top - popoverHeight - popoverMargin
    }px`;
    this.popover.popoverWrapper.style.left = `${
      elementPosition.left - this.options.padding + this.options.offset
    }px`;
    this.popover.popoverWrapper.style.right = "";
    this.popover.popoverWrapper.style.bottom = "";

    this.popover.popoverTip.classList.add("bottom");
  }

  /**
   * Shows the popover on the top center of the given position
   */
  private positionOnTopCenter(elementPosition: Position) {
    assertVarIsNotFalsy(this.popover);
    const dimensions = this.getSize();
    const popoverHeight = dimensions.height;
    const popoverWidth = dimensions.width / 2;

    const popoverMargin = this.options.padding + 10; // adding 10 to give it a little distance from the element
    const nodeCenter =
      this.options.offset +
      elementPosition.left +
      (elementPosition.right - elementPosition.left) / 2;

    this.popover.popoverWrapper.style.top = `${
      elementPosition.top - popoverHeight - popoverMargin
    }px`;
    this.popover.popoverWrapper.style.left = `${
      nodeCenter - popoverWidth - this.options.padding
    }px`;
    this.popover.popoverWrapper.style.right = "";
    this.popover.popoverWrapper.style.bottom = "";

    // Add the tip at the top center
    this.popover.popoverTip.classList.add("bottom", "position-center");
  }

  /**
   * Shows the popover on the top right of the given position
   */
  private positionOnTopRight(elementPosition: Position) {
    assertVarIsNotFalsy(this.popover);
    const dimensions = this.getSize();
    const popoverHeight = dimensions.height;
    const popoverMargin = this.options.padding + 10; // adding 10 to give it a little distance from the element

    this.popover.popoverWrapper.style.top = `${
      elementPosition.top - popoverHeight - popoverMargin
    }px`;
    this.popover.popoverWrapper.style.left = `${
      elementPosition.right +
      this.options.padding +
      this.options.offset -
      dimensions.width
    }px`;
    this.popover.popoverWrapper.style.right = "";
    this.popover.popoverWrapper.style.bottom = "";

    // Add the tip at the top center
    this.popover.popoverTip.classList.add("bottom", "position-right");
  }

  /**
   * Shows the popover on the bottom of the given position
   */
  private positionOnBottom(elementPosition: Position) {
    assertVarIsNotFalsy(this.popover);
    const popoverMargin = this.options.padding + 10; // adding 10 to give it a little distance from the element

    this.popover.popoverWrapper.style.top = `${
      elementPosition.bottom + popoverMargin
    }px`;
    this.popover.popoverWrapper.style.left = `${
      elementPosition.left - this.options.padding + this.options.offset
    }px`;
    this.popover.popoverWrapper.style.right = "";
    this.popover.popoverWrapper.style.bottom = "";

    this.popover.popoverTip.classList.add("top");
  }

  /**
   * Shows the popover on the bottom-center of the given position
   */
  private positionOnBottomCenter(elementPosition: Position) {
    assertVarIsNotFalsy(this.popover);
    const popoverWidth = this.getSize().width / 2;
    const popoverMargin = this.options.padding + 10; // adding 10 to give it a little distance from the element
    const nodeCenter =
      this.options.offset +
      elementPosition.left +
      (elementPosition.right - elementPosition.left) / 2;

    this.popover.popoverWrapper.style.top = `${
      elementPosition.bottom + popoverMargin
    }px`;
    this.popover.popoverWrapper.style.left = `${
      nodeCenter - popoverWidth - this.options.padding
    }px`;
    this.popover.popoverWrapper.style.right = "";
    this.popover.popoverWrapper.style.bottom = "";

    // Add the tip at the top center
    this.popover.popoverTip.classList.add("top", "position-center");
  }

  /**
   * Shows the popover on the bottom-right of the given position
   */
  private positionOnBottomRight(elementPosition: Position) {
    assertVarIsNotFalsy(this.popover);
    const dimensions = this.getSize();
    const popoverMargin = this.options.padding + 10; // adding 10 to give it a little distance from the element

    this.popover.popoverWrapper.style.top = `${
      elementPosition.bottom + popoverMargin
    }px`;
    this.popover.popoverWrapper.style.left = `${
      elementPosition.right +
      this.options.padding +
      this.options.offset -
      dimensions.width
    }px`;
    this.popover.popoverWrapper.style.right = "";
    this.popover.popoverWrapper.style.bottom = "";

    // Add the tip at the top center
    this.popover.popoverTip.classList.add("top", "position-right");
  }

  /**
   * Shows the popover on the mid-center of the given position
   */
  private positionOnMidCenter(elementPosition: Position) {
    assertVarIsNotFalsy(this.popover);
    const popoverDimensions = this.getSize();
    const popoverHeight = popoverDimensions.height;
    const popoverWidth = popoverDimensions.width / 2;
    const popoverCenter = popoverHeight / 2;

    const elementCenter = (elementPosition.bottom - elementPosition.top) / 2;
    const topCenterPosition =
      elementPosition.top - popoverCenter + elementCenter + this.options.offset;
    const nodeCenter =
      this.options.offset +
      elementPosition.left +
      (elementPosition.right - elementPosition.left) / 2;

    this.popover.popoverWrapper.style.top = `${topCenterPosition}px`;
    this.popover.popoverWrapper.style.left = `${
      nodeCenter - popoverWidth - this.options.padding
    }px`;
    this.popover.popoverWrapper.style.right = "";
    this.popover.popoverWrapper.style.bottom = "";

    // Add the tip at the top center
    this.popover.popoverTip.classList.add("mid-center");
  }

  /**
   * Automatically positions the popover around the given position
   * such that the element and popover remain in view
   * @todo add the left and right positioning decisions
   */
  private autoPosition(elementPosition: Position) {
    assertVarIsNotFalsy(this.popover);
    const pageSize = this.getFullPageSize();
    const popoverSize = this.getSize();

    const pageHeight = pageSize.height;
    const popoverHeight = popoverSize.height;
    const popoverMargin = this.options.padding + 10; // adding 10 to give it a little distance from the element

    const pageHeightAfterPopOver =
      elementPosition.bottom + popoverHeight + popoverMargin;

    // If adding popover would go out of the window height, then show it to the top
    if (pageHeightAfterPopOver >= pageHeight) {
      this.positionOnTop(elementPosition);
    } else {
      this.positionOnBottom(elementPosition);
    }
  }

  /**
   * Gets the full page size
   */
  private getFullPageSize() {
    const body = document.body;
    const html = document.documentElement;

    return {
      height: Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.scrollHeight,
        html.offsetHeight
      ),
      width: Math.max(
        body.scrollWidth,
        body.offsetWidth,
        html.scrollWidth,
        html.offsetWidth
      ),
    };
  }

  /**
   * Gets the size for popover
   */
  private getSize() {
    assertVarIsNotFalsy(this.popover);
    return {
      height: Math.max(
        this.popover.popoverWrapper.scrollHeight,
        this.popover.popoverWrapper.offsetHeight
      ),
      width: Math.max(
        this.popover.popoverWrapper.scrollWidth,
        this.popover.popoverWrapper.offsetWidth
      ),
    };
  }
}
