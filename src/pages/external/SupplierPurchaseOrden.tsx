import { useEffect, useRef, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
// material
import { styled } from "@mui/material/styles";
import { Box, Card, Stack, Typography, useTheme } from "@mui/material";
import { Icon } from "@iconify/react";
import DownloadFill from "@iconify/icons-ic/file-download";
import ConfirmFill from "@iconify/icons-ic/check-circle";
// routes
// redux
import {
  externalConfirmOrden,
  getExternalOrdenDetails,
} from "../../redux/slices/orden";
// hooks
import { useAppDispatch, useAppSelector } from "../../redux/store";
// components
import Page from "../../components/Page";
import Logo from "../../components/Logo";
import MHidden from "../../components/extensions/MHidden";
import LoadingProgress from "../../components/LoadingProgress";
import OrdenDetailsView from "../../components/orden/OrdenDetailsView";
import BasicDialog from "../../components/navigation/BasicDialog";
// utils
import { delay } from "../../utils/helpers";
// domain
import { OrdenType } from "../../domain/orden/Orden";

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    display: "flex",
  },
}));

const SectionStyle = styled(Card)(({ theme }) => ({
  width: "100%",
  maxWidth: 464,
  height: "96vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  margin: theme.spacing(2, 0, 2, 2),
}));

const ContentStyle = styled("div")(({ theme }) => ({
  maxWidth: 400,
  // margin: 'auto',
  // display: 'flex',
  minHeight: "120vh",
  flexDirection: "column",
  //   justifyContent: 'center',
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function SupplierPurchaseOrden() {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const {
    externalOrdenDetails,
    externalOrdenStatus,
    isLoading: externalLoading,
  } = useAppSelector((state) => state.orden);
  const theme = useTheme();
  const reportTemplateRef = useRef(null);
  const [ordenId, setOrdenId] = useState<string>("");
  const [openDeleteBranchMenu, setOpenDeleteBranchMenu] =
    useState<boolean>(false);
  const [openConfirmMenu, setOpenConfirmMenu] = useState<boolean>(false);
  const [displayOrden, setDisplayOrden] = useState<OrdenType | null>(null);
  const [downloadPdf, setDownloadPdf] = useState<boolean>(false);

  useEffect(() => {
    if (searchParams.has("ordenId")) {
      const parsedOrdenId = searchParams.get("ordenId");
      setOrdenId(parsedOrdenId || "");
    }
  }, [searchParams]);

  // If not valid redirect to not found.
  useEffect(() => {
    if (!ordenId) return;
    // fetch order details.
    dispatch(getExternalOrdenDetails(ordenId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, ordenId]);

  // set order details to display.
  useEffect(() => {
    if (externalOrdenDetails) {
      setDisplayOrden(externalOrdenDetails);
    }
  }, [externalOrdenDetails]);

  // confirm orden
  const confirmExternalOrden = () => {
    setOpenConfirmMenu(true);
  };

  // Menu options
  const menuOptions = [
    {
      label: "Descargar Pedido",
      allowed: true,
      action: () => {
        setDownloadPdf(true);
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
      label: "Confirmar Pedido",
      allowed: displayOrden?.status === "submitted",
      action: () => {
        confirmExternalOrden();
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
  ];

  return (
    <>
      {/* Cancel Orden confirmation */}
      <BasicDialog
        title="Confirmar Pedido"
        msg="¿Estás seguro que deseas confirmar éste pedido?"
        open={openConfirmMenu}
        onClose={() => setOpenConfirmMenu(false)}
        continueAction={{
          active: true,
          msg: "Si, confirmar",
          actionFn: async () => {
            try {
              await dispatch(externalConfirmOrden(displayOrden?.id || ""));
              enqueueSnackbar("Pedido fue confirmado", {
                variant: "success",
                autoHideDuration: 3000,
              });
              setOpenConfirmMenu(false);
              // reload page
              await delay(1000);
              dispatch(getExternalOrdenDetails(ordenId));
            } catch (error) {
              console.log("Error confirming orden", error);
              enqueueSnackbar("Error confimando pedido", {
                variant: "error",
                autoHideDuration: 3000,
              });
            }
          },
        }}
        backAction={{
          active: true,
          msg: "No",
          actionFn: () => setOpenConfirmMenu(false),
        }}
        closeMark={true}
      />
      {externalLoading && <LoadingProgress />}
      {!externalLoading && (
        <RootStyle title="Orden de Compra | Alima">
          <MHidden width="mdDown">
            <SectionStyle>
              <Box
                component={RouterLink}
                to="/"
                sx={{ display: "inline-flex", paddingLeft: 5 }}
              >
                <Logo height={100} width={160} />
              </Box>
              <Typography variant="h4" sx={{ px: 5, mt: 5 }}>
                Escala tu negocio con Alima.
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ pl: 5, pr: 6, mt: 3, mb: 5 }}
              >
                Únete a nuestra red de proveedores y aumenta tus ventas a
                negocios de alimentos. Contamos con más de 1,800 restaurantes,
                hoteles, comedores industriales, y más.
              </Typography>
              <Box sx={{ px: 6 }}>
                <img
                  className="lazyload blur-up"
                  src="/static/assets/illustrations/increase_sales.jpg"
                  alt="suppliers"
                  style={{ borderRadius: "16px" }}
                />
              </Box>
            </SectionStyle>
          </MHidden>

          <Box
            sx={{ mx: { md: theme.spacing(10) }, pb: { sm: theme.spacing(3) } }}
          >
            {/* If orden and display orden. Show success message. */}
            {displayOrden?.id && (
              <OrdenDetailsView
                ordenId={ordenId}
                sessionToken={""}
                notFound={externalOrdenStatus.status}
                ordenReceipt={displayOrden}
                business={{
                  businessName: displayOrden?.restaurantBranch?.businessName,
                  displayName: displayOrden?.restaurantBranch?.displayName,
                  email: displayOrden?.restaurantBranch?.email,
                  phoneNumber: displayOrden?.restaurantBranch?.phoneNumber,
                }}
                menuOptions={menuOptions}
                openDeleteBranchMenu={openDeleteBranchMenu}
                setOpenDeleteBranchMenu={setOpenDeleteBranchMenu}
                reportTemplateRef={reportTemplateRef}
                downloadPDF={downloadPdf}
              />
            )}
            {/* If no order details. Show not found. */}
            {!displayOrden?.id && !externalOrdenStatus.status && (
              <ContentStyle>
                <Stack
                  direction="row"
                  alignItems="center"
                  sx={{ mt: 2, mb: 2 }}
                >
                  <Box>
                    <Typography variant="h4" gutterBottom>
                      No se encontró el pedido.
                    </Typography>
                    <Typography sx={{ color: "text.secondary" }}>
                      El pedido que estás buscando no existe o ya no está
                      disponible.
                    </Typography>
                  </Box>
                </Stack>
              </ContentStyle>
            )}
          </Box>          
        </RootStyle>
      )}
    </>
  );
}
