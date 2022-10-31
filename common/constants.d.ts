export declare const OVERLAY_OPACITY = 0.75;
export declare const OVERLAY_PADDING = 10;
export declare const POPOVER_OFFSET = 10;
export declare const SHOULD_ANIMATE_OVERLAY = true;
export declare const SHOULD_STRICT_CLICK_HANDLE = true;
export declare const SHOULD_OUTSIDE_CLICK_CLOSE = true;
export declare const ALLOW_KEYBOARD_CONTROL = true;
export declare const SHOULD_OUTSIDE_CLICK_NEXT = false;
export declare const ID_POPOVER = "boarding-popover-item";
export declare const CLASS_POPOVER_TIP = "boarding-popover-tip";
export declare const CLASS_CUTOUT = "boarding-coutout-svg";
export declare const CLASS_BTN_DISABLED = "boarding-disabled";
export declare const CLASS_CLOSE_ONLY_BTN = "boarding-close-only-btn";
export declare const ANIMATION_DURATION_MS = 300;
export declare const POPOVER_ELEMENT: (className?: string) => {
    popoverWrapper: HTMLDivElement;
    popoverTip: HTMLDivElement;
    popoverTitle: HTMLDivElement;
    popoverDescription: HTMLDivElement;
    popoverFooter: HTMLDivElement;
    popoverPrevBtn: HTMLButtonElement;
    popoverNextBtn: HTMLButtonElement;
    popoverCloseBtn: HTMLButtonElement;
    popoverFooterBtnGroup: HTMLSpanElement;
};
