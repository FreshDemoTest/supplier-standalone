import {
  Fragment,
  MutableRefObject,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { enqueueSnackbar } from "notistack";
// material
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import { Icon } from "@iconify/react";
import MoreOptsFill from "@iconify/icons-eva/more-vertical-fill";
// hooks
import { useAppDispatch } from "../../redux/store";
// redux
import { cancelOrden } from "../../redux/slices/orden";
// domain
import {
  CartProductType,
  OrdenType,
  ordenStatusTypes,
  paymentMethodType,
  paymentMethods,
} from "../../domain/orden/Orden";
// utils
import track from "../../utils/analytics";
import { fCurrency, fISODate, fQuantity } from "../../utils/helpers";
// components
import BasicDialog from "../navigation/BasicDialog";
import MenuPopover from "../MenuPopover";
// styles
import { statusChip } from "../../styles/mappings";
import { RemisionGridStyle, SummaryRow } from "../../styles/tables/ordenTable";
import { UOMTypes } from "../../domain/supplier/SupplierProduct";
import InvoiceToolbar from "../invoice/InvoiceToolbar";
import { buildImageDetail } from "../../utils/imagesCdn";

// ----------------------------------------------------------------------

const sortProductsByAlpha = (cartProds: CartProductType[]) => {
  const sortedCartProds = [...cartProds];
  sortedCartProds.sort((a, b) => {
    const nameA = a.supplierProduct.productDescription.toLowerCase();
    const nameB = b.supplierProduct.productDescription.toLowerCase();
    return nameA.localeCompare(nameB);
  });
  return sortedCartProds;
};

// ----------------------------------------------------------------------

type ProductDetailsTableProps = {
  minWidth?: number;
  cartProds: CartProductType[];
  subtotalWOTax?: number;
  taxes?: number;
  subtotal?: number;
  summaryItems: { label: string; value: number | undefined }[];
  total?: number;
  showTotals?: boolean;
};

const ProductDetailsTable: React.FC<ProductDetailsTableProps> = ({
  minWidth = 280,
  cartProds,
  subtotalWOTax,
  taxes,
  subtotal,
  summaryItems,
  total,
  showTotals = true,
}) => {
  const theme = useTheme();
  const [sortedCartProds, setSortedCartProds] = useState<CartProductType[]>(
    sortProductsByAlpha(cartProds)
  );

  useEffect(() => {
    setSortedCartProds(sortProductsByAlpha(cartProds));
  }, [cartProds]);

  return (
    <TableContainer sx={{ minWidth: minWidth }}>
      <Table>
        <TableHead
          sx={{
            borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
            "& th": { backgroundColor: "transparent" },
          }}
        >
          <TableRow>
            <TableCell width={20} sx={{ color: theme.palette.text.disabled }}>
              #
            </TableCell>
            <TableCell
              align="center"
              sx={{ color: theme.palette.text.disabled }}
            >
              Producto
            </TableCell>
            <TableCell
              align="center"
              sx={{ color: theme.palette.text.disabled }}
            >
              Cantidad
            </TableCell>
            <TableCell
              align="center"
              sx={{ color: theme.palette.text.disabled }}
            >
              Precio
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {sortedCartProds.map((row, index) => (
            <TableRow
              key={index}
              sx={{
                borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
              }}
            >
              <TableCell>{index + 1}</TableCell>
              <TableCell align="center" sx={{ maxWidth: 60 }}>
                <Box>
                  <Typography
                    variant="subtitle2"
                    align="left"
                    sx={{
                      fontWeight: theme.typography.fontWeightRegular,
                    }}
                  >
                    {row.supplierProduct.productDescription}
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                      align="left"
                      noWrap
                    >
                      {Object.entries(UOMTypes).find(
                        (su) =>
                          su[0] === row.supplierProduct.sellUnit.toLowerCase()
                      )?.[1] || row.supplierProduct.sellUnit}
                    </Typography>
                  </Typography>
                </Box>
              </TableCell>
              <TableCell align="center">{fQuantity(row.quantity)}</TableCell>
              <TableCell align="center">
                <Typography variant="subtitle2">
                  {fCurrency(row.total)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {fCurrency(row.price?.amount)} /{" "}
                  {Object.entries(UOMTypes).find(
                    (su) => su[0] === row.supplierProduct.sellUnit.toLowerCase()
                  )?.[1] || row.supplierProduct.sellUnit}
                </Typography>
              </TableCell>
            </TableRow>
          ))}

          {showTotals && (
            <Fragment>
              {/* Subtotal w/o tax */}
              <SummaryRow
                label="Subtotal (antes de Impuestos)"
                value={subtotalWOTax}
                colSpan={0}
                contentColSpan={2}
              />
              {/* Impuestos */}
              <SummaryRow label="Impuestos" value={taxes} />
              {/* Subtotal */}
              <SummaryRow label="Subtotal" value={subtotal} />

              {/* Optional summary items */}
              {summaryItems
                .filter((v) => v.value)
                .map((item) => (
                  <SummaryRow
                    key={item.label}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              {/* Total */}
              <SummaryRow
                label="Total"
                value={total}
                sx={{
                  fontWeight: theme.typography.fontWeightBold,
                  fontSize: theme.typography.h6.fontSize,
                }}
              />
            </Fragment>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// ----------------------------------------------------------------------

const ORD_RECEIPT: OrdenType = {
  id: "********-*********-*********-*******",
  version: "**",
  ordenType: "normal",
  status: "submitted",
  restaurantBranch: {
    id: "********-*********-*********-*******",
    branchName: "*********",
    street: "********",
    externalNum: "100",
    internalNum: "A55",
    neighborhood: "*** ******* *******",
    city: "**** ******",
    estate: "***********",
    zipCode: "*****",
    country: "*****",
  },
  supplier: {
    id: "********-*********-*********-*******",
    unitName: "*********",
    displayName: "*********",
    phoneNumber: "*********",
    email: "*********",
    country: "*****",
  },
  deliveryDate: "****-**-**",
  deliveryTime: "** - **",
  cart: {
    id: "********-*********-*********-*******",
    cartProducts: [
      {
        id: "********-*********-*********-*******",
        supplierProduct: {
          id: "********-*********-*********-*******",
          sku: "*********",
          productDescription: "*********",
          sellUnit: "*********",
        },
        quantity: 1,
        price: {
          uuid: "********-*********-*********-*******",
          amount: 0.0,
          unit: "*********",
          validUntil: "****-**-**",
        },
        total: 0.0,
      },
    ],
  },
  comments: "",
  subtotalWithoutTax: 0.0,
  tax: 0.0,
  subtotal: 0.0,
  discount: { amount: 0.0, code: "" },
  cashback: {
    uuid: "********-*********-*********-*******",
    amount: 0.0,
    code: "",
  },
  shippingCost: 0.0,
  packagingCost: 0.0,
  serviceFee: 0.0,
  total: 0.0,
  paymentMethod: "*********",
  createdAt: "****-**-**",
  lastUpdated: "****-**-**",
};

// ----------------------------------------------------------------------

type OrdenDetailsViewProps = {
  ordenId: string;
  sessionToken: string;
  notFound: boolean;
  ordenReceipt: OrdenType;
  business: any;
  menuOptions: {
    label: string;
    allowed: any;
    action: () => void;
    icon: ReactNode;
  }[];
  openDeleteBranchMenu: boolean;
  setOpenDeleteBranchMenu: (open: boolean) => void;
  reportTemplateRef: MutableRefObject<any>;
  openPDF?: boolean;
  setOpenPDF?: (a: boolean) => void;
  downloadPDF?: boolean;
};

const OrdenDetailsView: React.FC<OrdenDetailsViewProps> = ({
  ordenId,
  sessionToken,
  notFound,
  ordenReceipt,
  business,
  menuOptions,
  openDeleteBranchMenu,
  setOpenDeleteBranchMenu,
  reportTemplateRef,
  openPDF,
  setOpenPDF,
  downloadPDF,
}) => {
  // hook vars
  const theme = useTheme();
  const dispatch = useAppDispatch();
  // refs
  const anchorRef = useRef(null);
  // local vars
  const [openMenu, setOpenMenu] = useState<boolean>(false);

  // summary items
  const summaryItems = [
    {
      label: "Descuento",
      value: ordenReceipt.discount?.amount,
    },
    {
      label: "Envío",
      value: ordenReceipt.shippingCost,
    },
    {
      label: "Empaque",
      value: ordenReceipt.packagingCost,
    },
    {
      label: "Servicio",
      value: ordenReceipt.serviceFee,
    },
  ];

  // render method
  return (
    <Box sx={{ mt: theme.spacing(3) }}>
      {/* Options popover */}
      <MenuPopover
        open={openMenu}
        onClose={() => setOpenMenu(false)}
        anchorEl={anchorRef.current || undefined}
        sx={{ width: 220 }}
      >
        {menuOptions
          .filter((m) => m.allowed)
          .map((option) => (
            <MenuItem
              key={option.label}
              onClick={option.action}
              sx={{ typography: "body2", py: 1, px: 2.5 }}
            >
              <Grid container spacing={1}>
                <Grid item xs={8} lg={8}>
                  {option.label}
                </Grid>
                <Grid item xs={4} lg={4} textAlign={"right"}>
                  {option.icon}
                </Grid>
              </Grid>
            </MenuItem>
          ))}
      </MenuPopover>
      {/* Cancel Orden confirmation */}
      <BasicDialog
        title="Cancelar Orden"
        msg="¿Estás seguro que deseas cancelar esta orden?"
        open={openDeleteBranchMenu}
        onClose={() => setOpenDeleteBranchMenu(false)}
        continueAction={{
          active: true,
          msg: "Si, cancelar",
          actionFn: async () => {
            try {
              await dispatch(cancelOrden(ordenId, sessionToken || ""));
              enqueueSnackbar("Pedido fue cancelado", {
                variant: "success",
                autoHideDuration: 3000,
              });
              setOpenDeleteBranchMenu(false);
              // reload
              window.location.reload();
              track("refund", {
                visit: window.location.toString(),
                page: "OrdenDetails",
                section: "OrdenDetailsMenu",
                ordenId: ordenId,
              });
            } catch (error) {
              console.log("Error cancelling orden", error);
              enqueueSnackbar("Error cancelando pedido", {
                variant: "error",
                autoHideDuration: 3000,
              });
            }
          },
        }}
        backAction={{
          active: true,
          msg: "No",
          actionFn: () => setOpenDeleteBranchMenu(false),
        }}
        closeMark={true}
      />

      {notFound && (
        <Box sx={{ mt: theme.spacing(3) }}>
          <Typography variant="h4" align="center">
            Orden no encontrada
          </Typography>
        </Box>
      )}
      {!notFound && (
        <>
          {/* Remission */}
          <Card
            sx={{
              pt: theme.spacing(2),
              pb: theme.spacing(4),
              px: { xs: theme.spacing(2), md: theme.spacing(4) },
            }}
          >
            <CardHeader
              title={
                // Logo
                <Grid container>
                  <Grid item xs={7}>
                    {business.logoUrl ? (
                      <Box
                        component="img"
                        alt={business?.businessName || "Logo"}
                        data-src={`${buildImageDetail(
                          business.logoUrl
                        )}?${Date.now()}`}
                        src={`${buildImageDetail(
                          business.logoUrl
                        )}?${Date.now()}`}
                        className="lazyload blur-up"
                        sx={{
                          width: 100,
                          height: "auto",
                        }}
                      />
                    ) : null}
                  </Grid>
                </Grid>
              }
              action={
                <IconButton
                  aria-label="options"
                  ref={anchorRef}
                  onClick={() => setOpenMenu(true)}
                >
                  <Icon icon={MoreOptsFill} width={24} height={24} />
                </IconButton>
              }
            />
            <CardContent>
              <Grid container>
                {/* Nota remision */}
                <RemisionGridStyle item xs={8} sm={8}>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: theme.typography.fontWeightLight }}
                  >
                    Nota de Remisión
                  </Typography>
                  <Typography variant="h6">ID: {ordenReceipt.id}</Typography>
                  <Typography variant="h6" color={"text.secondary"} noWrap>
                    {"# Pedido: "}
                    {ordenReceipt.ordenNumber}
                  </Typography>
                  <Typography variant="body2">
                    Tipo de pago:{" "}
                    {
                      paymentMethods[
                        ordenReceipt.paymentMethod?.toLowerCase() as paymentMethodType
                      ]
                    }
                  </Typography>
                </RemisionGridStyle>
                {/* Status  */}
                <Grid item xs={4} sm={4}>
                  <Box sx={{ textAlign: "right" }}>
                    <Chip
                      label={
                        ordenReceipt.ordenType?.toLowerCase() === "normal" ||
                        ordenReceipt.status === "canceled"
                          ? ordenStatusTypes[ordenReceipt.status]
                          : "Pre-Pedido"
                      }
                      sx={{
                        textTransform: "none",
                        mb: 1,
                        backgroundColor:
                          ordenReceipt.ordenType?.toLowerCase() === "normal" ||
                          ordenReceipt.status === "canceled"
                            ? statusChip(theme, ordenReceipt)
                            : theme.palette.action.disabled,
                        color: theme.palette.common.white,
                        fontWeight: theme.typography.fontWeightBold,
                      }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={7} sm={9}>
                  {/* Cliente, direccion y fecha de entrega*/}
                  <Grid container>
                    {/* Cliente */}
                    <Grid item xs={12} sm={6}>
                      <Typography
                        paragraph
                        variant="overline"
                        sx={{ color: "text.disabled", mb: theme.spacing(0) }}
                      >
                        Cliente
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: theme.typography.fontWeightMedium }}
                      >
                        {ordenReceipt.restaurantBranch.displayName}
                      </Typography>
                      <Typography variant="body1" noWrap>
                        {ordenReceipt.restaurantBranch.branchName}
                      </Typography>

                      <Typography variant="body2">
                        Tel. {ordenReceipt.restaurantBranch.phoneNumber}
                      </Typography>
                    </Grid>
                    {/* Direccion de entrega */}
                    <Grid item xs={12} sm={5}>
                      {ordenReceipt.deliveryType !== "pickup" && (
                        <Typography
                          paragraph
                          variant="overline"
                          sx={{
                            color: "text.disabled",
                            mb: theme.spacing(0),
                            mt: { xs: theme.spacing(1), md: theme.spacing(0) },
                          }}
                        >
                          Dirección de Entrega
                        </Typography>
                      )}

                      {ordenReceipt.deliveryType !== "pickup" && (
                        <Typography variant="body2">
                          {ordenReceipt.restaurantBranch.fullAddress}
                        </Typography>
                      )}
                      {/* {ordenReceipt.deliveryType === 'pickup' && (
                        <Typography variant="body2">
                          {ordenReceipt.supplier?.fullAddress}
                        </Typography>
                      )} */}
                    </Grid>
                  </Grid>
                  <Grid container>
                    {/* Fecha de entrega */}
                    <Grid item xs={12} sm={4}>
                      <Typography
                        paragraph
                        variant="overline"
                        sx={{
                          color: "text.disabled",
                          mb: theme.spacing(0),
                          mt: theme.spacing(1),
                        }}
                      >
                        Fecha de Entrega
                      </Typography>
                      <Typography variant="subtitle2">
                        {!ordenReceipt.deliveryDate?.toString().includes("*")
                          ? fISODate(ordenReceipt.deliveryDate)
                          : ordenReceipt.deliveryDate}
                      </Typography>
                      <Typography variant="body2">
                        Entre ({ordenReceipt.deliveryTime}hrs)
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Proveedor  */}
                <Grid item xs={5} sm={3}>
                  <Grid container sx={{ pl: theme.spacing(1) }}>
                    <Grid item xs={12} sm={12}>
                      <Typography
                        variant="overline"
                        paragraph
                        sx={{ color: "text.disabled", mb: theme.spacing(0) }}
                      >
                        Proveedor
                      </Typography>
                      <Typography variant="body1">
                        <b>{ordenReceipt.supplier.displayName}</b>
                      </Typography>
                      <Typography variant="body1">
                        {ordenReceipt.supplier.unitName}
                      </Typography>
                    </Grid>

                    {/* Tipo de Orden */}
                    <Grid item xs={12} sm={12}>
                      <Typography
                        variant="overline"
                        paragraph
                        sx={{
                          color: "text.disabled",
                          mb: theme.spacing(0),
                          mt: theme.spacing(1),
                        }}
                      >
                        Tipo de Orden
                      </Typography>
                      <Box>
                        {ordenReceipt.ordenType.toLowerCase() === "normal" && (
                          <Typography variant="subtitle2">
                            Orden de Venta (
                            {ordenReceipt.deliveryType === "pickup"
                              ? "Recoger en Almacén"
                              : "Entrega"}
                            )
                          </Typography>
                        )}
                        {ordenReceipt.ordenType.toLowerCase() ===
                          "replacement" && (
                          <Typography variant="subtitle2">
                            Orden de Reposición
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>

                {/* comentarios de entrega */}
                <Grid item xs={12} sm={12} sx={{ mt: 1, mb: 3 }}>
                  <Typography
                    variant="overline"
                    paragraph
                    sx={{
                      color: "text.disabled",
                      mb: theme.spacing(0),
                    }}
                  >
                    Comentarios del Pedido
                  </Typography>
                  <Typography variant="body2">
                    {" "}
                    {ordenReceipt.comments ? ordenReceipt.comments : "-"}{" "}
                  </Typography>
                </Grid>
              </Grid>

              {/* Product List */}
              <ProductDetailsTable
                cartProds={ordenReceipt.cart.cartProducts}
                subtotalWOTax={ordenReceipt.subtotalWithoutTax}
                taxes={ordenReceipt.tax}
                subtotal={ordenReceipt.subtotal}
                summaryItems={summaryItems}
                total={ordenReceipt.total}
              />
            </CardContent>
          </Card>
          {/* Powered by Alima */}
          {/* <FloatingPoweredByAlima /> */}
          {/* PDF Toolbar */}
          <InvoiceToolbar
            invoice={ordenReceipt}
            showButtons={false}
            pdfState={openPDF}
            setPdfState={setOpenPDF}
            downloadPdf={downloadPDF}
            business={business}
          />
        </>
      )}
    </Box>
  );
};

const formatTicketOrdenDetails = (ordenReceipt: OrdenType, business: any) => {
  const summaryItems = [
    {
      label: "Descuento",
      value: ordenReceipt.discount?.amount,
    },
    {
      label: "Envío",
      value: ordenReceipt.shippingCost,
    },
    {
      label: "Empaque",
      value: ordenReceipt.packagingCost,
    },
    {
      label: "Servicio",
      value: ordenReceipt.serviceFee,
    },
  ];
  let optSummaryItems = "";
  summaryItems
    .filter((v) => v.value)
    .forEach((item) => {
      optSummaryItems += `${item.label}: ${fCurrency(item.value)}\n`;
    });

  const formatProds = (cartProds: CartProductType[]) => {
    return cartProds
      .map(
        (p) =>
          `${p.supplierProduct.productDescription.slice(0, 10)} | ${fQuantity(
            p.quantity
          )} ${(
            Object.entries(UOMTypes).find(
              (su) => su[0] === p.supplierProduct.sellUnit.toLowerCase()
            )?.[1] || p.supplierProduct.sellUnit
          ).slice(0, 3)} | ${fCurrency(p.total)}`
      )
      .join("\n");
  };
  return `PROVEEDOR
${ordenReceipt.supplier.displayName}
${ordenReceipt.supplier.unitName}

NOTA DE REMISION
ID: ${ordenReceipt.id?.slice(0, 10)}
# Pedido: ${ordenReceipt.ordenNumber}
Tipo de pago: ${
    paymentMethods[
      ordenReceipt.paymentMethod?.toLowerCase() as paymentMethodType
    ]
  }

CLIENTE
${ordenReceipt.restaurantBranch.displayName}, ${
    ordenReceipt.restaurantBranch.branchName
  }
Tel. ${ordenReceipt.restaurantBranch.phoneNumber}
Dirección: ${ordenReceipt.restaurantBranch.fullAddress}

FECHA DE ENTREGA
${
  !ordenReceipt.deliveryDate?.toString().includes("*")
    ? fISODate(ordenReceipt.deliveryDate)
    : ordenReceipt.deliveryDate
} Entre (${ordenReceipt.deliveryTime}hrs)

COMENTARIOS
${ordenReceipt.comments ? ordenReceipt.comments : "-"}

PRODUCTOS
---
${formatProds(ordenReceipt.cart.cartProducts)}
---
Subtotal (antes Imp.): ${fCurrency(ordenReceipt.subtotalWithoutTax)}
Impuestos: ${fCurrency(ordenReceipt.tax)}
Subtotal: ${fCurrency(ordenReceipt.subtotal)}
${optSummaryItems}Total: ${fCurrency(ordenReceipt.total)}

***************
`;
};

export default OrdenDetailsView;
export { ORD_RECEIPT, ProductDetailsTable, formatTicketOrdenDetails };
