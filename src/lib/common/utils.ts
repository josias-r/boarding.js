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
