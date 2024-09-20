import {
  Page,
  View,
  Text,
  Font,
  Image,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";
// domain
import {
  OrdenType,
  paymentMethodType,
  paymentMethods,
} from "../../domain/orden/Orden";
import { UOMTypes } from "../../domain/supplier/SupplierProduct";
import { fCurrency, fISODate, fQuantity } from "../../utils/helpers";
import { useTheme } from "@mui/material";
import { buildImageDetail } from "../../utils/imagesCdn";
import { BusinessType } from "../../domain/account/Business";

// ----------------------------------------------------------------------

Font.register({
  family: "Roboto",
  fonts: [
    { src: "/fonts/Roboto-Regular.ttf" },
    { src: "/fonts/Roboto-Bold.ttf" },
  ],
});

const styles = StyleSheet.create({
  col4: { width: "25%" },
  col8: { width: "75%" },
  col6: { width: "50%" },
  mt8: { marginTop: 8 },
  mt20: { marginTop: 20 },
  mt40: { marginTop: 40 },
  mb8: { marginBottom: 8 },
  mb20: { marginBottom: 40 },
  mb40: { marginBottom: 40 },
  overline: {
    fontSize: 8,
    marginBottom: 8,
    fontWeight: 500,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#637381",
  },
  h3: { fontSize: 16, fontWeight: 700 },
  h4: { fontSize: 13, fontWeight: 700 },
  body1: { fontSize: 10 },
  subtitle2: { fontSize: 9, fontWeight: 700 },
  alignRight: { textAlign: "right" },
  page: {
    padding: "20mm 24px 20mm 24px",
    fontSize: 9,
    lineHeight: 1.6,
    fontFamily: "Roboto",
    backgroundColor: "#fff",
    textTransform: "capitalize",
  },
  // footer: {
  //   left: 0,
  //   right: 0,
  //   bottom: 0,
  //   padding: 24,
  //   margin: 'auto',
  //   borderTopWidth: 1,
  //   borderStyle: 'solid',
  //   position: 'absolute',
  //   borderColor: '#DFE3E8'
  // },
  gridContainer: { flexDirection: "row", justifyContent: "space-between" },
  table: { display: "flex", width: "auto" },
  tableHeader: {},
  tableBody: {},
  tableRow: {
    padding: "4px 0",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderColor: "#DFE3E8",
  },
  noBorder: { paddingTop: 8, paddingBottom: 0, borderBottomWidth: 0 },
  tableCell_1: { width: "5%" },
  tableCell_2: { width: "50%", paddingRight: 16 },
  tableCell_3: { width: "15%" },
  tableCell_4: { width: "30%" },
});

// ----------------------------------------------------------------------

type InvoicePDFProps = {
  invoice: OrdenType;
  business: BusinessType;
};

const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, business }) => {
  // const { id, items, taxes, status, discount, invoiceTo, invoiceFrom } = invoice;
  const theme = useTheme();

  const summaryItems = [
    {
      label: "Descuento",
      value: invoice.discount?.amount,
    },
    {
      label: "Envío",
      value: invoice.shippingCost,
    },
    {
      label: "Empaque",
      value: invoice.packagingCost,
    },
    {
      label: "Servicio",
      value: invoice.serviceFee,
    },
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={[styles.gridContainer, styles.mb8]}>
          <View style={styles.col6}>
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
              }}
            >
              <Text style={{ ...styles.h3 }}>Nota de remisión</Text>
              <Text style={styles.h4}>ID: {invoice.id}</Text>
              <Text style={styles.h4}># Pedido: {invoice.ordenNumber}</Text>
              <Text style={styles.body1}>
                Método de Pago:{" "}
                {
                  paymentMethods[
                    invoice.paymentMethod?.toLowerCase() as paymentMethodType
                  ]
                }
              </Text>
            </View>
          </View>
          <View style={styles.col4}>
            {business.logoUrl ? (
              <Image
                source={
                  buildImageDetail(business.logoUrl) + `?Date=${Date.now()}`
                }
                style={{ width: 120 }}
                cache={false}
              />
            ) : null}
          </View>
        </View>

        {/* Invoice Details */}
        <View style={[styles.gridContainer, styles.mb8]}>
          {/* Column 1 */}
          <View style={styles.col4}>
            {/* Cliente */}
            <Text style={[styles.overline]}>Cliente</Text>
            <Text style={[styles.body1]}>
              {invoice.restaurantBranch.displayName}
            </Text>
            <Text style={[styles.body1]}>
              {invoice.restaurantBranch.branchName}
            </Text>
            <Text style={[styles.body1, styles.mb8]}>
              Tel.{" "}
              {invoice.restaurantBranch.phoneNumber}
            </Text>
            {/* Día de Entrega */}
            <Text style={[styles.overline, styles.mt8]}>Día de Entrega</Text>
            <Text style={styles.body1}>
              {!invoice.deliveryDate?.toString().includes("*")
                ? fISODate(invoice.deliveryDate)
                : invoice.deliveryDate}
            </Text>
            <Text style={styles.body1}>Entre ({invoice.deliveryTime}hrs)</Text>
          </View>

          {/* Column 2 */}
          <View style={styles.col4}>
            <Text style={[styles.overline, styles.mb8]}>
              Dirección de Entrega
            </Text>
            <Text style={styles.body1}>
              {invoice.restaurantBranch.fullAddress}
            </Text>
          </View>

          {/* Column 3 */}
          <View style={styles.col4}>
            {/* Supplier */}
            <Text style={[styles.overline]}>Proveedor</Text>
            <Text style={styles.body1}>{invoice.supplier.displayName}</Text>
            <Text style={styles.body1}>{invoice.supplier.unitName}</Text>

            {/* Orden Type */}
            <Text style={[styles.overline, styles.mb8, styles.mt8]}>
              Tipo de Orden
            </Text>
            {invoice.ordenType.toLowerCase() === "normal" && (
              <Text style={styles.body1}>
                Orden de Venta (
                {invoice.deliveryType === "pickup"
                  ? "Recoger en Almacén"
                  : "Entrega"}
                )
              </Text>
            )}
            {invoice.ordenType.toLowerCase() === "replacement" && (
              <Text style={styles.body1}>Orden de Reposición</Text>
            )}
          </View>
        </View>
        <View style={[styles.gridContainer, styles.mb8]}>
          {/* Column 1 */}
          <View style={[styles.col8, styles.mb8]}>
            {/* Comments */}
            <Text style={[styles.overline, styles.mb8]}>
              Comentarios del pedido
            </Text>
            <Text style={styles.body1}>
              {invoice.comments ? invoice.comments : "-"}
            </Text>
          </View>
        </View>

        {/* Invoice table */}
        <View style={[styles.table, { marginLeft: 2, marginRight: 2 }]}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <View style={styles.tableRow}>
              <View style={styles.tableCell_1}>
                <Text
                  style={[
                    styles.subtitle2,
                    { color: theme.palette.text.secondary },
                  ]}
                >
                  #
                </Text>
              </View>
              <View style={styles.tableCell_2}>
                <Text
                  style={[
                    styles.subtitle2,
                    { color: theme.palette.text.secondary },
                  ]}
                >
                  Producto
                </Text>
              </View>
              <View style={styles.tableCell_3}>
                <Text
                  style={[
                    styles.subtitle2,
                    { color: theme.palette.text.secondary },
                  ]}
                >
                  Cantidad
                </Text>
              </View>
              <View style={styles.tableCell_3}>
                <Text
                  style={[
                    styles.subtitle2,
                    { color: theme.palette.text.secondary },
                  ]}
                >
                  Precio Unit.
                </Text>
              </View>
              <View style={[styles.tableCell_3, styles.alignRight]}>
                <Text
                  style={[
                    styles.subtitle2,
                    { color: theme.palette.text.secondary },
                  ]}
                >
                  Precio
                </Text>
              </View>
            </View>
          </View>

          {/* Table Body */}
          <View style={styles.tableBody}>
            {/* Products  */}
            {invoice.cart.cartProducts.map((item, index) => (
              <View style={styles.tableRow} key={index + 1}>
                <View style={styles.tableCell_1}>
                  <Text>{index + 1}</Text>
                </View>
                <View style={styles.tableCell_2}>
                  <Text style={styles.subtitle2}>
                    {item.supplierProduct.productDescription}
                  </Text>
                  <Text>
                    {Object.entries(UOMTypes).find(
                      (su) =>
                        su[0] === item.supplierProduct.sellUnit.toLowerCase()
                    )?.[1] || item.supplierProduct.sellUnit}
                  </Text>
                </View>
                <View style={styles.tableCell_3}>
                  <Text>{fQuantity(item.quantity)}</Text>
                </View>
                <View style={styles.tableCell_3}>
                  <Text>{fCurrency(item.price?.amount)}</Text>
                </View>
                <View style={[styles.tableCell_3, styles.alignRight]}>
                  <Text>{fCurrency(item.total)}</Text>
                </View>
              </View>
            ))}
            {/* Summary */}
            <View style={[styles.tableRow, styles.noBorder]}>
              <View style={styles.tableCell_1} />
              <View style={styles.tableCell_2} />
              <View style={styles.tableCell_4}>
                <Text>Subtotal (sin Impuestos)</Text>
              </View>
              <View style={[styles.tableCell_3, styles.alignRight]}>
                <Text>{fCurrency(invoice.subtotalWithoutTax)}</Text>
              </View>
            </View>

            <View style={[styles.tableRow, styles.noBorder]}>
              <View style={styles.tableCell_1} />
              <View style={styles.tableCell_2} />
              <View style={styles.tableCell_4}>
                <Text>Impuestos</Text>
              </View>
              <View style={[styles.tableCell_3, styles.alignRight]}>
                <Text>{fCurrency(invoice.tax)}</Text>
              </View>
            </View>

            <View style={[styles.tableRow, styles.noBorder]}>
              <View style={styles.tableCell_1} />
              <View style={styles.tableCell_2} />
              <View style={styles.tableCell_4}>
                <Text>Subtotal</Text>
              </View>
              <View style={[styles.tableCell_3, styles.alignRight]}>
                <Text>{fCurrency(invoice.subtotal)}</Text>
              </View>
            </View>

            {summaryItems
              .filter((v) => v.value)
              .map((item, index) => (
                <View key={index} style={[styles.tableRow, styles.noBorder]}>
                  <View style={styles.tableCell_1} />
                  <View style={styles.tableCell_2} />
                  <View style={styles.tableCell_4}>
                    <Text>{item.label}</Text>
                  </View>
                  <View style={[styles.tableCell_3, styles.alignRight]}>
                    <Text>{fCurrency(item.value)}</Text>
                  </View>
                </View>
              ))}

            <View style={[styles.tableRow, styles.noBorder]}>
              <View style={styles.tableCell_1} />
              <View style={styles.tableCell_2} />
              <View style={styles.tableCell_4}>
                <Text style={styles.h4}>Total</Text>
              </View>
              <View style={[styles.tableCell_3, styles.alignRight]}>
                <Text style={styles.h4}>{fCurrency(invoice.total)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* <View style={[styles.gridContainer, { width: "auto" }]}>
          <View style={styles.col8}>
            <Text style={styles.subtitle2}>IMPORTANTE</Text>
            <Text>
              Para cualquier aclaración no dudes en escribirnos al WhatsApp{" "}
              <b>+52 </b>.
            </Text>
            <Text style={styles.subtitle2}>POLÍTICA DE DEVOLUCIÓN</Text>
            <Text>
              Toda solicitud de cambio o devolución deberá ser reportada durante
              el momento de la entrega y anotada en esta hoja, de lo contrario
              no podremos hacer efectiva la reclamación.
            </Text>
          </View>
        </View> */}
      </Page>
    </Document>
  );
};

export default InvoicePDF;
