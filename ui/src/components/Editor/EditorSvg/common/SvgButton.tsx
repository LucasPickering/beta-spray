import { useTheme } from "@mui/material";
import { styleClickable } from "styles/svg";

interface Props {
  color?: "primary" | "secondary" | "success" | "error" | "info" | "warning";
  icon?: React.ReactElement;
  onClick?: React.MouseEventHandler<SVGGElement>;
}

const SvgButton: React.FC<Props> = ({ color = "info", icon, onClick }) => {
  const { palette } = useTheme();
  return (
    <g onClick={onClick}>
      <circle r={1.5} fill={palette[color].main} css={styleClickable} />
      {icon && <foreignObject>{icon}</foreignObject>}
    </g>
  );
};

export default SvgButton;
