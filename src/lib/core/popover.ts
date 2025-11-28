import { BoardingSharedOptions } from "../boarding-types";
import {
  CLASS_BTN_DISABLED,
  CLASS_CLOSE_ONLY_BTN,
  CLASS_POPOVER_FOOTER_HIDDEN,
  ID_POPOVER,
  PopoverElements,
  POPOVER_ELEMENT,
  POPOVER_OFFSET,
} from "../common/constants";
import {
  assertVarIsNotFalsy,
  attachHighPrioClick,
  bringInView,
  checkOptionalValue,
} from "../common/utils";
import HighlightElement from "./highlight-element";
import SmartPosition, { Alignments, Sides } from "./smart-position";

/** The top-level options that are shared between multiple classes that popover supports */
type PopoverSupportedSharedOptions = Pick<
  BoardingSharedOptions,
  "animate" | "scrollIntoViewOptions" | "padding"
>;

/** The options of popover that will come from the top-level */
export interface PopoverTopLevelOptions {
  /**
   * Additional offset of the popover
   * @default 10
   */
  offset?: number;
}

/** The options of popover that will be defined on a step-level */
export interface PopoverStepLevelOptions {
  /**
   * Title for the popover
   */
  title: string;
  /**
   * Description for the popover
   */
  description: string;
}

/** Available buttons in the Popover */
type PopoverBtns = "close" | "next" | "previous";

/** The options of popover that will come from the top-level but can also be overwritten */
export interface PopoverHybridOptions {
  /**
   * Whether to show control buttons or not. Can be either a boolean or a whitelist of the buttons you want to show
   * @default true
   */
  showButtons?: boolean | PopoverBtns[];
  /**
   * Whether to disable control buttons or not. An array of the butons you want to disable
   * @default []
   */
  disableButtons?: PopoverBtns[];
  /**
   * Text on the button in the final step
   * @default 'Done'
   */
  doneBtnText?: string;
  /**
   * Text on the close button
   * @default 'Close'
   */
  closeBtnText?: string;
  /**
   * Text on the next button
   * @default 'Next'
   */
  nextBtnText?: string;
  /**
   * Text on the next button
   * @default 'Next'
   */
  startBtnText?: string;
  /**
   * Text on the previous button
   * @default 'Previous'
   */
  prevBtnText?: string;
  /**
   * className for the popover on element (will also add the main class scope)
   */
  className?: string;
  /**
   * Preferred side to render the popover
   */
  preferredSide?: Sides;
  /**
   * Preferred side to render the popover (backwards-compatible alias)
   * @deprecated Use `preferredSide` instead.
   */
  prefferedSide?: Sides;
  /**
   * Alignment for the popover
   * @default "start"
   */
  alignment?: Alignments;
  /**
   * Get access to the rendered popover html elements. You can manipulate them here.
   * Be careful, as you can completely break depending on your modifications.
   */
  onPopoverRender?: (popoverElements: PopoverElements) => void;
}

interface PopoverOptions
  extends PopoverHybridOptions,
    PopoverStepLevelOptions,
    PopoverTopLevelOptions,
    PopoverSupportedSharedOptions {
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
   * Click handler attached to popover "Next" or "Finish" button
   */
  onNextClick: () => void;
  /**
   * Click handler attached to popover "Previous" button
   */
  onPreviousClick: () => void;
  /**
   * Click handler attached to popover "Close" button
   */
  onCloseClick: () => void;
}

/**
 * Popover that is displayed for the highlighted element
 */
