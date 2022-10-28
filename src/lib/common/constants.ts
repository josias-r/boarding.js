export const OVERLAY_OPACITY = 0.75;
export const OVERLAY_PADDING = 10;

export const SHOULD_ANIMATE_OVERLAY = true;
export const SHOULD_STRICT_CLICK_HANDLE = true;
export const SHOULD_OUTSIDE_CLICK_CLOSE = true;
export const ALLOW_KEYBOARD_CONTROL = true;
export const SHOULD_OUTSIDE_CLICK_NEXT = false;

const ID_OVERLAY = "driver-page-overlay";
const ID_POPOVER = "driver-popover-item";

const CLASS_CLEARFIX = "driver-clearfix";
const CLASS_BTN_GROUP = "driver-btn-group";

export const CLASS_POPOVER_TIP = "driver-popover-tip";
const CLASS_POPOVER_TITLE = "driver-popover-title";
const CLASS_POPOVER_DESCRIPTION = "driver-popover-description";
const CLASS_POPOVER_FOOTER = "driver-popover-footer";
const CLASS_CLOSE_BTN = "driver-close-btn";
const CLASS_NEXT_STEP_BTN = "driver-next-btn";
const CLASS_PREV_STEP_BTN = "driver-prev-btn";
const CLASS_NAVIGATION_BTNS = "driver-navigation-btns";

export const CLASS_BTN_DISABLED = "driver-disabled";
export const CLASS_CLOSE_ONLY_BTN = "driver-close-only-btn";

// NOTE: It must match the one set in the animations in CSS file
export const ANIMATION_DURATION_MS = 300;

export const POPOVER_ELEMENT = (className = "") => {
  // create elements required
  const popoverWrapper = document.createElement("div");
  popoverWrapper.id = ID_POPOVER;
  popoverWrapper.className = className;

  const popoverTip = document.createElement("div");
  popoverTip.classList.add(CLASS_POPOVER_TIP);

  const popoverTitle = document.createElement("div");
  popoverTitle.classList.add(CLASS_POPOVER_TITLE);
  popoverTitle.innerText = "Popover Title";

  const popoverDescription = document.createElement("div");
  popoverDescription.classList.add(CLASS_POPOVER_DESCRIPTION);
  popoverDescription.innerText = "Popover Description";

  const popoverFooter = document.createElement("div");
  popoverFooter.classList.add(CLASS_POPOVER_FOOTER, CLASS_CLEARFIX);

  const popoverCloseBtn = document.createElement("button");
  popoverCloseBtn.classList.add(CLASS_CLOSE_BTN);
  popoverCloseBtn.innerText = "Close";

  const popoverFooterBtnGroup = document.createElement("span");
  popoverFooterBtnGroup.classList.add(CLASS_BTN_GROUP, CLASS_NAVIGATION_BTNS);

  const popoverPrevBtn = document.createElement("button");
  popoverPrevBtn.classList.add(CLASS_PREV_STEP_BTN);
  popoverPrevBtn.innerText = "&larr; Previous";

  const popoverNextBtn = document.createElement("button");
  popoverNextBtn.classList.add(CLASS_NEXT_STEP_BTN);
  popoverNextBtn.innerText = "Next &rarr;";

  // piece it all together
  popoverFooterBtnGroup.appendChild(popoverPrevBtn);
  popoverFooterBtnGroup.appendChild(popoverNextBtn);

  popoverFooter.appendChild(popoverCloseBtn);
  popoverFooter.appendChild(popoverFooterBtnGroup);

  popoverWrapper.appendChild(popoverTip);
  popoverWrapper.appendChild(popoverTitle);
  popoverWrapper.appendChild(popoverDescription);
  popoverWrapper.appendChild(popoverFooter);

  return {
    popoverWrapper,
    popoverTip,
    popoverTitle,
    popoverDescription,
    popoverFooter,
    popoverPrevBtn,
    popoverNextBtn,
    popoverCloseBtn,
    popoverFooterBtnGroup,
  };
};

export const OVERLAY_ELEMENT = () => {
  const overlayElement = document.createElement("div");
  overlayElement.id = ID_OVERLAY;
  return overlayElement;
};
