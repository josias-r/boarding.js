import { HighlightElementOptions } from "./core/highlight-element";
import { OverlayOptions } from "./core/overlay";
import { PopoverHybridOptions, PopoverUserOptions } from "./core/popover";

export interface BoardingOptions
  extends Pick<OverlayOptions, "onReset">,
    Partial<PopoverHybridOptions>,
    Pick<
      HighlightElementOptions,
      "onHighlightStarted" | "onHighlighted" | "onDeselected"
    > {
  /**
   * // TODO: move to overlay
   * Opacity for the overlay
   * @default 0.75
   */
  opacity: number;
  /**
   * Clicking outside the highlighted element should reset driver or not
   * @default true
   */
  allowClose: boolean;
  /**
   * Clicking outside the highlighted element should move next
   * @default false
   */
  overlayClickNext: boolean;

  /**
   * Whether to animate while transitioning from one highlighted
   * element to another
   * @default true
   */
  animate: boolean;
  /**
   * Distance of elements corner from the edges of the overlay
   * @default 10
   */
  padding: number;
  /**
   * Options to be passed to scrollIntoView if supported by browser
   * @default { behavior: 'instant', block: 'center' }
   */
  scrollIntoViewOptions: ScrollIntoViewOptions;
  /**
   * Whether to allow controlling steps through keyboard
   * @default true
   */
  keyboardControl: boolean;
  /**
   * Prevent clicking ANY element except currently active element (or its children)
   * @default true
   */
  strictClickHandling: boolean;
  /**
   * className for the driver popovers
   */
  className?: string;
}

export interface BoardingStepDefinition
  extends Pick<HighlightElementOptions, "onNext" | "onPrevious"> {
  /**
   * Query selector representing the DOM Element
   */
  element: string | HTMLElement;
  /**
   * Options representing popover for this step
   */
  popover?: PopoverUserOptions;
}

export type BoardingSteps = BoardingStepDefinition[];
