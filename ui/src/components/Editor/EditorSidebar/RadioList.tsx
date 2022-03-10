import React from "react";
import {
  Box,
  Text,
  Button,
  Flex,
  Radio,
  RadioGroup,
  Stack,
  Heading,
} from "@chakra-ui/react";

interface Props {
  title: string;
  items: Array<{ id: string; name: string }>;
  selectedId: string | undefined;
  setSelectedId: (value: string) => void;
  onCreateNew: () => void;
  onDelete: (id: string) => void;
}

/**
 * List all the betas for a problem
 */
const BetaList: React.FC<Props> = ({
  title,
  items,
  selectedId,
  setSelectedId,
  onCreateNew,
  onDelete,
}) => (
  <Box>
    <Heading size="md" as="h3">
      {title}
    </Heading>

    <RadioGroup value={selectedId} onChange={setSelectedId}>
      <Stack direction="column">
        {items.map(({ name, id }) => (
          <Flex key={id} justifyContent="space-between">
            <Radio value={id}>{name}</Radio>
            <Button onClick={() => onDelete(id)}>x</Button>
          </Flex>
        ))}
      </Stack>
    </RadioGroup>

    <Button onClick={() => onCreateNew()}>New</Button>
  </Box>
);

export default BetaList;
