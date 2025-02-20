import { useEffect, useRef, useState } from "react";
import { enqueueSnackbar } from "notistack";
// material
import { useTheme } from "@mui/material";
import { Icon } from "@iconify/react";
import CancelFill from "@iconify/icons-ic/cancel";
import ConfirmFill from "@iconify/icons-ic/check-circle";
import DeliverFill from "@iconify/icons-ic/baseline-delivery-dining";
import EditFill from "@iconify/icons-ic/mode-edit";
import DownloadFill from "@iconify/icons-ic/file-download";
import eyeFill from "@iconify/icons-eva/eye-fill";
import linkFill from "@iconify/icons-ic/link";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
// hook
import { useNavigate } from "react-router";
import useAuth from "../../../hooks/useAuth";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
// redux
import {
  clearActiveInvoicesOrden,
  clearInvoiceDetailsSuccess,
  confirmOrden,
  deliverOrden,
  getInvoiceDetails,
  getOrdenDetails,
} from "../../../redux/slices/orden";
// components
import LoadingProgress from "../../../components/LoadingProgress";
import OrdenDetailsView, {
  ORD_RECEIPT,
  formatTicketOrdenDetails,
} from "../../../components/orden/OrdenDetailsView";
// routes
import { PATHS_EXTERNAL, PATH_APP } from "../../../routes/paths";
// domain
import { OrdenType } from "../../../domain/orden/Orden";
// utils
import track from "../../../utils/analytics";
import { delay, fISODate } from "../../../utils/helpers";

// ----------------------------------------------------------------------

const buildOrdenDetailsURL = (ordenId: string) => {
  const _url = new URL(
    PATHS_EXTERNAL.restaurantApp + "/ext"+ordenId
  );
  // _url.searchParams.append("ordenId", ordenId);
  return _url;
};

// ----------------------------------------------------------------------

type OrdenDetailsProps = {
  ordenId: string;
};

