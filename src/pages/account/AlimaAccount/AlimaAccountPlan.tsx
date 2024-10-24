// material
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Switch,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  styled,
  useTheme,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
// hooks
import { useAppDispatch } from "../../../redux/store";
import useAuth from "../../../hooks/useAuth";
// redux
import {
  getSupplierAlimaAccount,
  setMarketplaceVisibility,
} from "../../../redux/slices/account";
// components
import LoadingProgress from "../../../components/LoadingProgress";
// utils
import {
  fCurrency,
  fDateMonth,
  fPercentDec,
  findBillingPeriodEnd,
  findBillingPeriodStart,
} from "../../../utils/helpers";
import track from "../../../utils/analytics";
// domain
import {
  BusinessType,
  SupplierAlimaAccountType,
} from "../../../domain/account/Business";
// routes
import MHidden from "../../../components/extensions/MHidden";
import { ChargeConcept } from "./ChargesInfo";
import Decimal from "decimal.js";
import { PATHS_EXTERNAL } from "../../../routes/paths";

// ----------------------------------------------------------------------

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontWeight: theme.typography.fontWeightRegular,
  color: theme.palette.text.secondary,
}));

// ----------------------------------------------------------------------

const computeSaaSPlanDue = (
  charges: SupplierAlimaAccountType["charges"],
  discountCharges: SupplierAlimaAccountType["discounts"],
  activeCedis: number,
  period: "month" | "year" = "month"
) => {
  let totalDue = 0;
  // active charges
  charges.forEach((c) => {
    if (c.active === false) return;
    if (
      ["INVOICE_FOLIO", "MARKETPLACE_COMMISSION", "PAYMENTS"].includes(
        c.chargeType
      )
    )
      return;
    if (c.chargeType === "REPORTS") {
      // reports
      if (period === "year") {
        totalDue += c.chargeAmount * 12;
      } else {
        totalDue += c.chargeAmount;
      }
    } else {
      // saas fee
      if (period === "year") {
        totalDue += activeCedis * c.chargeAmount * 12;
      } else {
        totalDue += activeCedis * c.chargeAmount;
      }
    }
  });
  // valid discounts
  discountCharges?.forEach((d) => {
    if (d.validUpto < new Date()) return;
    if (d.chargeDiscountAmountType === "$") {
      if (period === "year") {
        totalDue -= d.chargeDiscountAmount * 12;
      }
      totalDue -= d.chargeDiscountAmount;
    } else {
      totalDue -= totalDue * d.chargeDiscountAmount;
    }
  });
  // return subtotal, tax and total
  const tax = new Decimal(totalDue * 0.16).toDecimalPlaces(2).toNumber();
  return {
    subtotal: new Decimal(totalDue).toDecimalPlaces(2).toNumber(),
    tax: tax,
    total: new Decimal(totalDue + tax).toDecimalPlaces(2).toNumber(),
  };
};

type SaasPlanProps = {
  charges: SupplierAlimaAccountType["charges"];
  discountCharges: SupplierAlimaAccountType["discounts"];
  activeCedis: number;
  totalDue: { subtotal: number; tax: number; total: number } | undefined;
  period: "month" | "year";
};

