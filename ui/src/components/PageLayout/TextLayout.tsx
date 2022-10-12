import { Box, useTheme } from "@mui/material";

interface Props {
  children?: React.ReactNode;
}

const TextLayout: React.FC<Props> = ({ children }) => {
  const { breakpoints } = useTheme();
  return (
    <Box maxWidth={breakpoints.values.md} margin="0 auto">
      {children}
    </Box>
  );
};

export default TextLayout;
