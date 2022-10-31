/**
 * Mark all items partial except a few in TS
 */
export declare type PartialExcept<T, K extends keyof T> = Pick<T, K> & Partial<T>;
/**
 * Mark only a few items partial in TS
 */
export declare type PartialSome<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
/**
 * TS runtime check to make sure we are working with an Element
 */
export declare function assertIsElement(e: any | null): asserts e is Element;
/**
 * TS runtime check to ensure var is not falsy
 */
export declare function assertVarIsNotFalsy<T extends any>(e?: T): asserts e is T;
/**
 * Brings the element to middle of the view port if not in view
 */
export declare function bringInView(element?: HTMLElement, scrollIntoViewOptions?: ScrollIntoViewOptions): void;
