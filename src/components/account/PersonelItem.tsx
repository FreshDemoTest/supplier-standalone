import { Icon } from '@iconify/react';
import MoreVerticalFill from '@iconify/icons-eva/more-vertical-fill';
// material
import {
  Box,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Typography
} from '@mui/material';
import { useRef, useState } from 'react';
import MenuPopover from '../MenuPopover';

type ItemOptions = {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
};

type PersonelItemProps = {
  topCaption?: string;
  mainLabel: string;
  subLabel?: string;
  options?: ItemOptions[];
  menuSx?: any;
};

const PersonelItem: React.FC<PersonelItemProps> = ({
  topCaption,
  mainLabel,
  subLabel,
  options,
  menuSx = {}
}) => {
  const anchorRef = useRef(null);
  const [openMenu, setOpenMenu] = useState(false);
  return (
    <Box sx={{ px: 2 }}>
      <Grid container spacing={0}>
        <Grid item xs={11} sm={11}>
          {topCaption && (
            <Typography variant="caption" color="text.secondary">
              {topCaption.toUpperCase()}
            </Typography>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {mainLabel}
          </Typography>
          {subLabel && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ flexGrow: 1 }}
            >
              {subLabel}
            </Typography>
          )}
        </Grid>
        <Grid item xs={1} sm={1}>
          {options && options.length > 0 && (
            <IconButton ref={anchorRef} onClick={() => setOpenMenu(true)}>
              <Icon icon={MoreVerticalFill} />
            </IconButton>
          )}
          <MenuPopover
            open={openMenu}
            onClose={() => setOpenMenu(false)}
            anchorEl={anchorRef.current || undefined}
            sx={{ width: 140, ...menuSx }}
          >
            {options?.map((option) => {
              const { label, icon, onClick, disabled } = option;
              return (
                <MenuItem
                  key={label}
                  disabled={disabled}
                  onClick={() => {
                    setOpenMenu(false);
                    if (onClick) {
                      onClick();
                    }
                  }}
                  sx={{ typography: 'body2', py: 1, px: 2.5 }}
                >
                  {icon && (
                    <Box sx={{ mr: 2, width: 24, height: 24 }}>{icon}</Box>
                  )}
                  {label}
                </MenuItem>
              );
            })}
          </MenuPopover>
        </Grid>
      </Grid>
      <Divider sx={{ mt: 1.5 }} />
    </Box>
  );
};

export default PersonelItem;
