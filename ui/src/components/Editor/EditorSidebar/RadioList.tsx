import React from "react";
import {
  Box,
  Flex,
  Radio,
  RadioGroup,
  Stack,
  Heading,
  IconButton,
} from "@chakra-ui/react";
import { HiPlus, HiX } from "react-icons/hi";

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
  <Box my={8}>
    <Heading size="md" as="h3">
      {title}
    </Heading>

    <RadioGroup value={selectedId} onChange={setSelectedId}>
      <Stack direction="column">
        {items.map(({ name, id }) => (
          <Flex key={id} justifyContent="space-between">
            <Radio value={id}>{name}</Radio>
            <IconButton
              aria-label={`delete ${name}`}
              icon={<HiX />}
              size="sm"
              onClick={() => onDelete(id)}
            />
          </Flex>
        ))}
      </Stack>
    </RadioGroup>

    <IconButton
      aria-label={`New ${title}`}
      icon={<HiPlus />}
      width="100%"
      size="sm"
      marginTop={2}
      onClick={() => onCreateNew()}
    />
  </Box>
);

export default BetaList;
