// material
import {
  useTheme,
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  Theme,
  Link,
  IconButton,
  Button,
  MenuItem,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import MoreVerticalFill from "@iconify/icons-eva/more-vertical-fill";
// hooks
// styles
// domain
import {
  ComplementPaymentType,
  PaymentReceiptType,
} from "../../domain/orden/Orden";
import { createBlobURI, fCurrency, fISODate } from "../../utils/helpers";
import { PATH_APP } from "../../routes/paths";
import MHidden from "../extensions/MHidden";
import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";
import MenuPopover from "../MenuPopover";

// ----------------------------------------------------------------------
type PaymentReceiptCardProps = {
  receipt: PaymentReceiptType;
  onClick: (o: string) => void;
  theme: Theme;
  options?: { label: string; onClick: () => void }[];
};

const NormalPaymentReceiptCard: React.FC<PaymentReceiptCardProps> = ({
  receipt,
  onClick,
  theme,
  options,
}) => {
  const anchorRef = useRef(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [complements, setComplements] = useState<ComplementPaymentType[]>([]);

  useEffect(() => {
    if (!receipt.ordenes || receipt.ordenes.length === 0) return;
    const acc: ComplementPaymentType[] = [];
    receipt.ordenes.map((ord) => {
      if (ord.complement) {
        const index = acc.findIndex((x) => {
          return x.id === ord.complement!.id;
        });
        // if doesnot exist -> add to array
        if (index < 0) {
          acc.push(ord.complement!);
        }
      }
      return acc;
    });
    setComplements(acc);
  }, [receipt]);
  return (
    <>
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
              sx={{ typography: "body2", py: 1, px: 2.5 }}
            >
              {label}
            </MenuItem>
          );
        })}
      </MenuPopover>
      <Grid container spacing={1} sx={{ mt: theme.spacing(1) }}>
        <Grid item xs={11} md={7} sx={{ pr: 0.5 }}>
          <Box sx={{ cursor: "pointer" }}>
            <Typography variant="subtitle2">ID: {receipt?.id || ""}</Typography>
            {receipt.paymentDay && (
              <Typography variant="subtitle2" color={"text.secondary"} noWrap>
                Fecha de pago: {fISODate(receipt.paymentDay)}
              </Typography>
            )}
            <Typography variant="subtitle2" color={"text.secondary"} noWrap>
              Fecha de creacion: {fISODate(receipt.lastUpdated)}
            </Typography>
            {receipt.comments && (
              <Typography variant="body2" color="text.secondary" noWrap>
                Comentario: {receipt.comments}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", mt: 1 }}>
            {receipt?.evidenceFile && (
              <Link
                to={createBlobURI(receipt.evidenceFile as File)}
                target="_blank"
                rel="noopener noreferrer"
                download={receipt.evidenceFile.name}
                component={RouterLink}
                sx={{ mr: 2, fontSize: theme.typography.body1.fontSize }}
              >
                {receipt.evidenceFile.name}
              </Link>
            )}
          </Box>
          {complements.map((comp) => {
            return (
              <Box
                key={comp.id}
                sx={{ display: "flex", flexWrap: "wrap", mt: 1 }}
              >
                {comp?.pdfFile && (
                  <Link
                    to={createBlobURI(comp.pdfFile as File)}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={comp.pdfFile.name}
                    component={RouterLink}
                    sx={{ mr: 2, fontSize: theme.typography.body1.fontSize }}
                  >
                    {"Complemento (pdf)"}
                  </Link>
                )}
                {comp?.xmlFile && (
                  <Link
                    to={createBlobURI(comp.xmlFile as File)}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={comp.xmlFile.name}
                    component={RouterLink}
                    sx={{ mr: 2, fontSize: theme.typography.body1.fontSize }}
                  >
                    {"Complemento (xml)"}
                  </Link>
                )}
              </Box>
            );
          })}
        </Grid>
        <MHidden width="mdUp">
          <Grid item xs={1} md={0} sx={{ pl: 0, pt: 0 }}>
            {/* Mobile */}
            {options && (
              <IconButton ref={anchorRef} onClick={() => setOpenMenu(true)}>
                <Icon icon={MoreVerticalFill} />
              </IconButton>
            )}
          </Grid>
        </MHidden>
        <Grid item xs={12} md={5} sx={{ textAlign: "right" }}>
          <MHidden width="mdDown">
            {options && (
              <Button
                size="small"
                ref={anchorRef}
                variant="outlined"
                sx={{
                  mb: 1,
                  color: theme.palette.grey[500],
                  borderColor: theme.palette.grey[500],
                }}
                onClick={() => setOpenMenu(true)}
              >
                Ver Opciones
              </Button>
            )}
          </MHidden>
          <Box sx={{ mt: theme.spacing(0.5) }}>
            <Typography variant="subtitle2" color="text.secondary">
              {`Monto: ${fCurrency(receipt.paymentValue)}`}
            </Typography>
          </Box>
          {receipt.ordenes && (
            <Box justifyContent={"flex-end"} sx={{ textAlign: "right" }}>
              {receipt.ordenes.map((ord, j) => {
                return (
                  <Chip
                    key={j}
                    label={`Orden: ${ord?.ordenId?.slice(0, 10)}`}
                    sx={{
                      mt: theme.spacing(1),
                      px: theme.spacing(2),
                      backgroundColor: ord.deleted
                        ? theme.palette.error.main
                        : theme.palette.info.main,
                      color: theme.palette.common.white,
                      fontWeight: "bold",
                    }}
                    onClick={() => onClick(`${ord.ordenId}#payment`)}
                  />
                );
              })}
            </Box>
          )}
        </Grid>
      </Grid>
    </>
  );
};

// ----------------------------------------------------------------------

type PaymentReceiptCardItemProps = {
  receipt: PaymentReceiptType;
  options?: { label: string; onClick: () => void }[];
};

const PaymentReceiptCardItem: React.FC<PaymentReceiptCardItemProps> = ({
  receipt,
  options,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleOnClick = (o: string) => {
    if (!o || o === "") {
      console.warn("PaymentReceipt: orden.id is undefined");
      return;
    }
    navigate(PATH_APP.orden.details.replace(":ordenId", o));
  };

  return (
    <Card sx={{ pt: 0.5, mb: theme.spacing(2), boxShadow: theme.shadows[2] }}>
      <CardContent sx={{ pt: 0 }}>
        <NormalPaymentReceiptCard
          receipt={receipt}
          onClick={handleOnClick}
          theme={theme}
          options={options}
        />
      </CardContent>
    </Card>
  );
};

export default PaymentReceiptCardItem;
