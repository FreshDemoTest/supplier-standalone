import { useEffect, useState } from "react";
import { Box, Button, Grid, Paper, Typography } from "@mui/material";
import PlusIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import { buildAllImage, buildIBannerImageDetail } from "../../../utils/imagesCdn";
// import {
//   deleteSupplierProductImage
// } from "../../../redux/slices/supplier";
import useAuth from "../../../hooks/useAuth";
import BasicDialog from "../../navigation/BasicDialog";
import { useSnackbar } from "notistack";
import {
  deleteEcommerceImage,
  getBusinessAccount,
} from "../../../redux/slices/account";
import EcommerceImageUploadModal from "./EcommerceImageUploadModal";
import { alimaAppDeployment } from "../../../config";

// ----------------------------------------------------------------------

type EcommerceImageSelectorProps = {
  supplierBusinessId?: string;
  imageType?: 'logo'|'banner'|'icon'
};

export const EcommerceImageSelector: React.FC<
  EcommerceImageSelectorProps
> = ({ supplierBusinessId, imageType }) => {
  const dispatch = useAppDispatch();
  const { sessionToken } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const { business } = useAppSelector((state) => state.account);
  const [ecommerceImage, setEcommerceImage] = useState<string>("");
  const [addImageOpen, setAddImageOpen] = useState(false);
  const [editImageOpen, setEditImageOpen] = useState(false);
  const [deleteImageOpen, setDeleteImageOpen] = useState(false);
  const cloudinaryEnv: string = alimaAppDeployment.publicUrl === 'https://seller.alima.la' || alimaAppDeployment.publicUrl === 'http://seller.alima.la' ? "PROD" : "STG";
  const urlImage = `alima-marketplace-${cloudinaryEnv}/supplier/profile/${supplierBusinessId}_${imageType}.png`

  // onMount
  useEffect(() => {
    if (!supplierBusinessId) return;
    if (imageType === 'banner') {
      setEcommerceImage(buildIBannerImageDetail(urlImage));
      return;
    }
    setEcommerceImage(buildAllImage(urlImage));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplierBusinessId]);

  const handleError = () => {
    setEcommerceImage("");
  };

  // it not product id return null
  if (!supplierBusinessId) return null;
  return (
    <>
      {/* Add Image Dialog */}
      <EcommerceImageUploadModal
        open={addImageOpen}
        onClose={(correctImg: boolean) => {
          if (correctImg) {
            // refetch product details
            dispatch(getBusinessAccount(sessionToken || ""));
          }
          setAddImageOpen(false);
        }}
        supplierBusinessId={supplierBusinessId}
        imageType={imageType}
        />
      {/* Edit Image Dialog */}
      <EcommerceImageUploadModal
        open={editImageOpen}
        editMode
        onClose={(correctImg: boolean) => {
          if (correctImg) {
            // refetch product details
            dispatch(getBusinessAccount(sessionToken || ""));
          }
          setEditImageOpen(false);
        }}
        supplierBusinessId={supplierBusinessId}
        imageType={imageType}
      />
      {/* Delete Image Dialog */}
      <BasicDialog
        open={deleteImageOpen}
        onClose={() => {
          setDeleteImageOpen(false);
        }}
        title="Eliminar Imagen"
        msg="¿Estás seguro de eliminar esta imagen?"
        continueAction={{
          active: true,
          msg: "Si, Eliminar",
          actionFn: async () => {
            try {
              if (!sessionToken) {
                enqueueSnackbar(
                  "Error de conexión, recarga la página y vuelve a intentar.",
                  {
                    variant: "warning",
                    autoHideDuration: 1000,
                  }
                );
                return;
              }
              // delete image
              await dispatch(
                deleteEcommerceImage(
                  sessionToken,
                  supplierBusinessId || "",
                  imageType||'logo'
                )
              );
              // refetch product details
              dispatch(getBusinessAccount(sessionToken || ""));
              // close dialog
              setDeleteImageOpen(false);
              enqueueSnackbar("Imagen eliminada correctamente.", {
                variant: "success",
                autoHideDuration: 1000,
              });
            } catch (error) {
              console.error(error);
              enqueueSnackbar("Error al eliminar la imagen", {
                variant: "error",
                autoHideDuration: 1000,
              });
              setDeleteImageOpen(false);
            }
          },
        }}
        backAction={{
          active: true,
          msg: "No",
          actionFn: () => {
            setDeleteImageOpen(false);
          },
        }}
      />
      {/* Main component */}
      <Paper sx={{ p: 2, mb: 1 }}>
        <Grid container>
          <Grid item xs={12} md={12}>
            {/* Add image Button */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
              {ecommerceImage ? (
                <>
                  <Button
                    startIcon={<DeleteIcon />}
                    variant="outlined"
                    color="error"
                    size="small"
                    sx={{ mr: 2 }}
                    onClick={() => {
                      setDeleteImageOpen(true);
                    }}
                  >
                    Eliminar
                  </Button>
                </>
              ) : null}
              {!ecommerceImage ? (
                <Button
                  startIcon={<PlusIcon />}
                  variant="contained"
                  color="info"
                  size="small"
                  onClick={() => setAddImageOpen(true)}
                >
                  Agregar
                </Button>
              ) : (
                <Button
                  startIcon={<EditIcon />}
                  variant="outlined"
                  color="info"
                  size="small"
                  sx={{ mr: 2 }}
                  onClick={() => setEditImageOpen(true)}
                >
                  Editar
                </Button>
              )}
            </Box>
            {/* display selected image */}
            {ecommerceImage ? (
              <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                <Box
                  component="img"
                  alt={business?.businessName || imageType || "Imagen"}
                  data-src={`${ecommerceImage}?${Date.now()}`}
                  src={`${ecommerceImage}?${Date.now()}`}
                  className="lazyload blur-up"
                  onError={handleError}                  
                  sx={{
                    my: 2,
                    mx: 1,
                    width: { md: 320, xs: 240 },
                    height: "auto",
                    borderRadius: 1.5,
                  }}
                />
              </Box>
            ) : null}
            {/* If no images */}
            {ecommerceImage === "" ? (
              <Box sx={{ my: 10 }}>
                <Typography variant="h6" color="text.secondary" align="center">
                  No hay logo para mostrar.
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  align="center"
                >
                  Da click en Agregar Imagen.
                </Typography>
              </Box>
            ) : null}
          </Grid>
        </Grid>
      </Paper>
    </>
  );
};
