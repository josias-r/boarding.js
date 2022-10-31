import Overlay from "./core/overlay";
import Popover from "./core/popover";
import {
  OVERLAY_OPACITY,
  OVERLAY_PADDING,
  SHOULD_ANIMATE_OVERLAY,
  SHOULD_OUTSIDE_CLICK_CLOSE,
  SHOULD_OUTSIDE_CLICK_NEXT,
  ALLOW_KEYBOARD_CONTROL,
  SHOULD_STRICT_CLICK_HANDLE,
} from "./common/constants";
import { assertIsElement } from "./common/utils";
import HighlightElement from "./core/highlight-element";
import {
  BoardingOptions,
  BoardingStepDefinition,
  BoardingSteps,
} from "./boarding-types";

/**
 * Plugin class that drives the plugin
 */
class Boarding {
  public isActivated: boolean;

  private options; // type will get inferred with default values being required
  private steps: HighlightElement[];
  private currentStep: number;
  private currentMovePrevented: boolean;

  private overlay: Overlay;

  constructor(options?: BoardingOptions) {
    const {
      strictClickHandling = SHOULD_STRICT_CLICK_HANDLE, // Whether to only allow clicking the highlighted element
      animate = SHOULD_ANIMATE_OVERLAY, // Whether to animate or not
      opacity = OVERLAY_OPACITY, // Overlay opacity
      padding = OVERLAY_PADDING, // Spacing around the element from the overlay
      scrollIntoViewOptions = {
        behavior: "auto",
        block: "center",
      }, // Options to be passed to `scrollIntoView`
      allowClose = SHOULD_OUTSIDE_CLICK_CLOSE, // Whether to close overlay on click outside the element
      keyboardControl = ALLOW_KEYBOARD_CONTROL, // Whether to allow controlling through keyboard or not
      overlayClickNext = SHOULD_OUTSIDE_CLICK_NEXT, // Whether to move next on click outside the element
      ...defaultOptions
    } = { ...options };

    this.options = {
      strictClickHandling,
      animate,
      opacity,
      padding,
      scrollIntoViewOptions,
      allowClose,
      keyboardControl,
      overlayClickNext,
      ...defaultOptions,
    };

    this.isActivated = false;
    this.steps = []; // steps to be presented if any
    this.currentStep = 0; // index for the currently highlighted step
    this.currentMovePrevented = false; // If the current move was prevented

    this.overlay = new Overlay({
      animate: this.options.animate,
      padding: this.options.padding,
      onReset: this.options.onReset,
    });

    // bind this class to eventHandlers
    this.onResize = this.onResize.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onClick = this.onClick.bind(this);
    this.moveNext = this.moveNext.bind(this);
    this.movePrevious = this.movePrevious.bind(this);
    this.preventMove = this.preventMove.bind(this);
  }

  /**
   * Initiates highlighting steps from first step
   * @param index at which highlight is to be started
   */
  public start(index = 0) {
    if (!this.steps || this.steps.length === 0) {
      throw new Error("There are no steps defined to iterate");
    }

    // attach eventListeners BEFORE setting highlighting element
    this.attachEventListeners();

    this.isActivated = true;
    this.currentStep = index;
    this.overlay.highlight(this.steps[index]);
  }

  /**
   * Highlights the given element
   * @param selector Query selector, htmlelement or a step definition
   */
  public highlight(selector: BoardingStepDefinition | string | HTMLElement) {
    // convert argument to step definition
    const stepDefinition: BoardingStepDefinition =
      typeof selector === "object" && "element" in selector
        ? selector
        : { element: selector };

    const element = this.prepareElementFromStep(stepDefinition);
    if (!element) {
      return;
    }
    // attach eventListeners BEFORE setting highlighting element
    this.attachEventListeners();

    this.isActivated = true;
    this.overlay.highlight(element);
  }

  /**
   * Refreshes and repositions the popover and the overlay
   */
  public refresh() {
    this.overlay.refresh();
  }

  /**
   * Moves to the previous step if possible
   * otherwise resets the overlay
   */
  public movePrevious() {
    const previousStep = this.steps[this.currentStep - 1];
    if (!previousStep) {
      this.reset();
      return;
    }

    this.overlay.highlight(previousStep);
    this.currentStep -= 1;
  }

  /**
   * Prevents the current move. Useful in `onNext` if you want to
   * perform some asynchronous task and manually move to next step
   */
  public preventMove() {
    this.currentMovePrevented = true;
  }

