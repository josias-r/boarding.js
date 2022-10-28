import { Boarding } from "./lib/main";
import Driver from "driver.js";
import "./lib/boarding.css";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <a id="vitesvg" href="https://vitejs.dev" target="_blank" style="margin: 10px; display: inline-block; position: relative;">
      x
    </a>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`;

const history: any[] = [];

const tour = new Boarding({
  onHighlighted: (ele) => {
    history.push(`HIGHLIGHTER: ${ele.highlightDomElement.innerText}`);
  },
  onDeselected: (ele) => {
    history.push(`DELECTED: ${ele.highlightDomElement.innerText}`);
  },
  onHighlightStarted: (ele) => {
    history.push(`HIGH STARTED: ${ele.highlightDomElement.innerText}`);
  },
  onNext: (ele) => {
    history.push(`NEXTed: ${ele.highlightDomElement.innerText}`);
  },
  onPrevious: (ele) => {
    history.push(`PREVIOUSed: ${ele.highlightDomElement.innerText}`);
  },
  onReset: (ele) => {
    history.push(`RESETed: ${ele.highlightDomElement.innerText}`);
  },
});
tour.defineSteps([
  {
    element: "#vitesvg",
    popover: { title: "Test", description: "description" },
    onNext: () => {
      history.push("ON NEXT firststep");
    },
    onPrevious: () => {
      history.push("ON PREVIOUS firststep");
    },
  },
  {
    element: "h1",
    popover: { title: "Test2", description: "description2" },
    onNext: () => {
      history.push("ON NEXT secondstep");
    },
    onPrevious: () => {
      history.push("ON PREVIOUS secondstep");
    },
  },
  {
    element: ".read-the-docs",
    popover: { title: "Test3", description: "description3" },
    onNext: () => {
      history.push("ON NEXT thirdstep");
    },
    onPrevious: () => {
      history.push("ON PREVIOUS thirdstep");
    },
  },
]);

tour.start();
tour.moveNext();
tour.movePrevious();
tour.moveNext();
tour.moveNext();
tour.moveNext();

// DRIVER JS COMPARISON

const history2: any[] = [];

const driverTour = new Driver({
  onHighlighted: (ele) => {
    history2.push(`HIGHLIGHTER: ${(ele.getNode() as HTMLElement).innerText}`);
  },
  onDeselected: (ele) => {
    history2.push(`DELECTED: ${(ele.getNode() as HTMLElement).innerText}`);
  },
  onHighlightStarted: (ele) => {
    history2.push(`HIGH STARTED: ${(ele.getNode() as HTMLElement).innerText}`);
  },
  onNext: (ele) => {
    history2.push(`NEXTed: ${(ele.getNode() as HTMLElement).innerText}`);
  },
  onPrevious: (ele) => {
    history2.push(`PREVIOUSed: ${(ele.getNode() as HTMLElement).innerText}`);
  },
  onReset: (ele) => {
    history2.push(`RESETed: ${(ele.getNode() as HTMLElement).innerText}`);
  },
});
driverTour.defineSteps([
  {
    element: "#vitesvg",
    popover: { title: "Test", description: "description" },
    onNext: () => {
      history2.push("ON NEXT firststep");
    },
    onPrevious: () => {
      history2.push("ON PREVIOUS firststep");
    },
  },
  {
    element: "h1",
    popover: { title: "Test2", description: "description2" },
    onNext: () => {
      history2.push("ON NEXT secondstep");
    },
    onPrevious: () => {
      history2.push("ON PREVIOUS secondstep");
    },
  },
  {
    element: ".read-the-docs",
    popover: { title: "Test3", description: "description3" },
    onNext: () => {
      history2.push("ON NEXT thirdstep");
    },
    onPrevious: () => {
      history2.push("ON PREVIOUS thirdstep");
    },
  },
]);

driverTour.start();
driverTour.moveNext();
driverTour.movePrevious();
driverTour.moveNext();
driverTour.moveNext();
driverTour.moveNext();

// console.log(history, history2);

if (history.join() === history2.join()) {
  console.log("HISTORY: ITS  THE SAME");
} else {
  console.error("HISTORY: ITS NOT THE SAME!!!!");
}

// console.log(history.join());
// console.log(history2.join());

tour.start();
