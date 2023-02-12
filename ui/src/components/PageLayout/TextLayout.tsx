import { Box } from "@mui/material";

interface Props {
  children?: React.ReactNode;
}

const TextLayout: React.FC<Props> = ({ children }) => (
  <Box maxWidth="md" margin="0 auto">
    {children}
  </Box>
);

export default TextLayout;
