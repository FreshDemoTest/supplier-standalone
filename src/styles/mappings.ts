import { Theme } from "@mui/material";
import { OrdenType } from "../domain/orden/Orden";
import { DeliveryType } from "../domain/supplier/SupplierProduct";

export const statusChip = (theme: Theme, orden: OrdenType) => {
  return {
    submitted: theme.palette.info.main,
    accepted: theme.palette.info.main,
    picking: theme.palette.secondary.light,
    shipping: theme.palette.secondary.light,
    delivered: theme.palette.primary.main,
    canceled: theme.palette.error.main,
  }[orden.status];
};

export const paystatusChip = (theme: Theme, orden: OrdenType) => {
  if (!orden.paystatus) return theme.palette.text.disabled;
  return {
    partially_paid: theme.palette.info.main,
    paid: theme.palette.info.main,
    unpaid: theme.palette.error.main,
    unknown: theme.palette.text.disabled,
  }[orden.paystatus];
};

export const deliveryTypeChip = (theme: Theme, delivery: DeliveryType) => {
  return {
    delivery: theme.palette.primary.light,
    pickup: theme.palette.secondary.light,
  }[delivery];
};
