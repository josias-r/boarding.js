import { Boarding } from "./lib/main";

// // min - no arg
// const tour1 = new Boarding();
// // min
// const tour2 = new Boarding({});

const tour = new Boarding({
  onDeselected: (el) => {
    console.log(el);
  },
  onHighlighted: (el) => {
    console.log(el);
  },
  onHighlightStarted: (el) => {
    console.log(el);
  },
  onReset: (el) => {
    console.log(el);
  },
  overlayClickNext: false,
  allowClose: false,
});

// min reqiured
tour.defineSteps([{ element: "#min" }]);
// min required w/ popover
tour.defineSteps([
  { element: "#min", popover: { title: "Min", description: "Min" } },
]);

tour.highlight("#min");