export default class Popover {
  private options; // type will get inferred with default values being required
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
    disableButtons = [],
    offset = POPOVER_OFFSET,
    alignment = "start",
    closeBtnText = "Close",
    doneBtnText = "Done",
    startBtnText = "Next &rarr;",
    nextBtnText = "Next &rarr;",
    prevBtnText = "&larr; Previous",
    preferredSide,
    prefferedSide,
    ...options
  }: PopoverOptions) {
    const resolvedPreferredSide = preferredSide ?? prefferedSide;
    this.options = {
      showButtons,
      disableButtons,
      offset,
      alignment,
      closeBtnText,
      doneBtnText,
      startBtnText,
      nextBtnText,
      prevBtnText,
      preferredSide: resolvedPreferredSide,
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

    // unmount node
    this.popover.popoverWrapper.parentElement?.removeChild(
      this.popover.popoverWrapper
    );
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

    if (this.options.scrollIntoViewOptions !== "no-scroll") {
      bringInView(
        this.popover.popoverWrapper,
        this.options.scrollIntoViewOptions
      );
    }
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
   * Expose options.showButtons to outside of class
   * @returns array whitelist or boolean whether showButtons is on or off for the popover
   */
  public getShowButtons() {
    return this.options.showButtons;
  }

  /**
   * Expose options.disableButtons to outside of class
   * @returns array blacklist of the disabled buttons
   */
  public getDisabledButtons() {
    return this.options.disableButtons;
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
    const preferredSide = this.options.preferredSide;

    const customPadding = this.highlightElement.getCustomPadding();

    new SmartPosition(
      this.highlightElement,
      this,
      checkOptionalValue(this.options.padding, customPadding),
      this.options.offset
    ).setBestPosition(this.options.alignment, preferredSide);
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

    const popoverElement = POPOVER_ELEMENT(this.options.className);
    const {
      popoverWrapper,
      popoverTip,
      popoverTitle,
      popoverDescription,
      popoverFooter,
      popoverPrevBtn,
      popoverNextBtn,
      popoverCloseBtn,
    } = popoverElement;
    if (this.options.animate) {
      popoverWrapper.classList.add(`${ID_POPOVER}-animated`);
    }
    this.options.onPopoverRender?.(popoverElement);
    document.body.appendChild(popoverWrapper);

    // add btn eventlisteners (using util method, to ensure no external libraries will ever "hear" the click)
    attachHighPrioClick(
      popoverWrapper,
      (e) => {
        const target = e.target as HTMLElement;

        if (popoverNextBtn.contains(target)) {
          this.options.onNextClick();
        }
        if (popoverPrevBtn.contains(target)) {
          this.options.onPreviousClick();
        }
        if (popoverCloseBtn.contains(target)) {
          this.options.onCloseClick();
        }
      },
      (target) => {
        // we allow the defaultAction for the description element, in case it contains links, etc.
        if (popoverDescription.contains(target)) {
          return false;
        }
        return true;
      }
    );

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
      this.popover.popoverFooter.classList.add(CLASS_POPOVER_FOOTER_HIDDEN);
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

    if (Array.isArray(this.options.showButtons)) {
      if (!this.options.showButtons.includes("next")) {
        this.popover.popoverNextBtn.style.display = "none";
      }
      if (!this.options.showButtons.includes("previous")) {
        this.popover.popoverPrevBtn.style.display = "none";
      }
      if (!this.options.showButtons.includes("close")) {
        this.popover.popoverCloseBtn.style.display = "none";
      }
    }

    this.popover.popoverFooter.style.display = "block";
    if (this.options.isFirst) {
      this.popover.popoverPrevBtn.classList.add(CLASS_BTN_DISABLED);
      this.popover.popoverNextBtn.innerHTML = this.options.startBtnText;
    } else {
      this.popover.popoverPrevBtn.classList.remove(CLASS_BTN_DISABLED);
    }

    // disable buttons
    if (this.options.disableButtons.includes("close")) {
      this.popover.popoverCloseBtn.classList.add(CLASS_BTN_DISABLED);
    }
    if (this.options.disableButtons.includes("previous")) {
      this.popover.popoverPrevBtn.classList.add(CLASS_BTN_DISABLED);
    }
    if (this.options.disableButtons.includes("next")) {
      this.popover.popoverNextBtn.classList.add(CLASS_BTN_DISABLED);
    }

    if (this.options.isLast) {
      this.popover.popoverNextBtn.innerHTML = this.options.doneBtnText;
    } else {
      this.popover.popoverNextBtn.innerHTML = this.options.nextBtnText;
    }
  }
}
