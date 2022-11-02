import { CLASS_CUTOUT } from "../common/constants";

export interface CutoutDefinition {
  hightlightBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  padding?: number;
  fillColor?: string;
  opacity?: number;
  animated?: boolean;
}

export function generateSvgCutoutPathString({
  hightlightBox,
  padding = 0,
}: CutoutDefinition) {
  const windowX = window.innerWidth;
  const windowY = window.innerHeight;

  const highlightBoxX1 = hightlightBox.x - padding;
  const highlightBoxY1 = hightlightBox.y - padding;
  const highlightBoxX2 = hightlightBox.x + hightlightBox.width + padding;
  const highlightBoxY2 = hightlightBox.y + hightlightBox.height + padding;
  return `M${windowX},0L0,0L0,${windowY}L${windowX},${windowY}L${windowX},0ZM${highlightBoxX2},${highlightBoxY1}L${highlightBoxX1},${highlightBoxY1}L${highlightBoxX1},${highlightBoxY2}L${highlightBoxX2},${highlightBoxY2}L${highlightBoxX2},${highlightBoxY1}Z`;
}

export function createSvgCutout({
  hightlightBox,
  padding = 0,
  fillColor = "rgb(0,0,0)",
  opacity = 1,
  animated = true,
}: CutoutDefinition) {
  const windowX = window.innerWidth;
  const windowY = window.innerHeight;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add(CLASS_CUTOUT);
  if (animated) {
    svg.classList.add(`${CLASS_CUTOUT}-animated`);
  }
  svg.setAttribute("viewBox", `0 0 ${windowX} ${windowY}`);
  svg.setAttribute("xmlSpace", "preserve");
  svg.setAttribute("xmlnsXlink", "http://www.w3.org/1999/xlink");
  svg.setAttribute("version", "version");
  svg.style.fillRule = "evenodd";
  svg.style.clipRule = "evenodd";
  svg.style.strokeLinejoin = "round";
  svg.style.strokeMiterlimit = "2";
  svg.style.zIndex = "10000";
  // styles
  svg.style.position = "fixed";
  svg.style.top = "0";
  svg.style.left = "0";
  svg.style.right = "0";
  svg.style.bottom = "0";
  svg.style.pointerEvents = "none";

  const cutoutPath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  // path
  cutoutPath.setAttribute(
    "d",
    generateSvgCutoutPathString({ hightlightBox, padding })
  );
  // path styles
  cutoutPath.style.fill = fillColor;
  cutoutPath.style.opacity = `${opacity}`;
  cutoutPath.style.pointerEvents = "auto";
  cutoutPath.style.cursor = "pointer";

  svg.appendChild(cutoutPath);
  return svg;
}
