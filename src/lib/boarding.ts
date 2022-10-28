import Overlay from "./core/overlay";
import Popover, { BoardingPopoverOptions } from "./core/popover";
import {
  CLASS_CLOSE_BTN,
  CLASS_NEXT_STEP_BTN,
  CLASS_PREV_STEP_BTN,
  ESC_KEY_CODE,
  ID_POPOVER,
  LEFT_KEY_CODE,
  OVERLAY_OPACITY,
  OVERLAY_PADDING,
  RIGHT_KEY_CODE,
  SHOULD_ANIMATE_OVERLAY,
  SHOULD_OUTSIDE_CLICK_CLOSE,
  SHOULD_OUTSIDE_CLICK_NEXT,
  ALLOW_KEYBOARD_CONTROL,
} from "./common/constants";
import { assertIsHtmlElement } from "./common/utils";
import HighlightElement from "./core/highlight-element";
import {
  BoardingOptions,
  BoardingStepDefinition,
  BoardingSteps,
  PureBoardingStepDefinition,
} from "./boarding-types";

/**
 * Plugin class that drives the plugin
 */
class Boarding {
  private options: BoardingOptions;
  private isActivated: boolean;
  private steps: BoardingSteps;
  private currentStep: number;
  private currentMovePrevented: boolean;

  private overlay: Overlay;

