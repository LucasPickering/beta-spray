interface Props extends React.SVGProps<SVGForeignObjectElement> {
  size?: number;
  x?: number;
  y?: number;
  children?: React.ReactNode;
}

const iconSizeForeign = 24; // Size of the foreign icon object (usually SVGIcon)

/**
 * Embed a Material SvgIcon into an SVG, via foreign object. Material includes
 * an <svg> tag for all its icons, meaning we have to go to HTML then back to
 * SVG to be able to render them.
 *
 * @param size Desired size of the icon, in SVG units
 * @param x Optional x offset
 * @param y Optional y offset
 */
const EmbeddedIcon: React.FC<Props> = ({
  size = 4,
  x = 0,
  y = 0,
  children,
  ...rest
}) => (
  // We assume the icon is a SvgIcon from material UI, which has a
  // known size. We'll scale the object down from that known size
  // to a size that want, to fit into the circle
  <foreignObject
    width={iconSizeForeign}
    height={iconSizeForeign}
    // Apply an offset to the center the icon, *plus* the user's input
    x={-iconSizeForeign / 2 + x}
    y={-iconSizeForeign / 2 + y}
    transform={`scale(${size / iconSizeForeign})`}
    {...rest}
  >
    {children}
  </foreignObject>
);

export default EmbeddedIcon;
