import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
  styled,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { reduceBoolArray } from "../utils/helpers";
import { useEffect, useState } from "react";

// ----------------------------------------------------------------------

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  "& .MuiAccordionSummary-content": {
    "&.Mui-expanded": {
      margin: theme.spacing(0),
    },
  },
}));

const ITEM_HEIGHT = 32;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
  PaperProps: {
    style: {
      my: 8,
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 220,
    },
  },
};

const GroupedMenuProps = {
  PaperProps: {
    style: {
      my: 8,
      maxHeight: ITEM_HEIGHT * 9 + ITEM_PADDING_TOP,
      width: 220,
    },
  },
};

// ----------------------------------------------------------------------

type MultiSelectProps = {
  label: string;
  options: Array<{ key: string; value: string; group?: string }>;
  onChange: (e: any) => void;
  value: string[];
};

// ----------------------------------------------------------------------

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  onChange,
  value,
  ...props
}) => {
  const revOpts: any = {};
  options.forEach((opt) => {
    revOpts[opt.key] = opt.value;
  });
  return (
    <FormControl sx={{ width: "100%" }}>
      <InputLabel id={`ch-l-${label.toLowerCase().replaceAll(" ", "-")}`}>
        {label}
      </InputLabel>
      <Select
        labelId={`ch-l-${label.toLowerCase().replaceAll(" ", "-")}`}
        id={`ch-${label.toLowerCase().replaceAll(" ", "-")}`}
        multiple
        value={value}
        onChange={onChange}
        input={<OutlinedInput label={label} />}
        renderValue={(selected) => {
          return selected.map((s) => revOpts[s]).join(", ");
        }}
        MenuProps={MenuProps}
      >
        {options.map((opt) => (
          <MenuItem key={opt.key} value={opt.key}>
            <Checkbox checked={value.indexOf(opt.key) > -1} />
            <ListItemText primary={opt.value} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

// ----------------------------------------------------------------------

const GroupedMultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options, // array of deliv zones { key, value, group }
  onChange,
  value, // array of strings (delivery zone keys)
  ...props
}) => {
  const [valueState, setValueState] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const [groupOpts, setGroupOpts] = useState<{
    [key: string]: { key: string; value: string; group?: string }[];
  }>({});

  // hook
  useEffect(() => {
    setValueState(new Set(value));
  }, [value]);

  // grouped options (dictionary of arrays)
  useEffect(() => {
    const _gOpts = options.reduce((acc, opt) => {
      // empty group
      if (!opt.group) return acc;
      // group exists
      if (!acc[opt.group]) {
        acc[opt.group] = [];
      }
      acc[opt.group].push(opt);
      return acc;
    }, {} as { [key: string]: { key: string; value: string; group?: string }[] });
    setGroupOpts(_gOpts);
  }, [options]);

  useEffect(() => {
    const newExpanded: { [key: string]: boolean } = {};
    Object.keys(groupOpts).forEach((g) => {
      newExpanded[g] = false;
    });
    setExpanded(newExpanded);
  }, [groupOpts]);

  // handlers
  const handleParentChangeBoxes = (groupKey: string, checked: boolean) => {
    // add or remove key from value
    if (checked) {
      // add all children from value
      onChange([...value, ...groupOpts[groupKey].map((v) => v.key)]);
    } else {
      const cpv = [...value];
      // remove all children from value
      const keysToRemove = groupOpts[groupKey].map((v) => v.key);
      onChange(cpv.filter((v) => !keysToRemove.includes(v)));
    }
  };

  const handleChangeBox = (key: string, checked: boolean) => {
    // add or remove key from value
    if (checked) {
      // add key to value
      onChange([...value, key]);
    } else {
      // remove key from value
      onChange(value.filter((v) => v !== key));
    }
  };

  return (
    <FormControl sx={{ width: "100%" }}>
      <InputLabel id={`ch-l-${label.toLowerCase().replaceAll(" ", "-")}`}>
        {label}
      </InputLabel>
      <Select
        labelId={`ch-l-${label.toLowerCase().replaceAll(" ", "-")}`}
        id={`ch-${label.toLowerCase().replaceAll(" ", "-")}`}
        multiple
        value={value}
        input={<OutlinedInput label={label} />}
        renderValue={(selected) => {
          // find groups selected
          let selGroupEls: string[] = [];
          const selGroups = Object.entries(groupOpts)
            .map((grp) => {
              const groupSelected = reduceBoolArray(
                grp[1].map((o) => valueState.has(o.key)),
                "and"
              );
              if (groupSelected) {
                selGroupEls = [...selGroupEls, ...grp[1].map((o) => o.value)];
              }
              return groupSelected ? grp[0] : null;
            })
            .filter((v): v is string => v !== null);

          const noDupsSelected = selected
            .filter((s) => !selGroupEls.includes(s))
            .reduce((acc, s) => {
              if (acc.includes(s)) return acc;
              return [...acc, s];
            }, [] as string[]);
          return (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {/* Render groups */}
              {selGroups.map((sg) => (
                <Chip
                  key={sg}
                  label={sg}
                  onDelete={() => handleParentChangeBoxes(sg, false)}
                  deleteIcon={
                    <CancelIcon
                      onMouseDown={(event) => event.stopPropagation()}
                    />
                  }
                />
              ))}
              {/* Render independent elements */}
              {noDupsSelected.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  onDelete={() => handleChangeBox(s, false)}
                  deleteIcon={
                    <CancelIcon
                      onMouseDown={(event) => event.stopPropagation()}
                    />
                  }
                />
              ))}
            </Box>
          );
        }}
        MenuProps={GroupedMenuProps}
      >
        {/* Display all groups */}
        {Object.entries(groupOpts).map((grp) => {
          const groupSelected = reduceBoolArray(
            groupOpts[grp[0]].map((o) => valueState.has(o.key)),
            "and"
          );
          const groupIndeterminate =
            reduceBoolArray(
              groupOpts[grp[0]].map((o) => valueState.has(o.key)),
              "or"
            ) && !groupSelected;
          return (
            <Accordion
              key={grp[0]}
              expanded={expanded[grp[0]]}
              onChange={(event, isExpanded) => {
                setExpanded({ ...expanded, [grp[0]]: isExpanded });
              }}
            >
              {/* Group permission */}
              <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                <FormControlLabel
                  label={grp[0]}
                  control={
                    <Checkbox
                      checked={groupSelected}
                      indeterminate={groupIndeterminate}
                      onChange={(e) =>
                        handleParentChangeBoxes(grp[0], e.target.checked)
                      }
                    />
                  }
                />
              </StyledAccordionSummary>
              {/* Children permissions */}
              <AccordionDetails sx={{ pt: 0, mt: -1 }}>
                <Box sx={{ display: "flex", flexDirection: "column", ml: 2 }}>
                  {expanded[grp[0]] &&
                    grp[1].map((p) => (
                      <FormControlLabel
                        key={p.key}
                        label={
                          <Typography variant="caption" color="text.secondary">
                            {p.value}
                          </Typography>
                        }
                        control={
                          <Checkbox
                            checked={valueState.has(p.key)}
                            onChange={(e) =>
                              handleChangeBox(p.key, e.target.checked)
                            }
                          />
                        }
                      />
                    ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Select>
    </FormControl>
  );
};

export default MultiSelect;
export { GroupedMultiSelect };
