import { useRef, useState } from 'react';
// material
import {
  useTheme,
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Theme,
  Checkbox,
  IconButton,
  MenuItem,
  Chip,
  Stack
} from '@mui/material';
import { Icon } from '@iconify/react';
import MoreVerticalFill from '@iconify/icons-eva/more-vertical-fill';
// domain
import { ClientProfileType } from '../../domain/client/Client';
import { UnitType } from '../../domain/account/SUnit';
// components
import MenuPopover from '../MenuPopover';
// utils
import createAvatar from '../../utils/createAvatar';
import { getColor } from '../../utils/palette';
import MHidden from '../extensions/MHidden';

// ----------------------------------------------------------------------
type ClientCardProps = {
  client: ClientProfileType;
  theme: Theme;
  categories: { label: string; value: string }[];
  sunits?: UnitType[];
};

const ClientCard: React.FC<ClientCardProps> = ({
  client,
  theme,
  categories,
  sunits = []
}) => {
  const categ = categories.find((c) => c.value === client.clientCategory);
  const sunit = sunits.find((s) => s.id === client.business?.assignedUnit);
  const unitAvatar = createAvatar(sunit?.unitName || 'X');
  return (
    <Grid
      container
      spacing={0}
      sx={{ mt: theme.spacing(1), pl: theme.spacing(1) }}
    >
      {/* Left column */}
      <Grid item xs={12} lg={8}>
        <Typography variant="h6">
          {client?.business?.clientName} - {client.branchName || ''}
        </Typography>
        <Typography variant="body2" color={'text.secondary'}>
          {client.fullAddress || ''}
        </Typography>
        <Typography variant="body2" color={'text.secondary'}>
          Tel. {client.phoneNumber || ''}
        </Typography>
        <Stack direction={'row'} spacing={1}>
          {client.taxId && (
            <Chip
              label={'RFC: ' + client.taxId}
              variant="outlined"
              sx={{
                my: theme.spacing(1),
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.text.secondary,
                fontWeight: 'bold'
              }}
            />
          )}
          {/* Mobile */}
          <MHidden width="mdUp">
            <Box sx={{ flexGrow: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: theme.palette.info.main,
                  pt: theme.spacing(1),
                }}
                align="right"
              >
                <u>{categ?.label}</u>
              </Typography>
            </Box>
          </MHidden>
        </Stack>
      </Grid>
      {/* Right column */}
      <Grid
        item
        xs={12}
        lg={4}
        sx={{ textAlign: { xs: 'left', md: 'center' } }}
      >
        <Box>
          <Chip
            label={sunit?.unitName || ''}
            sx={{
              my: theme.spacing(1),
              backgroundColor: getColor(theme, unitAvatar.color).main,
              color: theme.palette.common.white,
              fontWeight: 'bold'
            }}
          />
          {/* Desktop */}
          <MHidden width="mdDown">
            <Typography
              variant="subtitle2"
              sx={{ color: theme.palette.info.main }}
            >
              <u>{categ?.label}</u>
            </Typography>
            {client.priceList && (
              <Chip
                label={client.priceList}
                variant="outlined"
                size="small"
                color= "success"
                sx={{
                  my: theme.spacing(1),
                  backgroundColor: theme.palette.primary.light,
                  fontWeight: 'bold'
                }}
              />
            )}
          </MHidden>
        </Box>
      </Grid>
    </Grid>
  );
};

// ----------------------------------------------------------------------

const CartClientCard: React.FC<ClientCardProps & { checked?: boolean }> = ({
  client,
  theme,
  categories,
  checked = false
}) => {
  const categ = categories.find((c) => c.value === client.clientCategory);
  return (
    <Grid container spacing={0} sx={{ mt: theme.spacing(0.5) }}>
      {/* Left column */}
      <Grid
        item
        xs={2}
        lg={2}
        sx={{ mt: { xs: theme.spacing(1), md: theme.spacing(1) } }}
      >
        <Checkbox checked={checked} sx={{ px: theme.spacing(0) }} />
      </Grid>
      {/* Mid column */}
      <Grid item xs={6} lg={6}>
        <Typography variant="h6" noWrap>
          {client.branchName || ''}
        </Typography>
        <Typography variant="body2" color={'text.secondary'}>
          {client.displayName || client?.business?.clientName || ''}
        </Typography>
      </Grid>
      {/* Right column */}
      <Grid item xs={4} lg={3} sx={{ textAlign: 'right' }}>
        <Box sx={{ mt: theme.spacing(2) }}>
          <Typography
            variant="subtitle2"
            sx={{ color: theme.palette.info.main }}
            noWrap
          >
            <u>{categ?.label}</u>
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
};

// ----------------------------------------------------------------------

type ClientCardItemProps = {
  client: ClientProfileType;
  onClick?: () => void;
  categories: { label: string; value: string }[];
  cardType?: 'listing' | 'cart';
  options?: { label: string; onClick?: () => void }[];
  sunits?: UnitType[];
  other?: any;
};

const ClientCardItem: React.FC<ClientCardItemProps> = ({
  client,
  onClick = () => {},
  categories,
  cardType = 'listing',
  options = [],
  sunits = [],
  other = {}
}) => {
  const anchorRef = useRef(null);
  const theme = useTheme();
  const [openMenu, setOpenMenu] = useState(false);

  const contentSize = 11;
  return (
    <Card
      sx={{
        mb: theme.spacing(0.5),
        boxShadow: theme.shadows[4]
      }}
    >
      <CardContent>
        <Grid container sx={{ cursor: 'pointer' }}>
          <Grid item xs={contentSize} lg={contentSize} onClick={onClick}>
            {cardType === 'listing' && (
              <ClientCard
                client={client}
                theme={theme}
                categories={categories}
                sunits={sunits}
              />
            )}
            {cardType === 'cart' && (
              <CartClientCard
                client={client}
                theme={theme}
                {...other}
                categories={categories}
              />
            )}
          </Grid>
          {options.length > 0 && (
            <Grid
              item
              xs={12 - contentSize}
              lg={12 - contentSize}
              textAlign={'right'}
            >
              <IconButton
                ref={anchorRef}
                sx={{ mt: -1 }}
                onClick={() => setOpenMenu(true)}
              >
                <Icon icon={MoreVerticalFill} />
              </IconButton>
              <MenuPopover
                open={openMenu}
                onClose={() => setOpenMenu(false)}
                anchorEl={anchorRef.current || undefined}
                sx={{ width: 160 }}
              >
                {options?.map((option) => {
                  const { label, onClick } = option;
                  return (
                    <MenuItem
                      key={label}
                      onClick={() => {
                        setOpenMenu(false);
                        if (onClick) {
                          onClick();
                        }
                      }}
                      sx={{ typography: 'body2', py: 1, px: 2.5 }}
                    >
                      {label}
                    </MenuItem>
                  );
                })}
              </MenuPopover>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ClientCardItem;
