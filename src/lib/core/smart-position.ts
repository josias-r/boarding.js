import { CLASS_POPOVER_TIP } from "../common/constants";
import { assertVarIsNotFalsy } from "../common/utils";
import HighlightElement from "./highlight-element";
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
  private highlightElement: HighlightElement;
  private popover: Popover;
  private padding: number;
  /** padding + offset */
  private finalOffset: number;

  constructor(
    highlightElement: HighlightElement,
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
    const popoverWrapper = this.popover.getPopoverElements()?.popoverWrapper;
    assertVarIsNotFalsy(popoverWrapper);

    // Measure at the viewport origin so the previous position cannot shrink the width.
    popoverWrapper.style.width = "";
    popoverWrapper.style.left = "0";
    popoverWrapper.style.right = "auto";
    const popoverRect = popoverWrapper.getBoundingClientRect();
    const measuredWidth = parseFloat(
      window.getComputedStyle(popoverWrapper).width
    );
    const boxSize = popoverRect.width - measuredWidth;
    const viewportPadding = this.getPopoverDimensions().tipSize;
    const availableWidth =
      document.documentElement.clientWidth - 2 * viewportPadding;
    popoverWrapper.style.width =
      `${Math.max(0, Math.min(popoverRect.width, availableWidth) - boxSize)}px`;

    const position = this.findOptimalPosition(alignment, preferredSide);

    for (const side of sideHierarchy) {
      const value = position[side];
      popoverWrapper.style[side] = typeof value === "number" ? `${value}px` : "auto";
    }
  }

  /**
   * @returns DOMRect of element that should be highlighted
   */
  private getHighlightElemRect() {
    const highlightDomRect = this.highlightElement.getDOMRect();

    return highlightDomRect;
  }
  /**
   * Calculates the popoer dimensions, but also takes the margin into account
   * @returns Popover width + height
   */
  private getPopoverDimensions() {
    const popoverElements = this.popover.getPopoverElements();
    assertVarIsNotFalsy(popoverElements);

    const popoverRect = popoverElements.popoverWrapper.getBoundingClientRect();
    const popoverTipRect = popoverElements.popoverTip.getBoundingClientRect();

    assertVarIsNotFalsy(popoverRect);
    assertVarIsNotFalsy(popoverTipRect);

    const tipStyle = window.getComputedStyle(popoverElements.popoverTip);

    // note that we only add margins ONCE because it only matters as a margin to the highlightElement, not the viewport
    return {
      width: popoverRect.width + this.finalOffset,
      height: popoverRect.height + this.finalOffset,
      tipSize:
        popoverTipRect.width ||
        parseFloat(tipStyle.borderLeftWidth) +
          parseFloat(tipStyle.borderRightWidth),
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
          document.documentElement.clientWidth -
          (elemRect.right + popoverDimensions.width);

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
   * @param padding extra space that should be considered when touching boundries such as "end" or "0"
   * @returns
   */
  private normalizeAlignment(
    alignment: Alignments,
    popoverLength: number, // popover height or width
    pos: number, // element top or left
    end: number, // window height or width
    elementLength: number, // popover height or width
    extraPadding: number
  ) {
    switch (alignment) {
      case "start":
        return Math.max(
          Math.min(pos - this.padding, end - popoverLength - extraPadding),
          extraPadding
        );
      case "end":
        return Math.max(
          Math.min(
            pos - popoverLength + elementLength + this.padding,
            end - popoverLength - extraPadding
          ),
          extraPadding
        );
      case "center":
        const posCentered = pos - popoverLength / 2 + elementLength / 2;
        return Math.min(
          Math.max(extraPadding, posCentered),
          end - extraPadding - popoverLength
        );
    }
  }

  /**
   * Find the optimal position for the popover
   */
  private findOptimalPosition(
    alignment: Alignments,
    preferredSide?: Sides
  ): {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  } {
    let foundSideResult: SideCheckResult | "none";
    // check if preferred side is optimal
    if (preferredSide) {
      foundSideResult = this.checkIfSideOptimal(preferredSide);
      // if preferred side was not optimal -> check all sides the standard way
      if (!foundSideResult.isOptimal) {
        foundSideResult = this.findOptimalSide();
      }
    } else {
      // check all sides the standard way
      foundSideResult = this.findOptimalSide();
    }

    if (foundSideResult === "none") {
      // TODO: responsive handling if popover has no space
      // for now just center in the screen
      const popoverDimensions = this.getPopoverDimensions();

      // reset previous classes
      this.clearPopoverTipPosition();

      return {
        left:
          document.documentElement.clientWidth / 2 -
          (popoverDimensions.width - this.finalOffset) / 2,
        bottom: 10,
      };
    } else {
      const popoverDimensions = this.getPopoverDimensions();
      const elemRect = this.getHighlightElemRect();

      const position: ReturnType<typeof this.findOptimalPosition> = {};

      const popoverRealWidth = popoverDimensions.width - this.finalOffset; // get the real dimension without the margin
      const popoverRealHeight = popoverDimensions.height - this.finalOffset; // get the real dimension without the margin
      const side = foundSideResult.side;
      const isHorizontal = side === "top" || side === "bottom";
      const elementPos = isHorizontal ? elemRect.left : elemRect.top;
      const elementLength = isHorizontal ? elemRect.width : elemRect.height;
      const maxTop =
        window.innerHeight - popoverRealHeight - popoverDimensions.tipSize;
      const maxLeft =
        document.documentElement.clientWidth -
        popoverRealWidth -
        popoverDimensions.tipSize;

      position[side] = Math.min(
        foundSideResult.value,
        isHorizontal ? maxTop : maxLeft
      );
      const secondaryPosition = this.normalizeAlignment(
        alignment,
        isHorizontal ? popoverRealWidth : popoverRealHeight,
        elementPos,
        isHorizontal ? document.documentElement.clientWidth : window.innerHeight,
        elementLength,
        popoverDimensions.tipSize
      );
      position[isHorizontal ? "left" : "top"] = secondaryPosition;
      this.setPopoverTipPosition(
        alignment,
        side,
        elementPos,
        elementLength,
        secondaryPosition
      );

      return position;
    }
  }

  /**
   * Reset the popover position classes.
   */
  private clearPopoverTipPosition() {
    const popoverTipElem = this.popover.getPopoverElements()?.popoverTip;
    assertVarIsNotFalsy(popoverTipElem);

    // reset previous classes
    popoverTipElem.className = CLASS_POPOVER_TIP;
    popoverTipElem.style.left = "";
    popoverTipElem.style.right = "";
    popoverTipElem.style.top = "";
    popoverTipElem.style.bottom = "";
    popoverTipElem.style.marginLeft = "";
    popoverTipElem.style.marginTop = "";
  }

  /** interprete the arrow direction for the popover arrow tip */
  private setPopoverTipPosition(
    alignment: Alignments,
    popoverside: Sides,
    /** When right/left = element.top, when top/bottom = element.left */
    elementPosSecondaryAxis: number,
    /** When right/left = element.height, when top/bottom = element.width */
    elementLength: number,
    popoverPosSecondaryAxis: number
  ) {
    const popoverElem = this.popover.getPopoverElements()?.popoverWrapper;
    const popoverTipElem = this.popover.getPopoverElements()?.popoverTip;
    assertVarIsNotFalsy(popoverElem);
    assertVarIsNotFalsy(popoverTipElem);

    // not tipside is the OPPOSITe of what you might think
    let tipSide = popoverside;
    let tipAlignment = alignment;

    const popOverDimensions = popoverElem.getBoundingClientRect();
    const isHorizontal = popoverside === "top" || popoverside === "bottom";
    const popoverLength = isHorizontal
      ? popOverDimensions.width
      : popOverDimensions.height;
    const viewportLength = isHorizontal
      ? document.documentElement.clientWidth
      : window.innerHeight;
    const offscreenAlignment =
      popoverside === "top" || popoverside === "left" ? "end" : "start";

    if (elementPosSecondaryAxis + elementLength <= 0) {
      tipSide = isHorizontal ? "right" : "bottom";
      tipAlignment = offscreenAlignment;
    } else if (elementPosSecondaryAxis + elementLength - popoverLength <= 0)
      tipAlignment = "start";

    if (elementPosSecondaryAxis >= viewportLength) {
      tipSide = isHorizontal ? "left" : "top";
      tipAlignment = offscreenAlignment;
    } else if (elementPosSecondaryAxis + popoverLength >= viewportLength)
      tipAlignment = "end";

    // reset previous classes
    this.clearPopoverTipPosition();

    popoverTipElem.classList.add(
      `boarding-tipside-${tipSide}`,
      `boarding-tipalign-${tipAlignment}`
    );

    // Keep the existing direction changes when the target is outside the viewport.
    if (tipSide !== popoverside)
      return;

    const popoverPadding = parseFloat(
      window.getComputedStyle(popoverElem)[
        isHorizontal ? "paddingLeft" : "paddingTop"
      ]
    );
    const tipHalfSize = this.getPopoverDimensions().tipSize / 2;
    const tipInset = popoverPadding + tipHalfSize;
    let targetPosition = elementPosSecondaryAxis + elementLength / 2;
    if (alignment === "start")
      targetPosition = elementPosSecondaryAxis - this.padding + tipInset;
    else if (alignment === "end")
      targetPosition =
        elementPosSecondaryAxis + elementLength + this.padding - tipInset;

    const tipCenter = Math.max(
      tipInset,
      Math.min(
        popoverLength - tipInset,
        targetPosition - popoverPosSecondaryAxis
      )
    );

    // Use the calculated destination, since the popover has not moved there yet.
    popoverTipElem.style[isHorizontal ? "left" : "top"] = `${tipCenter}px`;
    popoverTipElem.style[isHorizontal ? "right" : "bottom"] = "auto";
    popoverTipElem.style[isHorizontal ? "marginLeft" : "marginTop"] =
      `-${tipHalfSize}px`;
  }
}

export default SmartPosition;
