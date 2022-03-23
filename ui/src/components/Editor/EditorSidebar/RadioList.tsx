import React from "react";
import {
  Radio,
  RadioGroup,
  Stack,
  IconButton,
  FormControl,
  FormLabel,
  Box,
  FormControlLabel,
  Button,
} from "@mui/material";
import { Add as IconAdd, Close as IconClose } from "@mui/icons-material";

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
}) => {
  const id = `${title}-select`;
  return (
    <FormControl>
      <FormLabel id={id}>{title}</FormLabel>

      <RadioGroup
        aria-labelledby={id}
        // `undefined` makes the group think it's in uncontrolled state
        value={selectedId ?? null}
        onChange={(e) => setSelectedId(e.target.value)}
      >
        <Stack direction="column">
          {items.map(({ name, id: itemId }) => (
            <Box
              key={id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <FormControlLabel
                value={itemId}
                control={<Radio />}
                label={name}
              />
              <IconButton
                aria-label={`delete ${name}`}
                size="small"
                onClick={() => onDelete(id)}
              >
                <IconClose />
              </IconButton>
            </Box>
          ))}
        </Stack>
      </RadioGroup>

      <Button
        size="small"
        variant="outlined"
        startIcon={<IconAdd />}
        onClick={() => onCreateNew()}
        sx={{ width: "100%" }}
      >
        Add
      </Button>
    </FormControl>
  );
};

export default BetaList;
