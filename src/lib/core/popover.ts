import { BoardingOptions } from "../boarding-types";
import {
  CLASS_BTN_DISABLED,
  CLASS_CLOSE_ONLY_BTN,
  POPOVER_ELEMENT,
  POPOVER_OFFSET,
} from "../common/constants";
import {
  assertVarIsNotFalsy,
  bringInView,
  PartialExcept,
  PartialSome,
} from "../common/utils";
import HighlightElement from "./highlight-element";
import { OverlayOptions } from "./overlay";
import SmartPosition, { Alignments, Sides } from "./smart-position";

// TODO: move interface to other file?
export interface Position {
  right: number;
  left: number;
  bottom: number;
  top: number;
}

export interface PopoverHybridOptions {
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
   * className for the popover on element (will also add the main class scope)
   */
  className?: string;
}

export interface PopoverOptions
  extends PopoverHybridOptions,
    Pick<OverlayOptions, "padding">,
    Pick<BoardingOptions, "animate" | "scrollIntoViewOptions"> {
  /**
   * Title for the popover
   */
  title: string;
  /**
   * Description for the popover
   */
  description: string;
  /**
   * Preffered side to render the popover
   */
  prefferedSide?: Sides;
  /**
   * Alignment for the popover
   * @default "start"
   */
  alignment: Alignments;
  /**
   * Total number of elements with popovers
   * @default 0
   */
  totalCount: number;
  /**
   * Index to which highlightElement the current popover belongs to
   */
  currentIndex: number;
  /**
   * If the current popover is the first one
   */
  isFirst: boolean;
  /**
   * If the current popover is the last one
   */
  isLast: boolean;
  /**
   * Additional offset of the popover
   * @default 10
   */
  offset: number;
}

type PopoverOptionsWithoutDefaults = PartialSome<
  PopoverOptions,
  | "offset"
  | "alignment"
  | "showButtons"
  | "doneBtnText"
  | "closeBtnText"
  | "nextBtnText"
  | "startBtnText"
  | "prevBtnText"
>;

export type PopoverUserOptions = Omit<
  PartialExcept<PopoverOptions, "title" | "description">,
  "padding" | "offset"
>;

/**
 * Popover that is displayed for the highlighted element
 */
export default class Popover {
  private options: PopoverOptions;
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

  constructor({
    showButtons = true,
    offset = POPOVER_OFFSET,
    alignment = "start",
    closeBtnText = "Close",
    doneBtnText = "Done",
    startBtnText = "Next &rarr;",
    nextBtnText = "Next &rarr;",
    prevBtnText = "&larr; Previous",
    ...options
  }: PopoverOptionsWithoutDefaults) {
    this.options = {
      showButtons,
      offset,
      alignment,
      closeBtnText,
      doneBtnText,
      startBtnText,
      nextBtnText,
      prevBtnText,
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
    assertVarIsNotFalsy(this.highlightElement);
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
  }

  /**
   * Updates the position using SmartPosition
   */
  private setPosition() {
    assertVarIsNotFalsy(this.highlightElement);

    new SmartPosition(
      this.highlightElement.getElement(),
      this,
      this.options.padding,
      this.options.offset
    ).setBestPosition(this.options.alignment, this.options.prefferedSide);
  }

  /**
   * Prepares the dom element for popover
   */
  private attachNode() {
    if (this.popover) {
      this.popover.popoverWrapper.parentElement?.removeChild(
        this.popover.popoverWrapper
      );
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
}
