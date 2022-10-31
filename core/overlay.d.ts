import { BoardingSharedOptions } from "../boarding-types";
import HighlightElement from "./highlight-element";
/** The top-level options that are shared between multiple classes that overlay supports */
declare type OverlaySupportedSharedOptions = Pick<BoardingSharedOptions, "animate" | "padding">;
/** The options of overlay that will come from the top-level */
export interface OverlayTopLevelOptions {
    /**
     * Is called when the overlay is about to reset
     */
    onReset?: (element: HighlightElement) => void;
    /**
     * Opacity for the overlay
     * @default 0.75
     */
    opacity?: number;
}
interface OverlayOptions extends OverlaySupportedSharedOptions, OverlayTopLevelOptions {
}
/**
 * Responsible for overlay creation and manipulation i.e.
 * cutting out the visible part, animating between the sections etc
 */
declare class Overlay {
    private options;
    private cutoutSVGElement?;
    currentHighlightedElement?: HighlightElement;
    previouslyHighlightedElement?: HighlightElement;
    constructor(options: OverlayOptions);
    /**
     * Highlights the dom element on the screen
     */
    highlight(element: HighlightElement): void;
    /**
     * Removes the overlay and cancel any listeners
     * @param immediate immediately unmount overlay or animate out
     */
    clear(immediate?: boolean): void;
    /**
     * Refreshes the overlay i.e. sets the size according to current window size
     * And moves the highlight around if necessary
     */
    refresh(): void;
    /**
     * Get's the overlay SVG element - required so we can highlight it for the strict click handler
     */
    getOverlayElement(): SVGSVGElement;
    private mountCutoutElement;
    private unmountCutoutElement;
    private updateCutout;
}
export default Overlay;
