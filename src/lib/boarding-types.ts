import { HighlightElementHybridOptions } from "./core/highlight-element";
import { OverlayTopLevelOptions } from "./core/overlay";
import {
  PopoverHybridOptions,
  PopoverStepLevelOptions,
  PopoverTopLevelOptions,
} from "./core/popover";

export interface BoardingSharedOptions {
  /**
   * Whether to animate while transitioning from one highlighted
   * element to another
   * @default true
   */
  animate: boolean;
  /**
   * Options to be passed to scrollIntoView if supported by browser
   * @default { behavior: 'instant', block: 'center' }
   */
  scrollIntoViewOptions: ScrollIntoViewOptions;
  /**
   * Distance of elements corner from the edges of the overlay
   * @default 10
   */
  padding: number;
}

export interface BoardingOptions
  extends Partial<BoardingSharedOptions>, // partial because they will get default values
    OverlayTopLevelOptions,
    PopoverHybridOptions,
    PopoverTopLevelOptions,
    HighlightElementHybridOptions {
  /**
   * Whether to allow controlling steps through keyboard
   * @default true
   */
  keyboardControl?: boolean;
  /**
   * If `true`: Prevent clicking ANY element except currently active element (or its children)
   *
   * If `"block-all"`: Prevent clicking ANYTHING except the popover+overlay
   * @default true
   */
  strictClickHandling?: boolean | "block-all";
  /**
   * Clicking outside the highlighted element should reset boarding or not
   * @default true
   */
  allowClose?: boolean;
  /**
   * Clicking outside the highlighted element should move next
   * @default false
   */
  overlayClickNext?: boolean;
  /**
   * className for the boarding popovers
   */
  className?: string;
}

export interface BoardingStepDefinition extends HighlightElementHybridOptions {
  /**
   * Query selector representing the DOM Element
   */
  element: string | HTMLElement;
  /**
   * Options representing popover for this step
   */
  popover?: PopoverStepLevelOptions & PopoverHybridOptions;
}

export type BoardingSteps = BoardingStepDefinition[];