const SaaSPlan: React.FC<SaasPlanProps> = ({
  charges,
  discountCharges,
  activeCedis,
  totalDue,
  period = "month",
}) => {
  const formatChargeMainDescription = (
    chargeType: string,
    chargeDescription: string
  ) => {
    if (chargeType === "REPORTS") {
      return `Reporte ${chargeDescription}`;
    } else if (chargeType === "SAAS_FEE") {
      return chargeDescription || "Servicio de Software";
    }
    return chargeDescription;
  };

  const formatChargeSecondaryDescription = (
    chargeType: string,
    chargeDescription: string
  ) => {
    if (chargeType === "REPORTS") {
      return `Reporte`;
    } else if (chargeType === "SAAS_FEE") {
      return `CEDIS: ${activeCedis} U.`;
    } else if (chargeType === "INVOICE_FOLIO") {
      return `Por Encima de ${activeCedis * 200} Incluidos`;
    } else if (chargeType === "PAYMENTS") {
      return `Por Transacción`;
    }
    return chargeType;
  };

  // render vars
  const rndrCharges = [...charges];
  // sort charges
  rndrCharges.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));

  return (
    <Box sx={{ ml: 2, mr: 1 }}>
      {/* Active Charges */}
      {rndrCharges.map((c) => {
        if (c.active === false) return null;
        if (c.chargeType === "MARKETPLACE_COMMISSION") return null;
        const chargeAmount =
          period === "year" ? c.chargeAmount * 12 : c.chargeAmount;
        return (
          <ChargeConcept
            key={c.id}
            chargeType={formatChargeMainDescription(
              c.chargeType,
              c.chargeDescription
            )}
            chargeDescription={formatChargeSecondaryDescription(
              c.chargeType,
              c.chargeDescription
            )}
            chargeUnit={fCurrency(chargeAmount)}
            chargeAmount={
              c.chargeType === "REPORTS"
                ? chargeAmount
                : c.chargeType === "SAAS_FEE"
                ? activeCedis * chargeAmount
                : c.chargeType === "INVOICE_FOLIO"
                ? 0
                : c.chargeType === "PAYMENTS"
                ? 0
                : chargeAmount
            }
            isTotal={false}
          />
        );
      })}
      {/* Discounts */}
      {discountCharges?.map((dc) => {
        if (dc.validUpto < new Date()) return null;
        const discountAmount =
          period === "year"
            ? dc.chargeDiscountAmount * 12
            : dc.chargeDiscountAmount;
        return (
          <ChargeConcept
            key={dc.id}
            chargeType={dc.chargeDiscountDescription}
            chargeDescription={"DESCUENTO"}
            chargeUnit={
              dc.chargeDiscountAmountType === "$"
                ? fCurrency(-discountAmount)
                : fPercentDec(dc.chargeDiscountAmount * 100)
            }
            chargeAmount={
              dc.chargeDiscountAmountType === "$"
                ? -discountAmount
                : (totalDue?.subtotal || 0) * -dc.chargeDiscountAmount
            }
            isTotal={false}
          />
        );
      })}
      {/* Total  */}
      {totalDue ? (
        <>
          <Divider sx={{ my: 1 }} />
          {[
            { key: "subtotal", label: "Subtotal" },
            { key: "tax", label: "IVA 16%" },
            { key: "total", label: "Total" },
          ].map((t) => (
            <ChargeConcept
              key={t.key}
              chargeType=""
              chargeDescription=""
              chargeUnit={t.label}
              chargeAmount={totalDue[t.key as keyof typeof totalDue]}
              isTotal={true}
            />
          ))}
          <Divider sx={{ my: 1 }} />
        </>
      ) : null}
    </Box>
  );
};

// ----------------------------------------------------------------------

type AlimaAccountPlanProps = {
  business: BusinessType;
  alimaAccount: SupplierAlimaAccountType;
};

