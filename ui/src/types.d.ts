/**
 * Needed for SVGR imports
 * https://github.com/gregberge/svgr/issues/38
 */
declare module "./*.svg" {
  const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}
