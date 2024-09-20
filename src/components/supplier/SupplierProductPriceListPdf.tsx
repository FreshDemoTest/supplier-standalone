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
import { UOMTypes } from "../../domain/supplier/SupplierProduct";
import { fISODate, fQuantity } from "../../utils/helpers";
import { useTheme } from "@mui/material";
import { buildImageDetail } from "../../utils/imagesCdn";
import { BusinessType } from "../../domain/account/Business";
import { SupplierPriceListStateType } from "../../domain/supplier/SupplierPriceList";
import { UnitStateType } from "../../domain/account/SUnit";
import { ClientBranchType } from "../../domain/client/Client";

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
  tableCell_1: { width: "10%" },
  tableCell_2: { width: "50%", paddingRight: 16 },
  tableCell_3: { width: "15%" },
  tableCell_4: { width: "30%" },
  tableCell_5: { width: "10%" },
});

// ----------------------------------------------------------------------

type SuṕplierProductPriceListPDFProps = {
  priceList: SupplierPriceListStateType;
  units: UnitStateType[];
  activeClients: ClientBranchType[];
  business: BusinessType;
  setDownloadPDF?: (value: boolean) => void;
};

const SupplierProductPriceListPDF: React.FC<
  SuṕplierProductPriceListPDFProps
> = ({ priceList, units, activeClients, business }) => {
  // const { id, items, taxes, status, discount, invoiceTo, invoiceFrom } = invoice;
  const theme = useTheme();
  // string of unit names
  const unitsNameString = units
    .filter((un: UnitStateType) =>
      priceList?.supUnitIds?.includes(un?.id || "")
    )
    .map((u: UnitStateType) => u.unitName)
    .join("\n ");
  // get clients
  const clientsNameString = activeClients
    .filter((ac: ClientBranchType) =>
      priceList?.resBranches?.includes(ac?.id || "")
    )
    .map((c: ClientBranchType) => c.branchName)
    .join("\n ");
  // set sorted products
  const _sortedProducts = [...priceList.pricesDetails];
  _sortedProducts.sort((a, b) => {
    return a.description.localeCompare(b.description);
  });

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
              <Text style={{ ...styles.h3 }}>Cotización</Text>
              <Text style={styles.h4}>{priceList.listName}</Text>
              <Text style={styles.h4}>
                Valida Hasta: {fISODate(priceList.validUntil)}
              </Text>
              {unitsNameString !== "" ? (
                <Text style={styles.h4}>
                  Cedis disponibles: {unitsNameString}
                </Text>
              ) : null}
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
          <View style={styles.col4}>
            {/* Supplier */}
            <Text style={[styles.overline]}>Proveedor: </Text>
            <Text style={styles.body1}>{business.businessName}</Text>
          </View>
          <View style={styles.col4}>
            {clientsNameString !== "" ? (
              <Text style={[styles.overline]}>Clientes: </Text>
            ) : null}
            {clientsNameString !== "" ? (
              <Text style={[styles.body1]}>{clientsNameString}</Text>
            ) : null}
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
                ></Text>
              </View>
              <View style={styles.tableCell_1}>
                <Text
                  style={[
                    styles.subtitle2,
                    { color: theme.palette.text.secondary },
                  ]}
                >
                  sku
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
                  Presentación
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
            {_sortedProducts.map((item, index) => (
              <View style={styles.tableRow} key={index + 1}>
                <View style={styles.tableCell_1}>
                  {item.images && item.images.length > 0 ? (
                    <Image
                      source={
                        buildImageDetail(item.images[0].imageUrl) +
                        `?Date=${Date.now()}`
                      }
                      style={{ width: 25 }}
                      cache={false}
                    />
                  ) : (
                    <Text style={{ ...styles.h3 }}> </Text>
                  )}
                </View>

                <View style={styles.tableCell_1}>
                  <Text>{item.sku}</Text>
                </View>
                <View style={styles.tableCell_2}>
                  <Text style={styles.subtitle2}>{item.description}</Text>
                </View>
                <View style={styles.tableCell_3}>
                  <Text>
                    {Object.entries(UOMTypes).find(
                      (su) => su[0] === item.sellUnit.toLowerCase()
                    )?.[1] || item.sellUnit}
                  </Text>
                </View>
                <View style={[styles.tableCell_3, styles.alignRight]}>
                  <Text>{fQuantity(item.price.price)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default SupplierProductPriceListPDF;