const AlimaAccountPlan: React.FC<AlimaAccountPlanProps> = ({
  business,
  alimaAccount,
}) => {
  const { sessionToken } = useAuth();
  const dispatch = useAppDispatch();
  const theme = useTheme();

  // account variables
  const accountType = (alimaAccount?.account?.accountName || "")
    .split("_")
    .join(" ")
    .toUpperCase();
  const numCEDIS = alimaAccount?.account?.activeCedis || "";
  // mktplace fee
  const mktFee = alimaAccount?.charges?.find(
    (c) => c.chargeType === "MARKETPLACE_COMMISSION"
  );
  const billingPeriod = accountType.toLowerCase().includes("anual")
    ? "year"
    : "month";
  // render vars
  const mktplaceActive = alimaAccount?.displayedInMarketplace || false;
  const mktplaceCommission = mktFee ? mktFee?.chargeAmount * 100 : 0;
  const totalDue = computeSaaSPlanDue(
    alimaAccount.charges,
    alimaAccount.discounts,
    numCEDIS || 1,
    billingPeriod
  );
  const currentStartDate = alimaAccount?.account?.createdAt
    ? findBillingPeriodStart(alimaAccount?.account?.createdAt, billingPeriod)
    : undefined;
  const currentEndDate = currentStartDate
    ? findBillingPeriodEnd(currentStartDate, billingPeriod)
    : undefined;

  // update display_in_marketplace on Supplier Business Account
  const handleMktplaceActive = async () => {
    try {
      if (!sessionToken) return;
      track("select_content", {
        visit: window.location.toString(),
        page: "AlimaAccount",
        section: "AlimaAccountPlan",
        mktplaceActive: !mktplaceActive,
      });
      await dispatch(
        setMarketplaceVisibility(
          business.id || "",
          !mktplaceActive,
          sessionToken
        )
      );
      await dispatch(getSupplierAlimaAccount(sessionToken));
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Error al actualizar la visibilidad en Marketplace", {
        variant: "warning",
      });
    }
  };

  return (
    <>
      {!alimaAccount?.account && <LoadingProgress sx={{ mt: 2 }} />}
      {alimaAccount?.account && (
        <Box sx={{ mt: 3 }}>
          {/* Mi Plan */}
          <Card>
            <CardContent>
              <MHidden width="smDown">
                {/* -- Desktop -- */}
                {/* Business name */}
                <StyledTypography variant="h6" mb={1}>
                  <b>{business?.businessName}</b>
                </StyledTypography>
                {/* Alima Supply Account Info */}
                <Box
                  sx={{ display: "flex", justifyContent: "flex-start", mb: 1 }}
                >
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    fontWeight="regular"
                    mt={0.5}
                  >
                    Tu plan actual: &nbsp;
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      width: "70%",
                    }}
                  >
                    <Typography
                      sx={{
                        color: theme.palette.info.main,
                        fontSize: theme.typography.h5.fontSize,
                        fontWeight: theme.typography.fontWeightBold,
                      }}
                    >
                      {accountType}
                    </Typography>
                  </Box>
                </Box>
                <StyledTypography variant="subtitle2">
                  CEDIS activos: &nbsp;<b>{numCEDIS}</b>
                </StyledTypography>
              </MHidden>
              <MHidden width="smUp">
                {/* -- Mobile -- */}
                {/* Business name */}
                <StyledTypography variant="subtitle1" mb={1}>
                  <b>{business?.businessName}</b>
                </StyledTypography>
                {/* Alima Supply Account Info */}
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  fontWeight="regular"
                  mb={1}
                >
                  Tu plan actual:
                </Typography>
                <Typography
                  align="center"
                  sx={{
                    color: theme.palette.info.main,
                    fontSize: theme.typography.h5.fontSize,
                    fontWeight: theme.typography.fontWeightBold,
                    mb: 1,
                  }}
                >
                  {accountType}
                </Typography>
                <StyledTypography variant="subtitle2">
                  CEDIS activos: &nbsp;<b>{numCEDIS}</b>
                </StyledTypography>
              </MHidden>
            </CardContent>
          </Card>

          {/* Invoicing Period */}
          <Divider sx={{ mt: 2, mb: 2 }} />
          <StyledTypography variant="subtitle2">
            Periodo de Facturación Actual
            <br />
          </StyledTypography>
          <Typography
            variant="h4"
            align="center"
            color="text.secondary"
            sx={{ textTransform: "capitalize", my: { xs: 1, md: 0 } }}
          >
            {fDateMonth(currentStartDate)} - {fDateMonth(currentEndDate)}
          </Typography>
          <Divider sx={{ mt: 2, mb: 2 }} />

          {/* Next Payment */}
          <StyledTypography variant="subtitle2">
            Tu Próximo Pago
            <br />
          </StyledTypography>
          <StyledTypography variant="subtitle1" sx={{ mt: 2, mx: 1 }}>
            Tu siguiente pago está programado para el día{" "}
            <b
              style={{
                color: theme.palette.primary.main,
                textTransform: "capitalize",
              }}
            >
              {fDateMonth(currentEndDate)}
            </b>
            , por un total de{" "}
            <b style={{ color: theme.palette.info.main }}>
              {fCurrency(totalDue?.total)} MXN
            </b>
            .{mktFee ? ` Más la comisión de venta en Marketplace.` : ``}
            {accountType === "ALIMA PRO"
              ? ` Más el excedente de folios incluidos en tu plan.`
              : ``}
          </StyledTypography>

          {/* Plan fees details */}
          <TableContainer sx={{ my: 1.5 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: theme.palette.text.secondary }}>
                    Descripción
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.secondary }}>
                    Precio U.
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.secondary }}>
                    Monto
                  </TableCell>
                </TableRow>
              </TableHead>
            </Table>
          </TableContainer>
          {/* B2B SaaS */}
          <SaaSPlan
            charges={alimaAccount.charges}
            discountCharges={alimaAccount.discounts}
            activeCedis={numCEDIS || 1}
            totalDue={totalDue}
            period={billingPeriod}
          />

          {/* Warning for Standard License */}
          {accountType === "STANDARD" && (
            <StyledTypography variant="subtitle2" mt={2}>
              <i>
                ** Nota: Servicio de Software es gratis para menos de 30 pedidos
                al mes
              </i>
              <br />
            </StyledTypography>
          )}

          {/* Alima B2B Marketplace */}
          {mktFee && (
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ mt: 2, mb: 2 }} />
              <StyledTypography variant="subtitle2">
                Alima B2B Marketplace
              </StyledTypography>
              <FormControlLabel
                control={
                  <Switch
                    checked={mktplaceActive}
                    onClick={handleMktplaceActive}
                  />
                }
                label="Aparecer como activo dentro de Marketplace"
                sx={{ my: 2, pl: 2, color: "text.secondary" }}
              />
              <StyledTypography variant="subtitle2">
                Tarifa Negociada: <b>{fPercentDec(mktplaceCommission)}</b>
              </StyledTypography>
              <Divider sx={{ mt: 2, mb: 2 }} />
            </Box>
          )}

          {/* [TODO] add change plan */}
          <Box sx={{ mt: 12 }}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => {
                track("select_content", {
                  visit: window.location.toString(),
                  page: "AlimaAccount",
                  section: "AlimaAccountPlan",
                });
                window.open(PATHS_EXTERNAL.supportAlimaWA, "_blank");
              }}
            >
              Contactar un Representante
            </Button>
          </Box>
        </Box>
      )}
    </>
  );
};

export default AlimaAccountPlan;
