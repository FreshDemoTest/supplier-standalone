import { Fragment, useState } from "react";
// material
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import arrowDownSFill from "@iconify/icons-eva/arrow-down-fill";
import arrowUpSFill from "@iconify/icons-eva/arrow-up-outline";
// components
import SelectCardItem from "./SelectCardItem";
import SearchBar from "./SearchBar";
import { Icon } from "@iconify/react";
import LoadingProgress from "./LoadingProgress";

// ----------------------------------------------------------------------

type MultiItemOption = {
  id: string;
  title: string;
  subtitle: string;
  tag?: { key: string; label: string; bgColor: string };
};

type MultiSearchSelectionProps = {
  sectionTitle: string;
  noItemsText?: string;
  searchHint?: string;
  pickedItems: (MultiItemOption & { checked: boolean })[];
  setPickedItems: (items: (MultiItemOption & { checked: boolean })[]) => void;
  itemOptions: MultiItemOption[];
  maxHeight?: number;
  sx?: any;
  selectionMsg?: string;
  filterViewSelected?: boolean;
  loading?: boolean;
  sortValsDefault?: boolean;
};

const MultiSearchSelect: React.FC<MultiSearchSelectionProps> = ({
  sectionTitle,
  searchHint = "Buscar...",
  noItemsText = "No hay elementos",
  pickedItems,
  setPickedItems,
  itemOptions,
  maxHeight = 240,
  sx,
  selectionMsg,
  filterViewSelected = false,
  loading = false,
  sortValsDefault = false,
}) => {
  const [search, setSearch] = useState("");
  const [sortVals, setSortVals] = useState(sortValsDefault);
  const theme = useTheme();

  // search filter
  const filteredOpts = sortVals
    ? itemOptions
        .filter((opt) => {
          if (search === "") {
            return true;
          } else {
            return (
              opt.title.toLowerCase().includes(search.toLowerCase()) ||
              (opt.subtitle &&
                opt.subtitle.toLowerCase().includes(search.toLowerCase())) ||
              (opt.tag?.label &&
                opt.tag?.label.toLowerCase().includes(search.toLowerCase()))
            );
          }
        })
        .filter((opt) => {
          if (pickedItems.find((it) => it.id === opt.id)) {
            return true;
          } else {
            return false;
          }
        })
    : itemOptions.filter((opt) => {
        if (search === "") {
          return true;
        } else {
          return (
            opt.title.toLowerCase().includes(search.toLowerCase()) ||
            (opt.subtitle &&
              opt.subtitle.toLowerCase().includes(search.toLowerCase())) ||
            (opt.tag?.label &&
              opt.tag?.label.toLowerCase().includes(search.toLowerCase()))
          );
        }
      });

  const sortOnlySelected = () => {
    setSortVals(!sortVals);
  };

  // select item
  const onChangeItem = (item: MultiItemOption) => {
    if (pickedItems.find((it) => it.id === item.id)) {
      deselectItem(item);
    } else {
      setPickedItems([...pickedItems, { ...item, checked: true }]);
    }
  };

  // deselect item
  const deselectItem = (item: MultiItemOption) => {
    setPickedItems(pickedItems.filter((it) => it.id !== item.id));
  };

  return (
    <Card sx={{ ...sx }}>
      <CardHeader title={sectionTitle} />
      <CardContent>
        {/* Search bar */}
        <Grid container>
          <Grid item xs={12} md={filterViewSelected ? 8 : 12}>
            <SearchBar
              placeholder={searchHint}
              searchValue={search}
              searchCallback={setSearch}
              searchResultsLength={filteredOpts.length}
            />
          </Grid>
          <Grid
            item
            xs={12}
            md={filterViewSelected ? 4 : 0}
            sx={{ px: { xs: 0.5, md: 1.5 } }}
          >
            {filterViewSelected && itemOptions.length > 0 && (
              <Button
                fullWidth
                size="small"
                variant={!sortVals ? "outlined" : "contained"}
                color={!sortVals ? "primary" : "info"}
                onClick={sortOnlySelected}
                sx={{ mt: 1, mb: { xs: 1, md: 0.5 } }}
              >
                {!sortVals && (
                  <Fragment>
                    <Icon icon={arrowUpSFill} width={20} height={20} />
                    &nbsp;Ver Selección
                  </Fragment>
                )}
                {sortVals && (
                  <Fragment>
                    <Icon icon={arrowDownSFill} width={20} height={20} />
                    Ver Todos
                  </Fragment>
                )}
              </Button>
            )}
          </Grid>
        </Grid>

        {/* Optional msg */}
        {selectionMsg && (
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{
              pl: 2,
              pt: 1,
              pb: 1,
              fontWeight: theme.typography.fontWeightRegular,
            }}
          >
            {selectionMsg}
          </Typography>
        )}
        {/* Loading screen */}
        {loading && <LoadingProgress sx={{ mt: 3 }} />}

        {/* List of Suppliers */}
        <Box sx={{ mt: 1, maxHeight: maxHeight, overflowY: "scroll" }}>
          {!loading &&
            filteredOpts.map((opt) => (
              <Box key={opt.id} sx={{ mt: 1, ml: 0.5, mr: 1.5 }}>
                <SelectCardItem
                  title={opt.title}
                  subtitle={opt.subtitle}
                  rightTag={opt.tag}
                  onClick={() => onChangeItem(opt)}
                  checked={
                    pickedItems.find((it) => it.id === opt.id) ? true : false
                  }
                />
              </Box>
            ))}
        </Box>

        {/* No items msg */}
        {!loading && filteredOpts.length === 0 && (
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{
              pl: 2,
              pt: 1,
              fontWeight: theme.typography.fontWeightRegular,
            }}
          >
            {noItemsText}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default MultiSearchSelect;
export type { MultiItemOption };
