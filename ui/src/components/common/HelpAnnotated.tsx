import { Box, Tooltip } from "@mui/material";

interface Props {
  helpText: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Text annotated with a tooltip to provide help/context. The text will be
 * styled to indicate it's hoverable/tapable.
 */
const HelpAnnotated: React.FC<Props> = ({ helpText, children }) => {
  return (
    <Tooltip
      title={helpText}
      onClick={(e) => {
        // We don't want to trigger any underlying conditions, e.g. clicking
        // a link or closing a menu. The only way to open a tooltip on mobile
        // is clicking, so we can't rely just on hover.
        e.stopPropagation();
      }}
    >
      <Box
        component="span"
        sx={{ textDecoration: "underline dotted", cursor: "help" }}
      >
        {children}
      </Box>
    </Tooltip>
  );
};

export default HelpAnnotated;
