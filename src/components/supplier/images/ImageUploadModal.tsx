import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
// hooks
import useAuth from "../../../hooks/useAuth";
import { useSnackbar } from "notistack";
// domain
import { useAppDispatch } from "../../../redux/store";
import { mixtrack } from "../../../utils/analytics";
import { DragDropImages } from "../../DragDropFiles";
import {
  addSupplierProductImage,
  updateSupplierProductImage,
} from "../../../redux/slices/supplier";

// ----------------------------------------------------------------------

type ImageUploadModalProps = {
  open: boolean;
  onClose: (a: boolean) => void;
  supplierProductId: string;
  supplierProductImageId?: string;
  editMode?: boolean;
};

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  open,
  onClose,
  supplierProductId,
  supplierProductImageId,
  editMode = false,
}) => {
  const theme = useTheme();
  const { sessionToken } = useAuth();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [files, setFiles] = useState<FileList | null>(null); // files to upload
  const [loading, setLoading] = useState<boolean>(false);

  const handleUploadImage = async () => {
    setLoading(true);
    mixtrack("product_image_upload", {
      visit: window.location.toString(),
      page: "ProductDetails",
      section: "ProductImageSelector",
      supplierProductId,
    });
    try {
      if (!sessionToken) {
        enqueueSnackbar(
          "Error de conexión, recarga la página y vuelve a intentar.",
          {
            variant: "warning",
            autoHideDuration: 1000,
          }
        );
        setLoading(false);
        return;
      }
      if (!files || files?.length === 0) {
        enqueueSnackbar("Selecciona un archivo para subir", {
          variant: "warning",
          autoHideDuration: 1000,
        });
        setLoading(false);
        return;
      }
      if (!editMode) {
        // Add image
        await dispatch(
          addSupplierProductImage(sessionToken, files[0], supplierProductId)
        );
      } else {
        if (!supplierProductImageId) {
          enqueueSnackbar(
            "No se puede actualizar la imagen, intenta de nuevo (ID faltante).",
            {
              variant: "error",
              autoHideDuration: 1000,
            }
          );
          setLoading(false);
          return;
        }
        // Update Image
        await dispatch(
          updateSupplierProductImage(
            sessionToken,
            files[0],
            supplierProductImageId
          )
        );
      }
      enqueueSnackbar(
        `Tu imagen se ${editMode ? "actualizó" : "guardó"} correctamente`,
        {
          variant: "success",
          autoHideDuration: 1000,
        }
      );
      // [TODO] clear files
      onClose(true);
      setLoading(false);
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar(
        `Error al ${editMode ? "actualizar" : "guardar"} tu imagen`,
        {
          variant: "error",
        }
      );
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => onClose(false)}
      aria-labelledby="upload-img-dialog"
      aria-describedby="upload-img-dialog-description"
      sx={{
        "& .MuiDialog-paper": {
          width: "100%",
          maxWidth: "500px",
          maxHeight: { xs: "55vh", md: "65vh" },
        },
      }}
    >
      <DialogTitle
        id="upload-img-dialog"
        variant="h6"
        color="text.primary"
        sx={{ mt: 1, ml: 1 }}
      >
        {editMode ? `Actualiza tu Imagen` : `Agrega tu Imagen`}
      </DialogTitle>
      <DialogContent>
        <Grid container sx={{ mt: { xs: 3, md: 3 } }}>
          {/* Cargar imagen */}
          <Grid item xs={12} md={12}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{
                mt: { xs: 0, md: 2 },
                mx: { xs: 0, md: 3 },
                fontWeight: theme.typography.fontWeightRegular,
              }}
            >
              {`Sube la imagen en formato (.png, .jpg, .jpeg, .webp o .HEIC) para ${
                editMode ? "actualizarla" : "agregarla a tu producto"
              }.`}
            </Typography>
          </Grid>
          <Grid item xs={12} md={12} sx={{ mt: 2 }}>
            <DragDropImages
              filesVar={files}
              setFilesVar={setFiles}
              acceptFiles={["image/*"]}
              selectFilesMsg="Arrastra y suelta tu archivo aquí o haz click para seleccionar tu archivo."
              multiple={false}
              sx={{ mx: { xs: 1 } }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          sx={{ mr: 2, my: 1 }}
          onClick={() => onClose(false)}
          color="info"
        >
          Cerrar
        </Button>

        <LoadingButton
          sx={{ mr: 2, my: 1 }}
          onClick={handleUploadImage}
          color="primary"
          variant="contained"
          disabled={!files}
          loading={loading}
        >
          {editMode ? "Actualizar" : "Agregar"}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default ImageUploadModal;
