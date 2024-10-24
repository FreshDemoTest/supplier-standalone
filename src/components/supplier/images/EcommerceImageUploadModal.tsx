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
import track from "../../../utils/analytics";
import { DragDropImages } from "../../DragDropFiles";
import { addEcommerceImage } from "../../../redux/slices/account";

// ----------------------------------------------------------------------

type EcommerceImageUploadModalProps = {
  open: boolean;
  onClose: (a: boolean) => void;
  supplierBusinessId: string;
  imageType?: "logo" | "banner" | "icon";
  editMode?: boolean;
};

const EcommerceImageUploadModal: React.FC<EcommerceImageUploadModalProps> = ({
  open,
  onClose,
  supplierBusinessId,
  imageType,
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
    track("select_content", {
      visit: window.location.toString(),
      page: "EcommerceDetails",
      section: "EcommerceProductImageSelector",
      supplierBusinessId,
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
      // Add image
      await dispatch(
        addEcommerceImage(
          sessionToken,
          files[0],
          supplierBusinessId,
          imageType || "logo"
        )
      );

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
              {`Sube la imagen de tu ${imageType} en formato (.png, .jpg, .jpeg, .webp o .HEIC) para ${
                editMode ? "actualizarla" : "agregarla"
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
              squareImgs={false}
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

export default EcommerceImageUploadModal;
