import "../styles/main.css";
import "../styles/themes/basic.css";
import { BoardingStepDefinition } from "./lib/boarding-types";
import { Boarding } from "./lib/main";
import hljs from "highlight.js";
import "highlight.js/styles/dark.css";

import "./styles/demo.css";

document.addEventListener("DOMContentLoaded", function () {
  const tourSteps: BoardingStepDefinition[] = [
    {
      element: document.getElementById("boarding-demo-head") as HTMLElement,
      popover: {
        className: "scoped-boarding-popover",
        title: "Before we start",
        description:
          "This is just one use-case, make sure to check out the rest of the docs below.",
        nextBtnText: "Okay, Start!",
        prefferedSide: "left",
        alignment: "center",
      },
    },
    {
      element: "#logo_img",
      padding: 5,
      popover: {
        title: "Focus Anything",
        description:
          "You can use it to highlight literally anything, images, text, div, span, li etc.",
      },
    },
    {
      element: "#name_boarding",
      popover: {
        title: "Why Boarding?",
        description: "Because it lets you drive the user across the page",
      },
    },
    {
      element: "#boarding-demo-head",
      popover: {
        title: "Let's talk features",
        description:
          "You may leave your mouse and use the <strong>arrow keys</strong> to move next and back or <strong>escape key</strong> anytime to close this",
        prefferedSide: "bottom",
      },
    },
    {
      element: "#highlight_feature",
      popover: {
        title: "Highlight Feature",
        description:
          "You may use it to highlight single elements (with or without popover) e.g. like facebook does while creating posts",
      },
    },
    {
      element: "#feature_introductions_feature",
      popover: {
        title: "Feature Introductions",
        description:
          "With it's powerful API you can use it to make programmatic or user driven feature introductions",
        prefferedSide: "bottom",
      },
    },
    {
      element: "#focus_shifters_feature",
      popover: {
        title: "Focus Shifters",
        description:
          "If some element or part of the page needs user's interaction, you can just call the highlight method. Boarding will take care of driving the user there",
        prefferedSide: "bottom",
      },
    },
    {
      element: "#customizable_feature",
      popover: {
        title: "Highly Customizable",
        description:
          "Boarding has a powerful API allowing you to customize the experience as much as you can.",
        prefferedSide: "bottom",
      },
    },
    {
      element: "#keyboard_feature",
      popover: {
        title: "User Friendly",
        description:
          "Your users can control it with the arrow keys on keyboard, or escape to close it",
        prefferedSide: "bottom",
      },
    },
    {
      element: "#free_use_feature",
      popover: {
        title: "MIT License",
        description:
          "I believe in open-source and thus Boarding is completely free for both personal or commercial use",
      },
    },
    {
      element: "#lightweight_feature",
      popover: {
        title: "Only ~4KB",
        description:
          "Boarding is free of bloat and written in Vanilla JS. There is no external dependency at all, thus keeping it smaller in size.",
      },
    },
    {
      element: "#examples_section",
      popover: {
        title: "Usage Examples",
        description:
          "Have a look at the usage examples and see how you can use it.",
      },
      scrollIntoViewOptions: "no-scroll",
    },
    {
      element: "#boarding-demo-head",
      popover: {
        title: "Quick Tour Ends",
        description:
          "This was just a sneak peak, have a look at the API section and examples to learn more!",
      },
      scrollIntoViewOptions: "no-scroll",
    },
  ];

  const animatedTourBoarding = new Boarding({
    animate: true,
    opacity: 0.8,
    padding: 10,
    showButtons: true,
  });

  const boringTourBoarding = new Boarding({
    animate: false,
    opacity: 0.8,
    padding: 10,
    showButtons: true,
    className: "boring-scope",
  });

  boringTourBoarding.defineSteps(tourSteps);
  animatedTourBoarding.defineSteps(tourSteps);

  document.querySelector("#animated-tour")?.addEventListener("click", () => {
    if (boringTourBoarding.isActivated) {
      boringTourBoarding.reset(true);
    }

    animatedTourBoarding.start();
  });

  document.querySelector("#boring-tour")?.addEventListener("click", () => {
    if (animatedTourBoarding.isActivated) {
      animatedTourBoarding.reset(true);
    }

    boringTourBoarding.start();
  });

  try {
    document.querySelectorAll<HTMLElement>("pre code").forEach((element) => {
      hljs.highlightElement(element);
    });
  } catch (e) {
    // Silently ignore the highlight errors
  }

  /////////////////////////////////////////////
  // First example – highlighting without popover
  /////////////////////////////////////////////
  const singleBoardingNoPopover = new Boarding();
  document
    .querySelector("#run-single-element-no-popover")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      singleBoardingNoPopover.highlight("#single-element-no-popover");
    });

  /////////////////////////////////////////////
  // Form focus examples
  /////////////////////////////////////////////
  const focusBoarding = new Boarding({ padding: 0 });
  const inputIds = [
    "creation-input",
    "creation-input-2",
    "creation-input-3",
    "creation-input-4",
  ];
  inputIds.forEach((inputId) => {
    // Highlight the section on focus
    document.getElementById(inputId)?.addEventListener("focus", () => {
      focusBoarding.highlight(`#${inputId}`);
    });
  });

  /////////////////////////////////////////////
  // Highlighting single element with popover
  /////////////////////////////////////////////
  const singleBoardingWithPopover = new Boarding();
  document
    .querySelector("#run-single-element-with-popover")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      singleBoardingWithPopover.highlight({
        element: "#single-element-with-popover",
        popover: {
          showButtons: false,
          title: "Did you know?",
          description: "You can add HTML in title or description also!",
          prefferedSide: "top",
        },
      });
    });

  /////////////////////////////////////////////////////
  // Highlighting single element with popover position
  /////////////////////////////////////////////////////
  const singleBoardingWithPopoverPosition = new Boarding();
  document
    .querySelector("#run-single-element-with-popover-position")
    ?.addEventListener("click", (e) => {
      e.preventDefault();

      singleBoardingWithPopoverPosition.highlight({
        element: "#single-element-with-popover-position",
        popover: {
          showButtons: false,
          title: "Did you know?",
          description: "You can add HTML in title or description also!",
          prefferedSide: "top",
        },
      });
    });

  /////////////////////////////////////////////////////
  // Highlighting single element with popover position
  /////////////////////////////////////////////////////
  const positionBtnsBoarding = new Boarding({
    padding: 0,
  });

  document.querySelector("#position-btns")?.addEventListener("click", (e) => {
    e.preventDefault();

    let id = (e.target as HTMLElement).id;
    let alignment = (e.target as HTMLElement).dataset.alignment;
    let preferredside = (e.target as HTMLElement).dataset.preferredside;

    positionBtnsBoarding.highlight({
      element: id
        ? `#${id}`
        : `#position-btns [data-alignment="${alignment}"][data-preferredside="${preferredside}"]`,
      popover: {
        showButtons: false,
        title: "Did you know?",
        description: "You can add HTML in title or description also!",
        alignment: alignment as any,
        prefferedSide: preferredside as any,
      },
    });
  });

  /////////////////////////////////////////////////////
  // Highlighting single element with popover position
  /////////////////////////////////////////////////////
  const htmlBoarding = new Boarding();

  document
    .querySelector("#run-single-element-with-popover-html")
    ?.addEventListener("click", (e) => {
      e.preventDefault();

      htmlBoarding.highlight({
        element: "#single-element-with-popover-html",
        popover: {
          showButtons: false,
          title: "<em>Tags</em> in title or <u>body</u>",
          description: "Body can also have <strong>html tags</strong>!",
          prefferedSide: "top",
        },
      });
    });

  /////////////////////////////////////////////////////
  // Without Overlay Example
  /////////////////////////////////////////////////////
  const withoutOverlay = new Boarding({
    opacity: 0,
    padding: 0,
  });

  document
    .querySelector("#run-element-without-popover")
    ?.addEventListener("click", (e) => {
      e.preventDefault();

      withoutOverlay.highlight({
        element: "#run-element-without-popover",
        popover: {
          title: "Title for the Popover",
          description: "Description for it",
          prefferedSide: "top", // can be `top`, `left`, `right`, `bottom`
        },
      });
    });

  /////////////////////////////////////////////
  // Single no close demo
  /////////////////////////////////////////////
  const singleNoClose = new Boarding({
    allowClose: false,
    prefferedSide: "top",
  });

  singleNoClose.defineSteps([
    {
      element: "#single-element-no-close",
      popover: {
        title: "Uh-huh!",
        description: "You cannot close by clicking outside",
      },
    },
    {
      element: "#third-element-introduction",
      popover: {
        title: "Title on Popover",
        description: "Body of the popover",
        prefferedSide: "top",
      },
    },
  ]);

  document
    .querySelector("#run-single-element-no-close")
    ?.addEventListener("click", function (e) {
      e.preventDefault();
      singleNoClose.start();
    });

  /////////////////////////////////////////////////////
  // Highlighting single element with popover position
  /////////////////////////////////////////////////////
  const featureIntroductionBoarding = new Boarding();
  featureIntroductionBoarding.defineSteps([
    {
      element: "#first-element-introduction",
      popover: {
        className: "first-step-popover-class",
        title: "Title on Popover",
        description: "Body of the popover",
        prefferedSide: "top",
      },
    },
    {
      element: "#second-para-feature-introductions",
      popover: {
        title: "Title on Popover",
        description: "Body of the popover",
        prefferedSide: "bottom",
      },
    },
    {
      element: "#third-para-feature-introductions",
      popover: {
        title: "Title on Popover",
        description: "Body of the popover",
        prefferedSide: "top",
      },
    },
    {
      element: "#run-multi-element-popovers",
      popover: {
        title: "Title on Popover",
        description: "Body of the popover",
        prefferedSide: "top",
      },
    },
    {
      element: "#third-element-introduction",
      popover: {
        title: "Title on Popover",
        description: "Body of the popover",
        prefferedSide: "top",
      },
    },
  ]);

  document
    .querySelector("#run-multi-element-popovers")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      featureIntroductionBoarding.start();
    });

  const newURL = location.href.split("?")[0];
  if (newURL !== location.href) {
    (window.location as any) = newURL;
    window.location.href = newURL;
  }
});
