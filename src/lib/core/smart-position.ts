import { assertVarIsNotFalsy } from "../common/utils";
import Popover from "./popover";

const sideHierarchy = ["top", "bottom", "left", "right"] as const;

export type Sides = typeof sideHierarchy[number];
export type Alignments = "start" | "end" | "center";

interface SideCheckResult {
  side: Sides;
  value: number;
  isOptimal: boolean;
}

/**
 * Responsible for finding the best position for the popup
 */
class SmartPosition {
  private highlightElement: HTMLElement;
  private popover: Popover;
  private padding: number;
  /** padding + offset */
  private finalOffset: number;

  constructor(
    highlightElement: HTMLElement,
    popover: Popover,
    padding: number,
    offset: number
  ) {
    this.highlightElement = highlightElement;
    this.popover = popover;

    this.padding = padding;
    this.finalOffset = padding + offset;
  }

  public setBestPosition(alignment: Alignments, preferredSide?: Sides) {
    const position = this.findOptimalPosition(alignment, preferredSide);

    const popoverWrapper = this.popover.getPopoverElements()?.popoverWrapper;
    assertVarIsNotFalsy(popoverWrapper);

    popoverWrapper.style.left =
      typeof position.left === "number" ? `${position.left}px` : "auto";
    popoverWrapper.style.right =
      typeof position.right === "number" ? `${position.right}px` : "auto";
    popoverWrapper.style.top =
      typeof position.top === "number" ? `${position.top}px` : "auto";
    popoverWrapper.style.bottom =
      typeof position.bottom === "number" ? `${position.bottom}px` : "auto";
  }

  /**
   * @returns DOMRect of element that should be highlighted
   */
  private getHighlightElemRect() {
    return this.highlightElement.getBoundingClientRect();
  }
  /**
   * Calculates the popoer dimensions, but also takes the margin into account
   * @returns Popover width + height
   */
  private getPopoverDimensions() {
    const popoverRect = this.popover
      .getPopoverElements()
      ?.popoverWrapper.getBoundingClientRect();

    assertVarIsNotFalsy(popoverRect);

    // note that we only add margins ONCE because it only matters as a margin to the highlightElement, not the viewport
    return {
      width: popoverRect.width + this.finalOffset,
      height: popoverRect.height + this.finalOffset,
    };
  }

  private checkIfSideOptimal(position: Sides): SideCheckResult {
    const popoverDimensions = this.getPopoverDimensions();
    const elemRect = this.getHighlightElemRect();

    switch (position) {
      case "top":
        const top = elemRect.top - popoverDimensions.height;

        return {
          side: "top",
          value: top,
          isOptimal: top >= 0,
        };

      case "bottom":
        const bottom =
          window.innerHeight - (elemRect.bottom + popoverDimensions.height);

        return {
          side: "bottom",
          value: bottom,
          isOptimal: bottom >= 0,
        };
      case "left":
        const left = elemRect.left - popoverDimensions.width;

        return {
          side: "left",
          value: left,
          isOptimal: left >= 0,
        };
      case "right":
        const right =
          window.innerWidth - (elemRect.right + popoverDimensions.width);

        return {
          side: "right",
          value: right,
          isOptimal: right >= 0,
        };
    }
  }

  /**
   * Find the best side to place the popover at
   */
  private findOptimalSide(
    sideHierarchyIndex: number = 0
  ): SideCheckResult | "none" {
    const currentPositionToCheck = sideHierarchy[sideHierarchyIndex];
    const result = this.checkIfSideOptimal(currentPositionToCheck);
    if (!result.isOptimal) {
      // check if we just calculated the last possible side without finding an optimal one
      if (sideHierarchyIndex === sideHierarchy.length - 1) {
        return "none";
      }
      return this.findOptimalSide(sideHierarchyIndex + 1);
    }

    return result;
  }

  /**
   * Normalize the position on an axis in case it would overflow
   * @param alignment one of start, center or end
   * @param popoverLength the length of the popover on the axis in question (x = width, y = height)
   * @param pos the position on the axis (x = left, y = top)
   * @param end the max value on the axis (x = maxWidth, y = maxHeight)
   * @param elementLength the length of the element on the axis in question (x = width, y = height)
   * @returns
   */
  private normalizeAlignment(
    alignment: Alignments,
    popoverLength: number, // popover height or width
    pos: number, // element top or left
    end: number, // window height or width
    elementLength: number // popover height or width
  ) {
    switch (alignment) {
      case "start":
        return Math.min(pos - this.padding, end - popoverLength);
      case "end":
        return Math.min(
          pos - popoverLength + elementLength + this.padding,
          end - popoverLength
        );
      case "center":
        const posCentered = pos - this.padding + popoverLength / 2;

        const from = Math.min(posCentered, end - popoverLength);
        const to = Math.min(posCentered, end);
        if (to !== posCentered) {
          return to;
        }
        if (from !== posCentered) {
          return from;
        }
        return Math.max(0, posCentered);
    }
  }

  /**
   * Find the optimal position for the popover
   */
  private findOptimalPosition(alignment: Alignments, preferredSide?: Sides) {
    let foundSideResult: SideCheckResult | "none";
    // check if prefferd side is optimal
    if (preferredSide) {
      foundSideResult = this.checkIfSideOptimal(preferredSide);
      // if preffered side was not optimal -> check all sides the standard way
      if (!foundSideResult.isOptimal) {
        foundSideResult = this.findOptimalSide();
      }
    } else {
      // check all sides the standard way
      foundSideResult = this.findOptimalSide();
    }

    if (foundSideResult === "none") {
      // TODO: responsive handling
      throw new Error("NO SIDE FOUND");
    } else {
      const popoverDimensions = this.getPopoverDimensions();
      const elemRect = this.getHighlightElemRect();

      const position: {
        top?: number;
        bottom?: number;
        left?: number;
        right?: number;
      } = {};

      switch (foundSideResult.side) {
        case "top":
          position.top = foundSideResult.value;
          position.left = this.normalizeAlignment(
            alignment,
            popoverDimensions.width - this.finalOffset, // get the real dimension without the margin
            elemRect.left,
            window.innerWidth,
            elemRect.width
          );
          break;
        case "bottom":
          position.bottom = foundSideResult.value;
          position.left = this.normalizeAlignment(
            alignment,
            popoverDimensions.width - this.finalOffset, // get the real dimension without the margin
            elemRect.left,
            window.innerWidth,
            elemRect.width
          );
          break;
        case "left":
          position.left = foundSideResult.value;
          position.top = this.normalizeAlignment(
            alignment,
            popoverDimensions.height - this.finalOffset, // get the real dimension without the margin
            elemRect.top,
            window.innerHeight,
            elemRect.height
          );
          break;
        case "right":
          position.right = foundSideResult.value;
          position.top = this.normalizeAlignment(
            alignment,
            popoverDimensions.height - this.finalOffset, // get the real dimension without the margin
            elemRect.top,
            window.innerHeight,
            elemRect.height
          );
          break;
      }
      return position;
    }
  }
}

export default SmartPosition;
