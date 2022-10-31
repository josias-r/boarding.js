import HighlightElement from "./core/highlight-element";
import { BoardingOptions, BoardingStepDefinition, BoardingSteps } from "./boarding-types";
/**
 * Plugin class that drives the plugin
 */
declare class Boarding {
    isActivated: boolean;
    private options;
    private steps;
    private currentStep;
    private currentMovePrevented;
    private overlay;
    constructor(options?: BoardingOptions);
    /**
     * Initiates highlighting steps from first step
     * @param index at which highlight is to be started
     */
    start(index?: number): void;
    /**
     * Highlights the given element
     * @param selector Query selector, htmlelement or a step definition
     */
    highlight(selector: BoardingStepDefinition | string | HTMLElement): void;
    /**
     * Refreshes and repositions the popover and the overlay
     */
    refresh(): void;
    /**
     * Moves to the previous step if possible
     * otherwise resets the overlay
     */
    movePrevious(): void;
    /**
     * Prevents the current move. Useful in `onNext` if you want to
     * perform some asynchronous task and manually move to next step
     */
    preventMove(): void;
    /**
     * Moves to the next step if possible
     * otherwise resets the overlay
     */
    moveNext(): void;
    /**
     * Check if there is a next step
     */
    hasNextStep(): boolean;
    /**
     * Check if there is a previous step
     */
    hasPreviousStep(): boolean;
    /**
     * Resets the steps if any and clears the overlay
     * @param immediate immediately unmount overlay or animate out
     */
    reset(immediate?: boolean): void;
    /**
     * Checks if there is any highlighted element or not
     */
    hasHighlightedElement(): boolean;
    /**
     * Gets the currently highlighted element in overlay
     */
    getHighlightedElement(): HighlightElement;
    /**
     * Gets the element that was highlighted before currently highlighted element
     */
    getLastHighlightedElement(): HighlightElement;
    /**
     * Defines steps to be highlighted
     */
    defineSteps(stepDefinitions: BoardingSteps): void;
    /**
     * Getter for steps property
     */
    getSteps(): HighlightElement[];
    /**
     * Setter for steps property
     */
    setSteps(steps: HighlightElement[]): void;
    /**
     * Binds any DOM events listeners
     * @todo: add throttling in all the listeners
     */
    private attachEventListeners;
    /**
     * Removes all DOM events listeners
     */
    private removeEventListeners;
    /**
     * Removes the popover if clicked outside the highlighted element
     * or outside the
     */
    private onClick;
    /**
     * Handler for the onResize DOM event
     * Makes sure highlighted element stays at valid position
     */
    private onResize;
    /**
     * Clears the overlay on escape key process
     */
    private onKeyUp;
    /**
     * Handles the internal "move to next" event
     */
    private handleNext;
    /**
     * Handles the internal "move to previous" event
     */
    private handlePrevious;
    /**
     * Prepares the step received from the user and returns an instance
     * of Element
     */
    private prepareElementFromStep;
}
export default Boarding;
