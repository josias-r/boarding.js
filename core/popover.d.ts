import { BoardingSharedOptions } from "../boarding-types";
import HighlightElement from "./highlight-element";
import { Alignments, Sides } from "./smart-position";
/** The top-level options that are shared between multiple classes that popover supports */
declare type PopoverSupportedSharedOptions = Pick<BoardingSharedOptions, "animate" | "scrollIntoViewOptions" | "padding">;
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
/** The options of popover that will come from the top-level but can also be overwritten */
export interface PopoverHybridOptions {
    /**
     * Whether to show control buttons or not
     * @default true
     */
    showButtons?: boolean;
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
     * Preffered side to render the popover
     */
    prefferedSide?: Sides;
    /**
     * Alignment for the popover
     * @default "start"
     */
    alignment?: Alignments;
}
interface PopoverOptions extends PopoverHybridOptions, PopoverStepLevelOptions, PopoverTopLevelOptions, PopoverSupportedSharedOptions {
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
}
/**
 * Popover that is displayed for the highlighted element
 */
export default class Popover {
    private options;
    private popover?;
    private highlightElement?;
    constructor({ showButtons, offset, alignment, closeBtnText, doneBtnText, startBtnText, nextBtnText, prevBtnText, ...options }: PopoverOptions);
    /**
     * Hides the popover
     */
    hide(): void;
    /**
     * Shows the popover at the given position
     */
    show(highlightElement: HighlightElement): void;
    /**
     * Refreshes the popover position based on the highlighted element
     */
    refresh(): void;
    /**
     * Get the popover HTML Elements
     */
    getPopoverElements(): {
        popoverWrapper: HTMLDivElement;
        popoverTip: HTMLDivElement;
        popoverTitle: HTMLDivElement;
        popoverDescription: HTMLDivElement;
        popoverFooter: HTMLDivElement;
        popoverPrevBtn: HTMLButtonElement;
        popoverNextBtn: HTMLButtonElement;
        popoverCloseBtn: HTMLButtonElement;
    };
    /**
     * Expose options.showButtons to outside of class
     * @returns boolean whether showButtons is on or off for the popover
     */
    getShowButtons(): any;
    /**
     * Sets the default state for the popover
     */
    private setInitialState;
    /**
     * Updates the position using SmartPosition
     */
    private setPosition;
    /**
     * Prepares the dom element for popover
     */
    private attachNode;
    /**
     * Enables, disables buttons, sets the text and
     * decides if to show them or not
     */
    private renderFooter;
}
export {};
