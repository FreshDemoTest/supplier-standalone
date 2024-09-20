import { Box, Button, Chip, Grid, TextField } from "@mui/material";
import { ChangeEvent, useState } from "react";

// ----------------------------------------------------------------------------

export type KeyValueOption = {
  key: string;
  value: string;
};

const trimKeyValueOption = (option: KeyValueOption): KeyValueOption => {
  return {
    key: option.key.trim(),
    value: option.value.trim(),
  };
};


// props
type MultiKeyValueInputProps = {
  selectedOptions: KeyValueOption[];
  onAdd: (option: KeyValueOption) => void;
  onRemove: (option: KeyValueOption) => void;
};

export const MultiKeyValueInput: React.FC<MultiKeyValueInputProps> = ({
  selectedOptions,
  onAdd,
  onRemove,
}) => {
  const [tagStr, setTagStr] = useState("");
  const [tagValStr, setTagValStr] = useState("");

  const handleTagStr = (e: ChangeEvent<HTMLInputElement>) => {
    setTagStr(e.target.value);
  };

  const handleTagValStr = (e: ChangeEvent<HTMLInputElement>) => {
    setTagValStr(e.target.value);
  };

  return (
    <Grid container spacing={1}>
      {/* Add new tag section */}
      <Grid item xs={4} md={4}>
        <TextField
          fullWidth
          label="Etiqueta"
          value={tagStr}
          onChange={handleTagStr}
        />
      </Grid>
      <Grid item xs={4} md={4}>
        <TextField
          fullWidth
          label="Valor"
          value={tagValStr}
          onChange={handleTagValStr}
        />
      </Grid>
      <Grid item xs={1} md={1}></Grid>
      <Grid item xs={3} md={3}>
        <Button
          fullWidth
          variant="contained"
          color="info"
          disabled={tagStr === "" || tagValStr === ""}
          sx={{ mt: 1 }}
          onClick={() => {
            onAdd({ key: tagStr.trim(), value: tagValStr.trim() });
            setTagStr("");
            setTagValStr("");
          }}
        >
          Agregar
        </Button>
      </Grid>
      {/* Display tags sections */}
      <Grid item xs={12} md={12}>
        <Box sx={{ display: "flex", flexWrap: "wrap" }}>
          {selectedOptions.map((opt) => 
          (
            <Chip
              key={opt.key.trim()}
              label={
                <>
                  {`${opt.key.trim()}: `}
                  <b>{opt.value.trim()}</b>
                </>
              }
              onDelete={() => onRemove(trimKeyValueOption(opt))}
              sx={{ m: 0.5 }}
            />
          ))}
        </Box>
      </Grid>
    </Grid>
  );
};
