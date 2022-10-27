/**
 * TS runtime check to make sure we are working with an HTMLElement
 */
export function assertIsHtmlElement(e: any | null): asserts e is HTMLElement {
  if (
    !e ||
    !("nodeType" in e && e.nodeType === 1 && typeof e.nodeName === "string")
  ) {
    throw new Error("Html Element expected");
  }
}

/**
 * TS runtime check to ensure var is not falsy
 */
export function assertVarIsNotFalsy<T extends any>(e?: T): asserts e is T {
  if (!e) {
    throw new Error(
      `Variable was expected to not be falsy, but isntead was: ${e}`
    );
  }
}

/**
 * Gets the CSS property from the given element
 */
export const getStyleProperty = (
  element: HTMLElement,
  propertyName: string,
  prefixVendor: boolean = false
): string => {
  if (prefixVendor) {
    const prefixes = ["", "-webkit-", "-ms-", "moz-", "-o-"];
    for (let counter = 0; counter < prefixes.length; counter++) {
      const prefixedProperty = prefixes[counter] + propertyName;
      const foundValue = getStyleProperty(element, prefixedProperty);

      if (foundValue) {
        return foundValue;
      }
    }

    return "";
  }

  let propertyValue = "";

  if (document.defaultView && document.defaultView.getComputedStyle) {
    propertyValue = document.defaultView
      .getComputedStyle(element, null)
      .getPropertyValue(propertyName);
  }

  return propertyValue && propertyValue.toLowerCase
    ? propertyValue.toLowerCase()
    : propertyValue;
};

/**
 * Checks if the passed element is dom object or not
 */
export const isDomElement = function (element: unknown): boolean {
  const result =
    element && typeof element === "object" && "nodeType" in element;
  return !!result;
};
