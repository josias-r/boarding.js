import { BoardingSharedOptions } from "../boarding-types";
import Popover from "./popover";
/** The top-level options that are shared between multiple classes that popover supports */
declare type HighlightElementSupportedSharedOptions = Pick<BoardingSharedOptions, "scrollIntoViewOptions">;
/** The options of highlight-element that will come from the top-level */
export interface HighlightElementTopLevelOptions {
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
}
/** The options of highlight-element that will be defined on a step-level */
export interface HighlightElementStepLevelOptions {
    /**
     * Is called when the next element is about to be highlighted
     */
    onNext?: (element: HighlightElement) => void;
    /**
     * Is called when the previous element is about to be highlighted
     */
    onPrevious?: (element: HighlightElement) => void;
}
interface HighlightElementOptions extends HighlightElementTopLevelOptions, HighlightElementStepLevelOptions, HighlightElementSupportedSharedOptions {
}
/**
 * Wrapper around DOMElements to enrich them
 * with the functionality necessary
 */
declare class HighlightElement {
    private options;
    private highlightDomElement;
    private popover;
    constructor({ options, highlightDomElement, popover, }: {
        options: HighlightElementOptions;
        highlightDomElement: HTMLElement;
        popover: Popover | null;
    });
    /**
     * Checks if the given element has the same underlying DOM element as the current one
     */
    isSame(element?: HighlightElement | null): boolean;
    /**
     * Gets the DOM Element behind that this class resolves around
     */
    getElement(): HTMLElement;
    /**
     * Gets the popover that is connected to the element
     */
    getPopover(): Popover;
    /**
     * Is called when element is about to be deselected
     * i.e. when moving the focus to next element of closing
     */
    onDeselected(): void;
    /**
     * Is called when the element is about to be highlighted
     */
    onHighlightStarted(): void;
    /**
     * Is called when the element has been successfully highlighted
     */
    onHighlighted(): void;
    /**
     * Is called when the element is about to be highlighted
     */
    onNext(): void;
    /**
     * Is called when the element is about to be highlighted
     */
    onPrevious(): void;
}
export default HighlightElement;
