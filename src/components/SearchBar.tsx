import { Icon } from '@iconify/react';
import searchFill from '@iconify/icons-ic/search';
// material
import {
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography
} from '@mui/material';
import React, { useState } from 'react';

//

type SearchBarProps = {
  placeholder: string;
  searchValue: string;
  searchCallback: (search: string) => void;
  searchResultsLength: number;
  filterComponent?: React.ReactNode | undefined;
  dateFilterComponent?: React.ReactNode | undefined;
};

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder,
  searchValue,
  searchCallback,
  searchResultsLength,
  filterComponent = undefined,
  dateFilterComponent = undefined
}) => {
  const flexSizes =
    filterComponent && dateFilterComponent
      ? { xs: 10, lg: 10 }
      : filterComponent || dateFilterComponent
        ? { xs: 11, lg: 11 }
        : { xs: 12, lg: 12 };
  return (
    <>
      <Grid container direction={'row'}>
        <Grid item xs={flexSizes.xs} lg={flexSizes.lg}>
          <TextField
            fullWidth
            label={placeholder}
            value={searchValue}
            onChange={(e) => searchCallback(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => searchCallback(searchValue)} edge="end">
                    <Icon icon={searchFill} />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>
        {filterComponent && (
          <Grid item xs={1} lg={1} sx={{ textAlign: "center", pl: { lg: 1 } }}>
            {filterComponent}
          </Grid>
        )}
        {dateFilterComponent && (
          <Grid item xs={1} lg={1} sx={{ textAlign: "center" }}>
            {dateFilterComponent}
          </Grid>
        )}
      </Grid>
      {searchValue !== '' && (
        <Typography variant="body2" color="text.secondary">
          Hay {searchResultsLength} resultados con tu búsqueda "{searchValue}
          ".
        </Typography>
      )}
    </>
  );
};

const SearchBarOnClick: React.FC<SearchBarProps> = ({
  placeholder,
  searchValue,
  searchCallback,
  searchResultsLength,
  filterComponent = undefined,
  dateFilterComponent = undefined
}) => {
  const [searchCalled, setSearchCalled] = useState(searchValue !== '');
  const flexSizes =
    filterComponent && dateFilterComponent
      ? { xs: 10, lg: 10 }
      : filterComponent || dateFilterComponent
        ? { xs: 11, lg: 11 }
        : { xs: 12, lg: 12 };
  return (
    <>
      <Grid container direction={'row'}>
        <Grid item xs={flexSizes.xs} lg={flexSizes.lg}>
          <TextField
            fullWidth
            label={placeholder}
            value={searchValue}
            onChange={(e) => searchCallback(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setSearchCalled(true);
                searchCallback(searchValue + '\n');
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => {
                    setSearchCalled(true);
                    searchCallback(searchValue + '\n')
                  }} edge="end">
                    <Icon icon={searchFill} />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>
        {filterComponent && (
          <Grid item xs={1} lg={1} sx={{ textAlign: "center", pl: { lg: 1 } }}>
            {filterComponent}
          </Grid>
        )}
        {dateFilterComponent && (
          <Grid item xs={1} lg={1} sx={{ textAlign: "center" }}>
            {dateFilterComponent}
          </Grid>
        )}
      </Grid>
      {searchValue !== '' && searchCalled && (
        <Typography variant="body2" color="text.secondary">
          Hay {searchResultsLength} resultados con tu búsqueda "{searchValue}
          ".
        </Typography>
      )}
    </>
  );
};

export default SearchBar;
export { SearchBarOnClick };