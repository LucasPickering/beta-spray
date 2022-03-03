import { BodyPart } from "components/BetaEditor/__generated__/BetaDetails_betaNode.graphql";

// TODO rename to SVGPosition
export interface D3Position {
  x: number;
  y: number;
}

/**
 * An element with an on-image position, as defined by the API. Both x and y
 * are [0,1]
 */
export interface APIPosition {
  positionX: number;
  positionY: number;
}

/**
 * The different types of things we can drag around using React DnD
 */
export enum DragType {
  BetaMove = "betaMove",
}

/**
 * The different types of D3 elements that we may render on screen. We group
 * these under one type to force some level of typechecking, since there's no
 * way to propagate types through D3's selectors
 */
export type D3Data =
  | { kind: "hold"; position: D3Position; holdId: string }
  | {
      kind: "betaMove";
      position: D3Position;
      id: string;
      order: number;
      bodyPart: BodyPart;
    };

export function toD3Position(
  apiPosition: APIPosition,
  aspectRatio: number
): D3Position {
  return {
    x: apiPosition.positionX * 100,
    y: (apiPosition.positionY * 100) / aspectRatio,
  };
}

export function distanceTo(p1: D3Position, p2: D3Position): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

/**
 * Convert a CSS class name to a selector
 */
export function selector(className: string): string {
  return `.${className}`;
}

/**
 * Error for assertions around the D3Data type
 */
export class D3DataError extends TypeError {
  public constructor(expectedKind: D3Data["kind"], receivedData: D3Data) {
    super(
      `Expected D3 data to be of kind ${expectedKind}, but got: ${JSON.stringify(
        receivedData
      )}`
    );
  }
}
