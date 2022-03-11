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
    [BodyPart.LEFT_HAND]: "yellow",
    [BodyPart.RIGHT_HAND]: "lightcoral",
    [BodyPart.LEFT_FOOT]: "lightgreen",
    [BodyPart.RIGHT_FOOT]: "lightblue",
  },
});

export default theme;
