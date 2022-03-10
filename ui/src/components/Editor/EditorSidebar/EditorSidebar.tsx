import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  IconButton,
  Show,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";
import { HiMenu } from "react-icons/hi";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

/**
 * Wrapper for the sidebar next to the editor. Children should be provided by
 * the root editor, so that data/state/callbacks/etc. can more easily be passed
 */
const EditorSidebar: React.FC = ({ children }) => {
  // Switch between drawer (on small screens) and static sidebar
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true });

  return (
    <DndProvider backend={HTML5Backend} context={{}}>
      <Show below="md">
        <IconButton
          aria-label="Open drawer"
          icon={<HiMenu />}
          position="absolute"
          top={4}
          right={4}
          onClick={onOpen}
        />
        <Drawer placement="right" isOpen={isOpen} onClose={onClose}>
          <DrawerOverlay />

          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Edit Beta</DrawerHeader>

            <DrawerBody>
              <Stack direction="column">{children}</Stack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Show>
      <Show above="md">
        <Box padding={4}>{children}</Box>
      </Show>
    </DndProvider>
  );
};

export default EditorSidebar;
