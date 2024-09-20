import { useEffect, useState } from 'react';
// material
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { debounce } from '@mui/material';

type OptionType = {
  label: string;
  value: string;
  estate?: any;
};

type SearchInputProps = {
  options: OptionType[];
  label: string;
  onSelectOption: (option: OptionType) => void;
  defaultValue?: OptionType | undefined;
  fieldProps?: any;
  fullWidth?: boolean;
  searchOnLabel?: boolean;
  displayLabelFn?: (option: OptionType | string) => string;
  initialSize?: number;
  noOptionsText?: string;
};

const SearchInput: React.FC<SearchInputProps> = ({
  options,
  label,
  onSelectOption,
  defaultValue,
  fieldProps = {},
  fullWidth = true,
  searchOnLabel = false,
  displayLabelFn = (option: OptionType | string) =>
    (typeof option === 'string'
      ? option
      : searchOnLabel
      ? `${option.value} - ${option.label}`
      : option.value) as string,
  initialSize = 20,
  noOptionsText = 'No hay resultados'
}) => {
  const [value, setValue] = useState<OptionType | undefined>(defaultValue);
  const [inputValue, setInputValue] = useState('');
  const [lOptions, setOptions] = useState<OptionType[]>([]);

  const setLOptions = (options: OptionType[]) => {
    if (searchOnLabel) {
      setOptions(
        options
          .sort((a, b) => (a.label > b.label ? 1 : -1))
          .slice(0, initialSize)
      );
    } else {
      setOptions(
        options
          .sort((a, b) => (a.value > b.value ? 1 : -1))
          .slice(0, initialSize)
      );
    }
  };

  // hook - update options based on search
  useEffect(() => {
    debounce(() => {
      if (inputValue.length === 0 && value) {
        // update options to be rendered with first 20 elements if empty
        const _opts = options.slice(0, initialSize);
        setLOptions(_opts.concat(defaultValue ? [defaultValue] : []));
      } else if (inputValue.length > 0) {
        const filteredOptions = options.filter((option) => {
          return (
            option.value.toLowerCase().includes(inputValue.toLowerCase()) ||
            (searchOnLabel &&
              option.label.toLowerCase().includes(inputValue.toLowerCase()))
          );
        });
        setLOptions(filteredOptions);
      } else if (lOptions.length === 0) {
        // update options to be rendered with first 20 elements if empty
        const _opts = options.slice(0, initialSize);
        setLOptions(_opts.concat(defaultValue ? [defaultValue] : []));
      }
    }, 800)();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, options]);

  // hook - update value based on fieldProps
  useEffect(() => {
    if (value) {
      onSelectOption(value);
      // set LOption to value
      setLOptions([value]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Autocomplete
      id={`search-text-input-${label.toLowerCase().replaceAll(' ', '-')}`}
      getOptionLabel={displayLabelFn}
      filterOptions={(x) => x}
      disableClearable
      includeInputInList
      filterSelectedOptions
      value={value}
      fullWidth={fullWidth}
      noOptionsText={noOptionsText}
      options={lOptions}
      isOptionEqualToValue={(option, value) =>
        option
          ? typeof option === 'string' && typeof value === 'string'
            ? option === value
            : typeof option === 'string' && typeof value !== 'string'
            ? option === value.value
            : typeof option !== 'string' && typeof value === 'string'
            ? option.value === value
            : typeof option !== 'string' && typeof value !== 'string'
            ? option.value === value.value
            : false
          : false
      }
      onChange={(event: any, value: OptionType | string) => {
        if (typeof value !== 'string') {
          if (value.label !== 'No hay resultados') {
            setValue(value);
          }
        }
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          {...fieldProps}
          InputProps={{
            ...params.InputProps,
            type: 'search'
          }}
        />
      )}
    />
  );
};

export default SearchInput;
