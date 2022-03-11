import { extendTheme, type ThemeConfig } from "@chakra-ui/react";
import { BodyPart } from "components/Editor/EditorOverlay/types";

const config: ThemeConfig = {
  // All dark, all the time
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors: {
    [`bodyPart_${BodyPart.LEFT_HAND}`]: "yellow",
    [`bodyPart_${BodyPart.RIGHT_HAND}`]: "lightcoral",
    [`bodyPart_${BodyPart.LEFT_FOOT}`]: "lightgreen",
    [`bodyPart_${BodyPart.RIGHT_FOOT}`]: "lightblue",
  },
});

export default theme;
