import { useEffect, useRef, useState } from "react";
// material
import { Box, Stack, useTheme } from "@mui/material";
import { Icon } from "@iconify/react";
// import shareFill from '@iconify/icons-eva/share-fill';
import downloadFill from "@iconify/icons-eva/download-fill";
import { PDFDownloadLink } from "@react-pdf/renderer"; // PDFDownloadLink
import SupplierProductPriceListPDF from "./SupplierProductPriceListPdf";
import { LoadingButton } from "@mui/lab";
import { BusinessType } from "../../domain/account/Business";
import { SupplierPriceListStateType } from "../../domain/supplier/SupplierPriceList";
import { UnitStateType } from "../../domain/account/SUnit";
import { ClientBranchType } from "../../domain/client/Client";

// ----------------------------------------------------------------------

type SupplierProductPriceListToolbarProps = {
  priceList: SupplierPriceListStateType;
  units: UnitStateType[];
  activeClients: ClientBranchType[];
  business: BusinessType;
  showButtons?: boolean;
  onDownloadedPDF: (value: boolean) => void;
};

const SupplierProductPriceListToolbar: React.FC<
  SupplierProductPriceListToolbarProps
> = ({
  priceList,
  units,
  activeClients,
  showButtons = true,
  business,
  onDownloadedPDF,
}) => {
  const theme = useTheme();
  const pdfDownloadLinkRef = useRef<any>(null);
  const [pdfUrlBlob, setPdfUrlBlob] = useState<string | undefined>(undefined);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (pdfUrlBlob === undefined) return;
    if (downloaded) return;
    const link = document.createElement("a");
    link.href = pdfUrlBlob;
    link.download = `COTIZACIÓN-${priceList.listName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloaded(true);
    onDownloadedPDF(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfUrlBlob]);

  return (
    <>
      <Stack
        mb={0}
        direction="row"
        justifyContent="flex-end"
        spacing={1.5}
        sx={{ visibility: showButtons ? "visible" : "hidden" }}
      >
        <PDFDownloadLink
          document={
            <SupplierProductPriceListPDF
              priceList={priceList}
              business={business}
              units={units}
              activeClients={activeClients}
            />
          }
          fileName={`COTIZACIÓN-${priceList.listName}.pdf`}
          style={{ textDecoration: "none" }}
        >
          {({ loading, url }) => {
            if (url) {
              setPdfUrlBlob(url);
            }
            return (
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <p> Descargando..</p>
                <LoadingButton
                  size="large"
                  loading={loading}
                    //   variant="contained"
                  style={{
                    background: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                  }}
                  startIcon={<Icon icon={downloadFill} />}
                  ref={pdfDownloadLinkRef}
                >
                  {" "}
                  Descargando...
                </LoadingButton>
              </Box>
            );
          }}
        </PDFDownloadLink>
      </Stack>
    </>
  );
};

export default SupplierProductPriceListToolbar;
