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
  Typography,
} from "@mui/material";
import { Add as IconAdd, Close as IconClose } from "@mui/icons-material";

interface Props extends React.ComponentProps<typeof FormControl> {
  title: string;
  items: Array<{ id: string; name: string; subtitle?: string }>;
  disabled?: boolean;
  selectedId: string | undefined;
  setSelectedId: (value: string) => void;
  onCreateNew: () => void;
  onDelete: (id: string) => void;
}

/**
 * A list of items, each with a radio button and a delete button. Also includes
 * a button to create a new entry at the bottom.
 */
const RadioList: React.FC<Props> = ({
  title,
  items,
  disabled = false,
  selectedId,
  setSelectedId,
  onCreateNew,
  onDelete,
  ...rest
}) => {
  const labelId = `${title}-select`;
  return (
    <FormControl {...rest}>
      <FormLabel id={labelId}>{title}</FormLabel>

      <RadioGroup
        aria-labelledby={labelId}
        // `undefined` makes the group think it's in uncontrolled state
        value={selectedId ?? null}
        onChange={(e) => setSelectedId(e.target.value)}
      >
        <Stack direction="column">
          {items.map(({ name, id, subtitle }) => (
            <Box
              key={id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <FormControlLabel
                value={id}
                control={<Radio disabled={disabled} />}
                label={
                  <>
                    <Typography>{name}</Typography>
                    {subtitle && (
                      <Typography variant="subtitle2" color="text.secondary">
                        {subtitle}
                      </Typography>
                    )}
                  </>
                }
              />
              <IconButton
                aria-label={`delete ${name}`}
                size="small"
                disabled={disabled}
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
        disabled={disabled}
        onClick={() => onCreateNew()}
        sx={{ width: "100%" }}
      >
        Add
      </Button>
    </FormControl>
  );
};

export default RadioList;
