import React from "react";
import { BodyPart } from "../types";
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
} from "@chakra-ui/react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectBodyPart: (bodyPart: BodyPart) => void;
}

/**
 * A dumb component to render a modal with one button per body part
 */
const BetaMoveModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectBodyPart,
}) => {
  return (
    <Modal isOpen={isOpen} isCentered onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add a Move</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack direction="column">
            {Object.values(BodyPart).map((bodyPart) => (
              <Button key={bodyPart} onClick={() => onSelectBodyPart(bodyPart)}>
                {bodyPart}
              </Button>
            ))}
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default BetaMoveModal;