  constructor(options?: Partial<BoardingOptions>) {
    this.options = {
      animate: SHOULD_ANIMATE_OVERLAY, // Whether to animate or not
      opacity: OVERLAY_OPACITY, // Overlay opacity
      padding: OVERLAY_PADDING, // Spacing around the element from the overlay
      scrollIntoViewOptions: null, // Options to be passed to `scrollIntoView`
      allowClose: SHOULD_OUTSIDE_CLICK_CLOSE, // Whether to close overlay on click outside the element
      keyboardControl: ALLOW_KEYBOARD_CONTROL, // Whether to allow controlling through keyboard or not
      overlayClickNext: SHOULD_OUTSIDE_CLICK_NEXT, // Whether to move next on click outside the element
      stageBackground: "#ffffff", // Background color for the stage
      // onHighlightStarted: () => null, // When element is about to be highlighted
      // onHighlighted: () => null, // When element has been highlighted
      // onDeselected: () => null, // When the element has been deselected
      // onReset: () => null, // When overlay is about to be cleared
      // onNext: () => null, // When next button is clicked
      // onPrevious: () => null, // When previous button is clicked
      ...options,
    };

    this.isActivated = false;
    this.steps = []; // steps to be presented if any
    this.currentStep = 0; // index for the currently highlighted step
    this.currentMovePrevented = false; // If the current move was prevented

    this.overlay = new Overlay(this.options);

    this.onResize = this.onResize.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onClick = this.onClick.bind(this);
    this.moveNext = this.moveNext.bind(this);
    this.movePrevious = this.movePrevious.bind(this);
    this.preventMove = this.preventMove.bind(this);

    // Event bindings
    this.bind();
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
  public setSteps(steps: BoardingSteps) {
    this.steps = steps;
  }

  /**
   * Binds any DOM events listeners
   * @todo: add throttling in all the listeners
   */
  private bind() {
    window.addEventListener("resize", this.onResize, false);
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
   * Removes the popover if clicked outside the highlighted element
   * or outside the
   */
  private onClick(e: MouseEvent | TouchEvent) {
    if (!this.isActivated || !this.hasHighlightedElement()) {
      return;
    }

    // Stop the event propagation on click/tap. `onClick` handles
    // both touch and click events – which on some browsers causes
    // the click to close the tour
    e.stopPropagation();

    const highlightedElement = this.overlay.lastActiveHighlightElement;
    const popover = document.getElementById(ID_POPOVER);

    assertIsHtmlElement(e.target);
    const clickedHighlightedElement = highlightedElement
      ?.getDomElement()
      .contains(e.target);
    const clickedPopover = popover && popover.contains(e.target);

    // Perform the 'Next' operation when clicked outside the highlighted element
    if (
      !clickedHighlightedElement &&
      !clickedPopover &&
      this.options.overlayClickNext
    ) {
      this.handleNext();
      return;
    }

    // Remove the overlay If clicked outside the highlighted element
    if (
      !clickedHighlightedElement &&
      !clickedPopover &&
      this.options.allowClose
    ) {
      this.reset();
      return;
    }

    const nextClicked = e.target.classList.contains(CLASS_NEXT_STEP_BTN);
    const prevClicked = e.target.classList.contains(CLASS_PREV_STEP_BTN);
    const closeClicked = e.target.classList.contains(CLASS_CLOSE_BTN);

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
   * Refreshes and repositions the popover and the overlay
   */
  public refresh() {
    this.overlay.refresh();
  }

  /**
   * Clears the overlay on escape key process
   */
  private onKeyUp(event: KeyboardEvent) {
    // If driver is not active or keyboard control is disabled
    if (!this.isActivated || !this.options.keyboardControl) {
      return;
    }

    // If escape was pressed and it is allowed to click outside to close
    if (event.keyCode === ESC_KEY_CODE && this.options.allowClose) {
      this.reset();
      return;
    }

    // If there is no highlighted element or there is a highlighted element
    // without popover or if the popover does not allow buttons - ignore
    const highlightedElement = this.getHighlightedElement();
    if (!highlightedElement || !highlightedElement.popover) {
      return;
    }

    if (event.keyCode === RIGHT_KEY_CODE) {
      this.handleNext();
    } else if (event.keyCode === LEFT_KEY_CODE) {
      this.handlePrevious();
    }
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
   * Handles the internal "move to next" event
   */
  private handleNext() {
    this.currentMovePrevented = false;

    // Call the bound `onNext` handler if available
    const currentStep = this.steps[this.currentStep];
    if (currentStep && currentStep.options && currentStep.options.onNext) {
      currentStep.options.onNext(currentStep);
    }

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
    if (currentStep && currentStep.options && currentStep.options.onPrevious) {
      currentStep.options.onPrevious(currentStep);
    }

    if (this.currentMovePrevented) {
      return;
    }

    this.movePrevious();
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
   */
  public reset(immediate = false) {
    this.currentStep = 0;
    this.isActivated = false;
    this.overlay.clear(immediate);
  }

  /**
   * Checks if there is any highlighted element or not
   */
  public hasHighlightedElement() {
    return !!this.overlay.lastActiveHighlightElement;
  }

  /**
   * Gets the currently highlighted element in overlay
   */
  public getHighlightedElement() {
    return this.overlay.lastActiveHighlightElement;
  }

  // TODO: add again
  // /**
  //  * Gets the element that was highlighted before currently highlighted element
  //  *
  //  */
  // public getLastHighlightedElement() {
  //   return this.overlay.getLastHighlightedElement();
  // }

  /**
   * Defines steps to be highlighted
   */
  public defineSteps(stepDefinitions: BoardingStepDefinition[]) {
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
   * Prepares the step received from the user and returns an instance
   * of Element
   */
  private prepareElementFromStep(
    currentStep: BoardingStepDefinition,
    allSteps: BoardingStepDefinition[] = [],
    index = 0
  ) {
    let elementOptions: Omit<PureBoardingStepDefinition, "element"> &
      BoardingOptions = {
      ...this.options,
    };
    let domElementOrSelector: string | HTMLElement | undefined =
      typeof currentStep === "string" ? currentStep : undefined;

    if (
      typeof currentStep !== "string" &&
      !("nodeType" in currentStep) &&
      !currentStep.element
    ) {
      throw new Error(`Element is required in step ${index}`);
    }

    // If the `currentStep` is step definition
    // then grab the options and element from the definition
    if (typeof currentStep !== "string" && !("nodeType" in currentStep)) {
      domElementOrSelector = currentStep.element;
      elementOptions = { ...this.options, ...currentStep };
    }

    // If the given element is a query selector or a DOM element?
    const domElement =
      typeof domElementOrSelector === "string"
        ? (document.querySelector(domElementOrSelector) as HTMLElement) // TODO: "as" alternative?
        : domElementOrSelector;
    if (!domElement) {
      console.warn(`Element to highlight ${domElementOrSelector} not found`);
      return null;
    }

    let popover: Popover | null = null;
    if (elementOptions.popover && elementOptions.popover.title) {
      const mergedClassNames = [
        this.options.className,
        elementOptions.popover.className,
      ]
        .filter((c) => c)
        .join(" ");

      const popoverOptions: BoardingPopoverOptions = {
        ...elementOptions,
        ...elementOptions.popover,
        className: mergedClassNames,
        totalCount: allSteps.length,
        currentIndex: index,
        isFirst: index === 0,
        isLast: allSteps.length === 0 || index === allSteps.length - 1, // Only one item or last item
      };

      popover = new Popover(popoverOptions);
    }

    return new HighlightElement({
      highlightDomElement: domElement,
      options: elementOptions,
      popover,
      overlay: this.overlay,
    });
  }

  /**
   * Initiates highlighting steps from first step
   * @param index at which highlight is to be started
   */
  public start(index = 0) {
    if (!this.steps || this.steps.length === 0) {
      throw new Error("There are no steps defined to iterate");
    }

    this.isActivated = true;
    this.currentStep = index;
    this.overlay.highlight(this.steps[index]);

    // call element highlighted event
    this.overlay.lastActiveHighlightElement?.onHighlighted();
  }

  /**
   * Highlights the given element
   * @param {string|{element: string, popover: {}}} selector Query selector or a step definition
   */
  public highlight(selector: BoardingStepDefinition) {
    this.isActivated = true;

    const element = this.prepareElementFromStep(selector);
    if (!element) {
      return;
    }

    this.overlay.highlight(element);
  }
}

export default Boarding;
