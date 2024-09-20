import { Icon } from '@iconify/react';
import { useEffect, useRef, useState } from 'react';
import FiltersFill from '@iconify/icons-ic/filter-list';
// material
import {
  Box,
  Divider,
  MenuItem,
  IconButton,
  Button,
  InputLabel,
  FormControl,
  Select,
  OutlinedInput,
  Checkbox,
  ListItemText,
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// hooks
// routes
// components
import MenuPopover from './MenuPopover';

// ----------------------------------------------------------------------

const ITEM_HEIGHT = 32;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      my: 8,
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 220
    }
  }
};

// ----------------------------------------------------------------------
type FilterOption = {
  label: string;
  key: string;
  options: string[];
};

type FiltersPopoverProps = {
  filterOptions: FilterOption[];
  filtersState: any;
  action: (selected: any) => void;
};

const FiltersPopover: React.FC<FiltersPopoverProps> = ({ filterOptions, filtersState, action }) => {
  const anchorRef = useRef(null);
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  // FilterStore is the local copy of FilterState -- initialized with all empty Filter Options
  const [filterStore, setFilterStore] = useState(
    filterOptions
      .map((option) => [option.key, []])
      .reduce((obj: any, item: any) => {
        obj[item[0]] = item[1];
        return obj;
      }, {})
  );

  // on filterState change
  useEffect(() => {
    const _filterState = { ...filtersState };
    setFilterStore(_filterState);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersState]);

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (event: any, key: string) => {
    setFilterStore({
      ...filterStore,
      [key]: event.target.value
    });
  };

  const handleOnApply = () => {
    const _filterState = { ...filtersState };
    filterOptions.forEach((option) => {
      _filterState[option.key] = filterStore[option.key];
    });
    action(_filterState);
    handleClose();
  };

  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={handleOpen}
        sx={{
          px: 1
        }}
      >
        <Icon icon={FiltersFill} width={28} height={28} />
      </IconButton>

      <MenuPopover
        open={open}
        onClose={handleClose}
        anchorEl={anchorRef.current || undefined}
        sx={{ width: 280 }}
      >
        {filterOptions.map((option) => (
          <div key={option.key}>
            <Accordion
              sx={{
                px: theme.spacing(1),
                pt: theme.spacing(1),
                boxShadow: 'none'
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                {option.label}
              </AccordionSummary>
              <AccordionDetails>
                {option.options.length > 0 && (
                  <FormControl sx={{ width: '100%' }}>
                    <InputLabel id={`ch-l-${option.key}`}>
                      {option.label}
                    </InputLabel>
                    <Select
                      labelId={`ch-l-${option.key}`}
                      id={`ch-${option.key}`}
                      multiple
                      value={filterStore[option.key]}
                      onChange={(e: any) => handleChange(e, option.key)}
                      input={<OutlinedInput label={option.label} />}
                      renderValue={(selected) => selected.join(', ')}
                      MenuProps={MenuProps}
                    >
                      {option.options.map((name) => (
                        <MenuItem key={name} value={name}>
                          <Checkbox
                            checked={filterStore[option.key].indexOf(name) > -1}
                          />
                          <ListItemText primary={name} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                {option.options.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    {`No hay opciones filtros para ${option.label}`}
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
            <Divider sx={{ my: 1 }} />
          </div>
        ))}

        <Box sx={{ py: 1, px: 2, textAlign: 'right' }}>
          <Button variant="contained" size={'medium'} onClick={handleOnApply}>
            Aplicar
          </Button>
        </Box>
      </MenuPopover>
    </>
  );
};

export default FiltersPopover;
