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
export declare function generateSvgCutoutPathString({ hightlightBox, padding, }: CutoutDefinition): string;
export declare function createSvgCutout({ hightlightBox, padding, fillColor, opacity, animated, }: CutoutDefinition): SVGSVGElement;
