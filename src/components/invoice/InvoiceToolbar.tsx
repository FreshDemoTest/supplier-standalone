import { useEffect, useState, useRef } from "react";
// material
import {
  Box,
  Tooltip,
  IconButton,
  DialogActions,
  Stack,
  Button,
} from "@mui/material";
import { Icon } from "@iconify/react";
import eyeFill from "@iconify/icons-eva/eye-fill";
import closeFill from "@iconify/icons-eva/close-fill";
// import shareFill from '@iconify/icons-eva/share-fill';
import downloadFill from "@iconify/icons-eva/download-fill";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer"; // PDFDownloadLink
import DialogAnimate from "../animate/DialogAnimate";
import InvoicePDF from "./InvoicePDF";
import { OrdenType } from "../../domain/orden/Orden";
import { LoadingButton } from "@mui/lab";
import { BusinessType } from "../../domain/account/Business";

// ----------------------------------------------------------------------

type InvoiceToolbarProps = {
  invoice: OrdenType;
  showButtons?: boolean;
  pdfState?: boolean;
  setPdfState?: (a: boolean) => void;
  downloadPdf?: boolean;
  business: BusinessType
};

const InvoiceToolbar: React.FC<InvoiceToolbarProps> = ({
  invoice,
  showButtons = true,
  pdfState,
  setPdfState,
  downloadPdf,
  business
}) => {
  const [openPDF, setOpenPDF] = useState(false);
  const pdfDownloadLinkRef = useRef<any>(null);

  const handleOpenPreview = () => {
    setOpenPDF(true);
    if (setPdfState) setPdfState(true);
  };

  const handleClosePreview = () => {
    setOpenPDF(false);
    if (setPdfState) setPdfState(false);
  };

  useEffect(() => {
    if (pdfState === undefined) return;
    setOpenPDF(pdfState);
  }, [pdfState]);

  useEffect(() => {
    if (downloadPdf === undefined) return;
    if (downloadPdf && pdfDownloadLinkRef.current) {
      const link = pdfDownloadLinkRef.current as HTMLAnchorElement;
      link.click();
    }
  }, [downloadPdf]);

  return (
    <>
      <Stack
        mb={0}
        direction="row"
        justifyContent="flex-end"
        spacing={1.5}
        sx={{ visibility: showButtons ? "visible" : "hidden" }}
      >
        <Button
          color="info"
          size="small"
          variant="contained"
          onClick={handleOpenPreview}
          endIcon={<Icon icon={eyeFill} />}
          sx={{ mx: 1 }}
        >
          Ver PDF
        </Button>

        <PDFDownloadLink
          document={<InvoicePDF invoice={invoice} business={business} />}
          fileName={`ORDEN-${invoice.id}.pdf`}
          style={{ textDecoration: "none" }}
        >
          {({ loading }) => (
            <>
              <LoadingButton
                size="small"
                loading={loading}
                variant="contained"
                loadingPosition="end"
                endIcon={<Icon icon={downloadFill} />}
                ref={pdfDownloadLinkRef}
              >
                Descargar PDF
              </LoadingButton>
            </>
          )}
        </PDFDownloadLink>
      </Stack>

      <DialogAnimate
        open={openPDF}
        {...{ fullScreen: true }}
        onClose={() => {
          if (setPdfState) setPdfState(false);
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <DialogActions
            sx={{
              zIndex: 9,
              padding: "12px !important",
              boxShadow: (theme) => theme.shadows[24],
            }}
          >
            <Tooltip title="Close">
              <IconButton color="inherit" onClick={handleClosePreview}>
                <Icon icon={closeFill} />
              </IconButton>
            </Tooltip>
          </DialogActions>
          <Box sx={{ flexGrow: 1, height: "100%", overflow: "hidden" }}>
            <PDFViewer width="100%" height="100%" style={{ border: "none" }}>
              <InvoicePDF invoice={invoice} business={business} />
            </PDFViewer>
          </Box>
        </Box>
      </DialogAnimate>
    </>
  );
};

export default InvoiceToolbar;