  /**
   * Moves to the next step if possible
   * otherwise resets the overlay
   */
  public moveNext() {
    const nextStep = this.steps[this.currentStep + 1];
    if (!nextStep) {
      this.reset();
      return;
    }

    this.overlay.highlight(nextStep);
    this.currentStep += 1;
  }

  /**
   * Check if there is a next step
   */
  public hasNextStep() {
    return !!this.steps[this.currentStep + 1];
  }

  /**
   * Check if there is a previous step
   */
  public hasPreviousStep() {
    return !!this.steps[this.currentStep - 1];
  }

  /**
   * Resets the steps if any and clears the overlay
   * @param immediate immediately unmount overlay or animate out
   */
  public reset(immediate = false) {
    this.currentStep = 0;
    this.isActivated = false;
    this.overlay.clear(immediate);
    this.removeEventListeners();
  }

  /**
   * Checks if there is any highlighted element or not
   */
  public hasHighlightedElement() {
    return !!this.overlay.currentHighlightedElement;
  }

  /**
   * Gets the currently highlighted element in overlay
   */
  public getHighlightedElement() {
    return this.overlay.currentHighlightedElement;
  }

  /**
   * Gets the element that was highlighted before currently highlighted element
   */
  public getLastHighlightedElement() {
    return this.overlay.previouslyHighlightedElement;
  }

  /**
   * Defines steps to be highlighted
   */
  public defineSteps(stepDefinitions: BoardingSteps) {
    this.steps = [];

    for (let counter = 0; counter < stepDefinitions.length; counter++) {
      const element = this.prepareElementFromStep(
        stepDefinitions[counter],
        stepDefinitions,
        counter
      );
      if (!element) {
        continue;
      }

      this.steps.push(element);
    }
  }

  /**
   * Getter for steps property
   */
  public getSteps() {
    return this.steps;
  }

  /**
   * Setter for steps property
   */
  public setSteps(steps: HighlightElement[]) {
    this.steps = steps;
  }

  /**
   * Binds any DOM events listeners
   * @todo: add throttling in all the listeners
   */
  private attachEventListeners() {
    window.addEventListener("resize", this.onResize, false);
    window.addEventListener("scroll", this.onResize, false);
    window.addEventListener("keyup", this.onKeyUp, false);

    // Binding both touch and click results in popup getting shown and then immediately get hidden.
    // Adding the check to not bind the click event if the touch is supported i.e. on mobile devices
    // Issue: https://github.com/kamranahmedse/driver.js/issues/150
    if (!("ontouchstart" in document.documentElement)) {
      window.addEventListener("click", this.onClick, false);
    } else {
      window.addEventListener("touchstart", this.onClick, false);
    }
  }
  /**
   * Removes all DOM events listeners
   */
  private removeEventListeners() {
    window.removeEventListener("resize", this.onResize, false);
    window.removeEventListener("scroll", this.onResize, false);
    window.removeEventListener("keyup", this.onKeyUp, false);

    window.removeEventListener("click", this.onClick, false);
    window.removeEventListener("touchstart", this.onClick, false);
  }

  /**
   * Removes the popover if clicked outside the highlighted element
   * or outside the
   */
  private onClick(e: MouseEvent | TouchEvent) {
    if (!this.overlay.currentHighlightedElement) {
      return;
    }
    assertIsElement(e.target);

    const highlightedElement = this.overlay.currentHighlightedElement;
    const clickedHighlightedElement = highlightedElement
      .getElement()
      .contains(e.target);

    const popoverElements = highlightedElement
      .getPopover()
      ?.getPopoverElements();
    const clickedPopover = popoverElements?.popoverWrapper.contains(e.target);

    const clickedOverlay = this.overlay.getOverlayElement()?.contains(e.target);

    const clickedUnknown =
      !clickedPopover && !clickedOverlay && !clickedHighlightedElement;

    // with strict click handling any click that is not the active element (or a UI element of boarding.js) is ignored
    if (this.options.strictClickHandling && clickedUnknown) {
      e.preventDefault();
      e.stopImmediatePropagation();
      e.stopPropagation();
      return;
    }

    // Perform the 'Next' operation when clicked outside the highlighted element
    if (clickedOverlay && this.options.overlayClickNext) {
      this.handleNext();
      return;
    }
    // Remove the overlay If clicked outside the highlighted element
    if (clickedOverlay && this.options.allowClose) {
      this.reset();
      return;
    }

    if (popoverElements) {
      const nextClicked = e.target.contains(popoverElements.popoverNextBtn);
      const prevClicked = e.target.contains(popoverElements.popoverPrevBtn);
      const closeClicked = e.target.contains(popoverElements.popoverCloseBtn);

      if (closeClicked) {
        this.reset();
        return;
      }

      if (nextClicked) {
        this.handleNext();
      } else if (prevClicked) {
        this.handlePrevious();
      }
    }
  }

