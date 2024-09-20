import { useState } from "react";
import { enqueueSnackbar } from "notistack";
// material
import { useTheme, Typography, Chip, Grid } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RunningWithErrorsIcon from "@mui/icons-material/RunningWithErrors";
// hooks
import { useAppSelector } from "../../redux/store";
// components
import MAvatar from "../extensions/MAvatar";
import ExpandableCard from "../ExpandableCard";
import BasicDialog from "../navigation/BasicDialog";
import LoadingProgress from "../LoadingProgress";
// utils
import createAvatar from "../../utils/createAvatar";
import { delay, fISODate, inXTime } from "../../utils/helpers";
// domain
import { SupplierPriceListType } from "../../domain/supplier/SupplierPriceList";

// ----------------------------------------------------------------------

type SupplierPriceListCardItemProps = {
  priceList: SupplierPriceListType;
  onClick?: () => void;
};

const SupplierPriceListCardItem: React.FC<SupplierPriceListCardItemProps> = ({
  priceList,
  onClick,
}) => {
  const theme = useTheme();
  const { isLoading } = useAppSelector((state) => state.account);
  const [openDeleteUnitMenu, setOpenDeleteUnitMenu] = useState(false);
  const avatar = createAvatar(priceList.listName);

  const handleDeletePList = async () => {
    try {
      //   await dispatch(deleteUnit(priceList.id || '', sessionToken || ''));
      enqueueSnackbar("Lista de Precio eliminada", {
        variant: "success",
      });
      await delay(500);
      //   dispatch(getUnits(business, sessionToken || ''));
    } catch (error) {
      console.error(error);
      enqueueSnackbar("No se pudo eliminar la Lista de Precio", {
        variant: "error",
      });
    }
  };

  // render vars
  const isExpired = new Date(priceList.validUpto) < new Date(); // expired
  const isExpiring = new Date(priceList.validUpto) < inXTime(2) && !isExpired; // in 2 days but not expired

  return (
    <>
      <BasicDialog
        open={openDeleteUnitMenu}
        title="Eliminar Lista de Precio"
        msg="¿Estás seguro que deseas eliminar esta CEDIS?"
        onClose={() => setOpenDeleteUnitMenu(false)}
        continueAction={{
          active: true,
          msg: "Si, eliminar",
          actionFn: handleDeletePList,
        }}
        backAction={{
          active: true,
          msg: "No",
          actionFn: () => setOpenDeleteUnitMenu(false),
        }}
        closeMark={true}
      >
        <>{isLoading && <LoadingProgress />}</>
      </BasicDialog>

      <ExpandableCard
        title={
          <Typography variant="subtitle1" color="text.secondary">
            {priceList.listName}
          </Typography>
        }
        onClick={onClick}
        subtitle={
          <>
            <Typography variant="body2">
              Válida hasta <b>{fISODate(priceList.validUpto)}</b>
            </Typography>
            <Typography variant="caption" sx={{ mt: theme.spacing(0.5) }}>
              Últ. Actualización {fISODate(priceList.lastUpdated)}
            </Typography>
          </>
        }
        avatar={
          <MAvatar
            src={""}
            alt={priceList.listName}
            color={avatar.color}
            sx={{
              width: theme.spacing(6),
              height: theme.spacing(6),
              fontSize: theme.typography.h6.fontSize,
              fontWeight: theme.typography.h6.fontWeight,
            }}
            {...{ variant: "circular" }}
          >
            {avatar.name}
          </MAvatar>
        }
        actions={
          <Grid container sx={{ pl: 2 }}>
            <Grid item xs={5} md={2}>
              {priceList.isDefault && (
                <Chip
                  label={"Por defecto"}
                  color="primary"
                  size="small"
                  sx={{
                    fontWeight: theme.typography.fontWeightMedium,
                  }}
                  icon={<CheckCircleRoundedIcon color="primary" />}
                  variant="outlined"
                />
              )}
              {!priceList.isDefault && (
                <Typography
                  variant="body2"
                  align="left"
                  sx={{
                    pl: 0,
                    color: "text.secondary",
                    fontWeight: theme.typography.fontWeightMedium,
                  }}
                >
                  <b>Num. clientes</b>: {priceList.clients.length}
                </Typography>


              )}
            </Grid>
            <Grid item xs={7} md={4}>
              <Typography
                variant="body2"
                align="left"
                sx={{
                  pl: 3,
                  color: "text.secondary",
                  fontWeight: theme.typography.fontWeightMedium,
                }}
              >
                <b>Num. productos</b>: {priceList.pricesDetails.length}
              </Typography>

            </Grid>
            <Grid item xs={6} md={3}>
              {isExpiring && (
                <Chip
                  icon={<RunningWithErrorsIcon color="info" />}
                  color="info"
                  sx={{
                    fontWeight: theme.typography.fontWeightMedium,
                  }}
                  label={"Por expirar"}
                  size="small"
                  variant="outlined"
                />
              )}
              {isExpired && (
                <Chip
                  icon={<RunningWithErrorsIcon color="error" />}
                  color="error"
                  sx={{
                    fontWeight: theme.typography.fontWeightMedium,
                  }}
                  label={"Expirada"}
                  size="small"
                  variant="outlined"
                />
              )}
            </Grid>
          </Grid>
        }
      // options={options}
      // expandedContent={<PriceListTable prices={priceList.pricesDetails} />}
      />
    </>
  );
};

export default SupplierPriceListCardItem;
