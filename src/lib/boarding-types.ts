import HighlightElement, {
  HighlightElementHybridOptions,
} from "./core/highlight-element";
import {BoardingExitReason, OverlayTopLevelOptions} from "./core/overlay";
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
   * Rounded corner radius for cutout (px)
   * @default 5
   */
  radius: number;
  /**
   * Options to be passed to scrollIntoView if supported by browser
   * @default { behavior: 'instant', block: 'center' }
   */
  scrollIntoViewOptions: ScrollIntoViewOptions | "no-scroll";
  /**
   * Distance of elements corner from the edges of the overlay
   * @default 10
   */
  padding: number;
  /**
   * If `true`: Prevent clicking ANY element except currently active element (or its children)
   *
   * If `"block-all"`: Prevent clicking ANYTHING except the popover+overlay
   * @default true
   */
  strictClickHandling: boolean | "block-all";
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
  /**
   * Simple event that triggers for boarding.start()
   */
  onStart?: (element: HighlightElement) => void;
  /**
   * Event that will trigger when boarding is finished, after everything is cleaned up
   */
  onFinish?: (reason: BoardingExitReason) => void;
  /**
   * Event that will trigger when a step is entered
   */
  onStep?: (step: number) => void;
}

/** Identifier for different navigation actions relevant to an event */
export type StepNavigationInitiator = "next" | "prev" | "init" | "reset";

export interface BoardingStepDefinition extends HighlightElementHybridOptions {
  /**
   * Query selector representing the DOM Element
   */
  element: string | HTMLElement;

  /**
   * A method that will run very early for the element to-be highlighted.
   * The method will run right before `onNext` (or `onPrevious` when going backwards).
   * If returning a promise, it will wait for it to resolve before moving into the step.
   *
   * @param initiator either "next", "prev" or "init"
   */
  prepareElement?: (initiator: StepNavigationInitiator) => void;
  /**
   * Event that will trigger when leaving a step
   */
  cleanupElement?: (initiator: StepNavigationInitiator) => void;
  /**
   * Options representing popover for this step
   */
  popover?: PopoverStepLevelOptions & PopoverHybridOptions;
}

export type BoardingSteps = BoardingStepDefinition[];