  /**
   * Handler for the onResize DOM event
   * Makes sure highlighted element stays at valid position
   */
  private onResize() {
    if (!this.isActivated) {
      return;
    }

    this.refresh();
  }

  /**
   * Clears the overlay on escape key process
   */
  private onKeyUp(event: KeyboardEvent) {
    // Ignore if boarding is not active or keyboard control is disabled
    if (!this.isActivated || !this.options.keyboardControl) {
      return;
    }

    // If escape was pressed and it is allowed to click outside to close -> reset
    if (event.key === "Escape" && this.options.allowClose) {
      this.reset();
      return;
    }

    // Ignore if there is no highlighted element or there is a highlighted element
    // without popover or if the popover does not allow buttons
    const highlightedElement = this.getHighlightedElement();
    if (
      !highlightedElement ||
      !highlightedElement.getPopover() ||
      !highlightedElement.getPopover()?.getShowButtons()
    ) {
      return;
    }

    if (event.key === "ArrowRight") {
      this.handleNext();
    } else if (event.key === "ArrowLeft") {
      this.handlePrevious();
    }
  }

  /**
   * Handles the internal "move to next" event
   */
  private handleNext() {
    this.currentMovePrevented = false;

    // Call the bound `onNext` handler if available
    const currentStep = this.steps[this.currentStep];

    currentStep?.onNext();

    if (this.currentMovePrevented) {
      return;
    }

    this.moveNext();
  }

  /**
   * Handles the internal "move to previous" event
   */
  private handlePrevious() {
    this.currentMovePrevented = false;

    // Call the bound `onPrevious` handler if available
    const currentStep = this.steps[this.currentStep];
    currentStep?.onPrevious();

    if (this.currentMovePrevented) {
      return;
    }

    this.movePrevious();
  }

  /**
   * Prepares the step received from the user and returns an instance
   * of Element
   */
  private prepareElementFromStep(
    currentStep: BoardingStepDefinition,
    allSteps: BoardingSteps = [],
    index = 0
  ) {
    // If the given element is a query selector or a DOM element?
    const domElement =
      typeof currentStep.element === "string"
        ? document.querySelector<HTMLElement>(currentStep.element)
        : currentStep.element;
    if (!domElement) {
      console.warn(`Element to highlight ${currentStep.element} not found`);
      return null;
    }

    let popover: Popover | null = null;
    if (currentStep.popover?.title) {
      const mergedClassNames = [
        this.options.className,
        currentStep.popover.className,
      ]
        .filter((c) => c)
        .join(" ");

      popover = new Popover({
        // general options
        padding: this.options.padding,
        offset: this.options.offset,
        animate: this.options.animate,
        scrollIntoViewOptions: this.options.scrollIntoViewOptions,
        // popover options
        title: currentStep.popover.title,
        description: currentStep.popover.description,
        // hybrid options
        prefferedSide:
          currentStep.popover.prefferedSide || this.options.prefferedSide,
        alignment: currentStep.popover.alignment || this.options.alignment,
        showButtons:
          currentStep.popover.showButtons || this.options.showButtons,
        doneBtnText:
          currentStep.popover.doneBtnText || this.options.doneBtnText,
        closeBtnText:
          currentStep.popover.closeBtnText || this.options.closeBtnText,
        nextBtnText:
          currentStep.popover.nextBtnText || this.options.nextBtnText,
        startBtnText:
          currentStep.popover.startBtnText || this.options.startBtnText,
        prevBtnText:
          currentStep.popover.prevBtnText || this.options.prevBtnText,
        className: mergedClassNames,
        // inferred options
        totalCount: allSteps.length,
        currentIndex: index,
        isFirst: index === 0,
        isLast: allSteps.length === 0 || index === allSteps.length - 1, // Only one item or last item
      });
    }

    return new HighlightElement({
      highlightDomElement: domElement,
      options: {
        scrollIntoViewOptions: this.options.scrollIntoViewOptions,
        onHighlightStarted: this.options.onHighlightStarted,
        onHighlighted: this.options.onHighlighted,
        onDeselected: this.options.onDeselected,
        onNext: currentStep.onNext,
        onPrevious: currentStep.onPrevious,
      },
      popover,
    });
  }
}

export default Boarding;
