import { useRef, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
// material
import {
  useTheme,
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  IconButton,
  MenuItem,
  Button
} from '@mui/material';
import { Icon } from '@iconify/react';
import MoreVerticalFill from '@iconify/icons-eva/more-vertical-fill';
// domain
import { UnitStateType, UnitType } from '../../domain/account/SUnit';
// hooks
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import useAuth from '../../hooks/useAuth';
// redux
import {
  deleteUnit,
  getUnits,
  setActiveUnitSuccess
} from '../../redux/slices/account';
// routes
import { PATH_APP } from '../../routes/paths';
// components
import MAvatar from '../extensions/MAvatar';
import MenuPopover from '../MenuPopover';
// utils
import createAvatar from '../../utils/createAvatar';
import { delay } from '../../utils/helpers';
import BasicDialog from '../navigation/BasicDialog';
import LoadingProgress from '../LoadingProgress';
import MHidden from '../extensions/MHidden';

//
type UnitCardItemProps = {
  unit: (UnitType & { fullAddress: string }) | UnitStateType;
};

const UnitCardItem: React.FC<UnitCardItemProps> = ({ unit }) => {
  const theme = useTheme();
  const { sessionToken } = useAuth();
  const anchorRef = useRef(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [openDeleteUnitMenu, setOpenDeleteUnitMenu] = useState(false);
  const avatar = createAvatar(unit.unitName);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { business, isLoading } = useAppSelector((state) => state.account);

  const handleOnClick = () => {
    // activate the selected unit & navigate to the list of orders
    dispatch(setActiveUnitSuccess(unit));
    navigate(PATH_APP.orden.list);
  };

  const options = [
    {
      label: 'Editar CEDIS',
      onClick: () => {
        navigate(PATH_APP.account.unit.edit.replace(':unitId', unit.id || ''));
      }
    },
    {
      label: 'Eliminar CEDIS',
      onClick: () => setOpenDeleteUnitMenu(true)
    }
  ];

  const handleDeleteUnit = async () => {
    try {
      await dispatch(deleteUnit(unit.id || '', sessionToken || ''));
      enqueueSnackbar('CEDIS eliminado', {
        variant: 'success'
      });
      await delay(500);
      dispatch(getUnits(business, sessionToken || ''));
    } catch (error) {
      console.error(error);
      enqueueSnackbar('No se pudo eliminar la CEDIS', {
        variant: 'error'
      });
    }
  };

  return (
    <>
      <BasicDialog
        open={openDeleteUnitMenu}
        title="Eliminar CEDIS"
        msg="¿Estás seguro que deseas eliminar esta CEDIS?"
        onClose={() => setOpenDeleteUnitMenu(false)}
        continueAction={{
          active: true,
          msg: 'Si, eliminar',
          actionFn: handleDeleteUnit
        }}
        backAction={{
          active: true,
          msg: 'No',
          actionFn: () => setOpenDeleteUnitMenu(false)
        }}
        closeMark={true}
      >
        <>{isLoading && <LoadingProgress />}</>
      </BasicDialog>

      <Card sx={{ mb: theme.spacing(1) }}>
        <CardContent>
          <Grid container spacing={1}>
            <Grid
              item
              xs={3}
              lg={2}
              onClick={handleOnClick}
              sx={{ cursor: 'pointer' }}
            >
              <Box
                sx={{
                  pl: { xs: theme.spacing(1), lg: theme.spacing(2) }
                }}
              >
                <MAvatar
                  src={''}
                  alt={unit.unitName}
                  color={avatar.color}
                  sx={{
                    width: theme.spacing(6),
                    height: theme.spacing(6),
                    fontSize: theme.typography.h6.fontSize,
                    fontWeight: theme.typography.h6.fontWeight
                  }}
                  {...{ variant: 'circular' }}
                >
                  {avatar.name}
                </MAvatar>
              </Box>
            </Grid>
            <Grid
              item
              xs={6}
              lg={7}
              onClick={handleOnClick}
              sx={{ cursor: 'pointer' }}
            >
              <Typography variant="h6" color="text.secondary">
                {unit.unitName}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ pr: 0.5 }}
              >
                {unit.fullAddress}
              </Typography>
            </Grid>
            <Grid item xs={3} lg={3} textAlign={'right'}>
              {/* Desktop */}
              <MHidden width="mdDown">
                <Button
                  size="small"
                  ref={anchorRef}
                  variant="outlined"
                  sx={{
                    mt: 2,
                    color: theme.palette.grey[500],
                    borderColor: theme.palette.grey[500]
                  }}
                  onClick={() => setOpenMenu(true)}
                >
                  Ver Opciones
                </Button>
              </MHidden>
              {/* Mobile */}
              <MHidden width="mdUp">
                <IconButton ref={anchorRef} onClick={() => setOpenMenu(true)}>
                  <Icon icon={MoreVerticalFill} />
                </IconButton>
              </MHidden>
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
          </Grid>
        </CardContent>
      </Card>
    </>
  );
};

export default UnitCardItem;
