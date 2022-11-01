/**
 * Mark all items partial except a few in TS
 */
export type PartialExcept<T, K extends keyof T> = Pick<T, K> & Partial<T>;

/**
 * Mark only a few items partial in TS
 */
export type PartialSome<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

/**
 * TS runtime check to make sure we are working with an Element
 */
export function assertIsElement(e: any | null): asserts e is Element {
  if (
    !e ||
    !("nodeType" in e && e.nodeType === 1 && typeof e.nodeName === "string")
  ) {
    throw new Error("Html Element expected");
  }
}

/**
 * Receives two arguments. If the second one is "undefined", return the first one, otherwise return the second one.
 */
export function checkOptionalValue<T1 extends any>(
  argOriginal: T1,
  argOptional?: T1
) {
  if (typeof argOptional === "undefined") {
    return argOriginal;
  }
  return argOptional;
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
 * Checks if an element is visible in viewport
 */
function isInView(element: HTMLElement) {
  const rect = element.getBoundingClientRect();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Brings the element to middle of the view port if not in view
 */
export function bringInView(
  element?: HTMLElement,
  scrollIntoViewOptions?: ScrollIntoViewOptions
) {
  if (!element || isInView(element)) {
    return;
  }

  element.scrollIntoView(scrollIntoViewOptions);
}
