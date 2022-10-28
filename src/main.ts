import { Boarding } from "./lib/main";
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

const tour = new Boarding();
tour.defineSteps([
  {
    element: "#vitesvg",
    popover: { title: "Test", description: "description" },
  },
  {
    element: "h1",
    popover: { title: "Test", description: "description" },
  },
]);

tour.start();
