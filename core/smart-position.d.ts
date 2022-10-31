import Popover from "./popover";
declare const sideHierarchy: readonly ["top", "bottom", "left", "right"];
export declare type Sides = typeof sideHierarchy[number];
export declare type Alignments = "start" | "end" | "center";
/**
 * Responsible for finding the best position for the popup
 */
declare class SmartPosition {
    private highlightElement;
    private popover;
    private padding;
    /** padding + offset */
    private finalOffset;
    constructor(highlightElement: HTMLElement, popover: Popover, padding: number, offset: number);
    setBestPosition(alignment: Alignments, preferredSide?: Sides): void;
    /**
     * @returns DOMRect of element that should be highlighted
     */
    private getHighlightElemRect;
    /**
     * Calculates the popoer dimensions, but also takes the margin into account
     * @returns Popover width + height
     */
    private getPopoverDimensions;
    private checkIfSideOptimal;
    /**
     * Find the best side to place the popover at
     */
    private findOptimalSide;
    /**
     * Normalize the position on an axis in case it would overflow
     * @param alignment one of start, center or end
     * @param popoverLength the length of the popover on the axis in question (x = width, y = height)
     * @param pos the position on the axis (x = left, y = top)
     * @param end the max value on the axis (x = maxWidth, y = maxHeight)
     * @param elementLength the length of the element on the axis in question (x = width, y = height)
     * @returns
     */
    private normalizeAlignment;
    /**
     * Find the optimal position for the popover
     */
    private findOptimalPosition;
    private setPopoverTipPosition;
}
export default SmartPosition;
