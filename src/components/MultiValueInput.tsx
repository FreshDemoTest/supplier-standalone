import { Box, Button, Chip, Grid, TextField } from "@mui/material";
import { ChangeEvent, useState } from "react";
import SearchInput from "./SearchInput";

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
type MultiValueInputProps = {
  selectedOptions: KeyValueOption[];
  onAdd: (option: KeyValueOption) => void;
  onRemove: (option: KeyValueOption) => void;
  valueKey: string
};

export const MultiValueInput: React.FC<MultiValueInputProps> = ({
  selectedOptions,
  onAdd,
  onRemove,
  valueKey
}) => {
  const [tagValStr, setTagValStr] = useState("");

  const handleTagValStr = (e: ChangeEvent<HTMLInputElement>) => {
    setTagValStr(e.target.value);
  };

  return (
    <Grid container spacing={1}>
      {/* Add new tag section */}
      <Grid item xs={8} md={8}>
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
          disabled={tagValStr === ""}
          sx={{ mt: 1 }}
          onClick={() => {
            onAdd({ key: valueKey.trim(), value: tagValStr.trim() });
            setTagValStr("");
          }}
        >
          Agregar
        </Button>
      </Grid>
      {/* Display tags sections */}
      <Grid item xs={12} md={12}>
        <Box sx={{ display: "flex", flexWrap: "wrap" }}>
          {selectedOptions.map((opt) => (
            <Chip
              key={opt.value.trim()}
              label={
                <>
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

type OptionType = {
  label: string;
  value: string;
};

type SelectedMultiValueInputProps = {
  options: OptionType[];
  label: string;
  selectedOptions: OptionType[];
  onSelectOption: (option: OptionType) => void;
  onRemove: (option: OptionType) => void;
};

export const SelectedMultiValueInput: React.FC<SelectedMultiValueInputProps> = ({
  options,
  selectedOptions,
  onSelectOption,
  onRemove,
  label
}) => {

  return (
    <Grid container spacing={1}>
      {/* Add new tag section */}
      <Grid item xs={12} md={12}>
        <SearchInput
          label={label}
          fullWidth={true}
          options={options.map((v) => ({
            value: v.label,
            label: v.value,
          }))}
          onSelectOption={(e: any) => {
            onSelectOption({label: e.label, value: e.value});
          }}
          initialSize={10000}
        />
      </Grid>
      {/* Display tags section */}
      <Grid item xs={12} md={12}>
        <Box sx={{ display: "flex", flexWrap: "wrap", mt: 0 }}>
          {selectedOptions.map((opt) => (
            <Chip
              key={opt.value.trim()}
              label={<b>{opt.label.trim()}</b>}
              onDelete={() => onRemove(opt)}
              sx={{ m: 0.5 }}
            />
          ))}
        </Box>
      </Grid>
    </Grid>
  );
};
