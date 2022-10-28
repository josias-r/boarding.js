import HighlightElement from "./core/highlight-element";
import { BoardingPopoverOptions } from "./core/popover";

export interface BoardingOptions {
  /**
   * Whether to animate while transitioning from one highlighted
   * element to another
   * @default true
   */
  animate: boolean;

  /**
   * Opacity for the overlay
   * @default 0.75
   */
  opacity: number;
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
   * Clicking outside the highlighted element should reset driver or not
   * @default true
   */
  allowClose: boolean;
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
   * Clicking outside the highlighted element should move next
   * @default false
   */
  overlayClickNext: boolean;
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
   * Text on the previous button
   * @default 'Previous'
   */
  prevBtnText?: string;
  /**
   * className for the driver popovers
   */
  className?: string;
}

export type BoardingSteps = HighlightElement[];
export interface BoardingStepDefinition {
  /**
   * Query selector representing the DOM Element
   */
  element: string | HTMLElement;
  /**
   * Options representing popover for this step
   */
  popover?: BoardingPopoverOptions;
  /**
   * Is called when the next element is about to be highlighted
   */
  onNext?: (element: HighlightElement) => void;
  /**
   * Is called when the previous element is about to be highlighted
   */
  onPrevious?: (element: HighlightElement) => void;
}