const OrdenDetails: React.FC<OrdenDetailsProps> = ({ ordenId }) => {
  const theme = useTheme();
  const fetched = useRef(false);
  const { sessionToken } = useAuth();
  const reportTemplateRef = useRef(null);
  const navigate = useNavigate();
  const [ordenReceipt, setOrdenReceipt] = useState<OrdenType>(ORD_RECEIPT);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [openPDF, setOpenPDF] = useState<boolean>(false);
  const [downloadPDF, setDownloadPDF] = useState<boolean>(false);
  const [openDeleteBranchMenu, setOpenDeleteBranchMenu] =
    useState<boolean>(false);
  const dispatch = useAppDispatch();
  const { ordenDetails, isLoading, ordenDetailsNotFound, invoiceDetails } =
    useAppSelector((state) => state.orden);
  const { business } = useAppSelector((state) => state.account);

  // dispatch action to get orden details
  useEffect(() => {
    if (!ordenId) return;
    if (!sessionToken) return;
    if (fetched.current) return;
    dispatch(getOrdenDetails(ordenId, sessionToken));
    dispatch(getInvoiceDetails(ordenId, sessionToken));
    fetched.current = true;
  }, [dispatch, ordenId, sessionToken]);

  // set orden details
  useEffect(() => {
    if (
      !ordenDetails.id ||
      ordenDetails.id === "********-*********-*********-*******"
    )
      return;
    setOrdenReceipt(ordenDetails);
  }, [ordenDetails]);

  useEffect(() => {
    // Cleanup function
    return () => {
      // Clear or reset the variables when leaving the page
      dispatch(clearActiveInvoicesOrden());
      dispatch(clearInvoiceDetailsSuccess());
      // Additional cleanup if needed
    };
  }, [dispatch]);

  // not found
  useEffect(() => {
    setNotFound(ordenDetailsNotFound);
  }, [ordenDetailsNotFound]);

  // loading screen
  if (isLoading) {
    return <LoadingProgress sx={{ mt: 3 }} />;
  }

  // Menu options
  const menuOptions = [
    {
      label: "Editar Pedido",
      allowed:
        !["delivered", "canceled"].includes(
          ordenReceipt?.status || "submitted"
        ) && !invoiceDetails?.id,
      action: () => {
        navigate(PATH_APP.orden.edit.replace(":ordenId", ordenId));
        track("checkout_progress", {
          visit: window.location.toString(),
          page: "OrdenDetails",
          section: "OrdenDetailsMenu",
        });
      },
      icon: (
        <Icon
          icon={EditFill}
          width={20}
          height={20}
          color={theme.palette.text.disabled}
        />
      ),
    },
    {
      label: "Confirmar Pedido",
      allowed: (ordenReceipt?.status || "submitted") === "submitted",
      action: async () => {
        try {
          await dispatch(confirmOrden(ordenId, sessionToken || ""));
          enqueueSnackbar("Pedido fue confirmado", {
            variant: "success",
            autoHideDuration: 2000,
          });
          track("checkout_progress", {
            visit: window.location.toString(),
            page: "OrdenDetails",
            section: "OrdenDetailsMenu",
          });
          // reload
          dispatch(getOrdenDetails(ordenId, sessionToken || ""));
          dispatch(getInvoiceDetails(ordenId, sessionToken || ""));
        } catch (error) {
          console.log("Error confirming orden", error);
          enqueueSnackbar("Error confirmando pedido", {
            variant: "error",
            autoHideDuration: 2000,
          });
        }
      },
      icon: (
        <Icon
          icon={ConfirmFill}
          width={20}
          height={20}
          color={theme.palette.text.disabled}
        />
      ),
    },
    {
      label: "Marcar como Entregado",
      allowed: (ordenReceipt?.status || "submitted") === "accepted",
      action: async () => {
        try {
          await dispatch(deliverOrden(ordenId, sessionToken || ""));
          enqueueSnackbar("Pedido fue puesto como entregado", {
            variant: "success",
            autoHideDuration: 2000,
          });
          track("checkout_progress", {
            visit: window.location.toString(),
            page: "OrdenDetails",
            section: "OrdenDetailsMenu",
          });
          // reload
          dispatch(getOrdenDetails(ordenId, sessionToken || ""));
          dispatch(getInvoiceDetails(ordenId, sessionToken || ""));
        } catch (error) {
          console.log("Error deliverying orden", error);
          enqueueSnackbar("Error marcando como entregado el pedido", {
            variant: "error",
            autoHideDuration: 2000,
          });
        }
      },
      icon: (
        <Icon
          icon={DeliverFill}
          width={20}
          height={20}
          color={theme.palette.text.disabled}
        />
      ),
    },
    {
      label: "Cancelar Pedido",
      allowed: (ordenReceipt?.status || "submitted") !== "canceled", // [TODO] - permissions
      action: () => {
        setOpenDeleteBranchMenu(true);
        track("refund", {
          visit: window.location.toString(),
          page: "OrdenDetails",
          section: "OrdenDetailsMenu",
        });
      },
      icon: (
        <Icon
          icon={CancelFill}
          width={20}
          height={20}
          color={theme.palette.text.disabled}
        />
      ),
    },
    {
      label: "Ver PDF",
      allowed: !navigator.share,
      action: () => {
        // handleGeneratePdf();
        setOpenPDF(true);
        track("share", {
          visit: window.location.toString(),
          page: "OrdenDetails",
          section: "OrdenDetailsMenu",
        });
      },
      icon: (
        <Icon
          icon={eyeFill}
          width={20}
          height={20}
          color={theme.palette.text.disabled}
        />
      ),
    },
    {
      label: "Descargar PDF",
      allowed: true,
      action: () => {
        // handleGeneratePdf();
        setDownloadPDF(true);
        track("share", {
          visit: window.location.toString(),
          page: "OrdenDetails",
          section: "OrdenDetailsMenu",
        });
        const setOff = async () => {
          await delay(5000);
          setDownloadPDF(false);
        };
        setOff();
      },
      icon: (
        <Icon
          icon={DownloadFill}
          width={20}
          height={20}
          color={theme.palette.text.disabled}
        />
      ),
    },
    {
      label: "Copiar Link del Pedido",
      allowed: true,
      action: async () => {
        const tempUrl = buildOrdenDetailsURL(ordenId);
        navigator.clipboard.writeText(tempUrl.toString());
        await delay(500);
        enqueueSnackbar(
          "El Link de la Orden ha sido copiado a tu portapapeles. Puedes compartirlo con quien necesites.",
          { variant: "success", autoHideDuration: 3000 }
        );
        track("share", {
          ordenId: ordenId,
          visit: window.location.toString(),
          page: "OrdenDetails",
          section: "OrdenDetailsMenu",
        });
      },
      icon: (
        <Icon
          icon={linkFill}
          width={20}
          height={20}
          color={theme.palette.text.disabled}
        />
      ),
    },
    {
      label: "Compartir Orden",
      allowed: navigator.share, // [TODO] - review permissions
      action: () => {
        const data = {
          title: "Pedido Alima",
          text: `Pedido Alima - ${business?.businessName || "alima"}-${
            ordenReceipt.restaurantBranch.branchName
          }-${fISODate(ordenReceipt.deliveryDate)}`,
          url: buildOrdenDetailsURL(ordenId).toString(),
        };

        if (navigator.canShare && navigator.canShare(data)) {
          navigator
            .share(data)
            .then(() => {
              enqueueSnackbar("Orden compartida correctamente", {
                variant: "success",
              });
            })
            .catch((error) => {
              console.log("Issues sharing orden PDF", error);
              enqueueSnackbar("Error compartiendo orden", {
                variant: "error",
              });
            });
        } else {
          enqueueSnackbar(
            "Lo sentimos, la función de compartir es sólo para teléfono móvil",
            {
              variant: "warning",
            }
          );
        }

        track("share", {
          visit: window.location.toString(),
          page: "OrdenDetails",
          section: "OrdenDetailsMenu",
        });
      },
      icon: <WhatsAppIcon width={20} height={20} color="disabled" />,
    },
    {
      label: "Imprimir Ticket",
      allowed: navigator.share, // [TODO] - review permissions
      action: () => {
        const ordenStr = formatTicketOrdenDetails(ordenReceipt, business);
        const blob = new Blob([ordenStr], { type: "text/plain" });
        const data = {
          files: [
            new File(
              [blob],
              `${business?.businessName || "alima"}-${
                ordenReceipt.restaurantBranch.branchName
              }-${fISODate(ordenReceipt.deliveryDate)}.txt`,
              {
                type: blob.type,
              }
            ),
          ],
          title: `Ticket ${business?.businessName || "alima"} ${
            ordenReceipt.restaurantBranch.branchName
          } ${fISODate(ordenReceipt.deliveryDate)}`,
        };
        // share
        if (navigator.canShare && navigator.canShare(data)) {
          navigator
            .share(data)
            .then(() => {
              enqueueSnackbar("Pedido se ha enviado a imprimir", {
                variant: "success",
              });
            })
            .catch((error) => {
              console.log("Issues sharing to print ticket", error);
              enqueueSnackbar("Error al enviar a imprimir", {
                variant: "error",
              });
            });
        } else {
          enqueueSnackbar(
            "Lo sentimos, la función de Imprimir ticket es sólo para teléfono móvil",
            {
              variant: "warning",
            }
          );
        }
        track("share", {
          visit: window.location.toString(),
          page: "OrdenDetails",
          section: "OrdenDetailsMenu",
        });
      },
      icon: <ConfirmationNumberIcon width={20} height={20} color="disabled" />,
    },
  ];

  return (
    <OrdenDetailsView
      ordenId={ordenId}
      sessionToken={sessionToken || ""}
      notFound={notFound}
      ordenReceipt={ordenReceipt}
      business={business}
      menuOptions={menuOptions}
      openDeleteBranchMenu={openDeleteBranchMenu}
      setOpenDeleteBranchMenu={setOpenDeleteBranchMenu}
      reportTemplateRef={reportTemplateRef}
      openPDF={openPDF}
      setOpenPDF={setOpenPDF}
      downloadPDF={downloadPDF}
    />
  );
};

export default OrdenDetails;
