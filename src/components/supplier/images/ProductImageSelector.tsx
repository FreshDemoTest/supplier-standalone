import { useEffect, useState } from "react";
import { Box, Button, Grid, Paper, Typography } from "@mui/material";
import PlusIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { DropResult } from "react-beautiful-dnd";
import DraggableImageList from "./DraggableImageList";
import { reorderList } from "./draggableHelper";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import { SupplierProductImage } from "../../../domain/supplier/SupplierProduct";
import { buildImageDetail } from "../../../utils/imagesCdn";
import ImageUploadModal from "./ImageUploadModal";
import {
  deleteSupplierProductImage,
  getProductDetails,
  reorderSupplierProductImages,
} from "../../../redux/slices/supplier";
import useAuth from "../../../hooks/useAuth";
import BasicDialog from "../../navigation/BasicDialog";
import { useSnackbar } from "notistack";

// ----------------------------------------------------------------------

type ProductImageSelectorProps = {
  productId?: string;
};

export const ProductImageSelector: React.FC<ProductImageSelectorProps> = ({
  productId,
}) => {
  const dispatch = useAppDispatch();
  const { sessionToken } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const { supplierProductDetails } = useAppSelector((state) => state.supplier);
  const [prodImages, setProdImages] = useState<SupplierProductImage[]>([]);
  const [selected, setSelected] = useState<string | null>(
    prodImages[0]?.id || null
  );
  const [selectedImg, setSelectedImg] = useState<SupplierProductImage | null>(
    null
  );
  const [addImageOpen, setAddImageOpen] = useState(false);
  const [editImageOpen, setEditImageOpen] = useState(false);
  const [deleteImageOpen, setDeleteImageOpen] = useState(false);

  // onMount
  useEffect(() => {
    if (!supplierProductDetails) return;

    const _itms = supplierProductDetails.images || [];
    setProdImages(_itms);
    setSelected(_itms[0]?.id || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplierProductDetails]);

  // onSelect change
  useEffect(() => {
    if (selected) {
      const img = prodImages.find((v) => v.id === selected);
      if (img) {
        setSelectedImg({
          ...img,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  // handlers
  const onDragEnd = ({ destination, source }: DropResult) => {
    // dropped outside the list
    if (!destination) return;

    const newItems = reorderList(prodImages, source.index, destination.index);
    setProdImages(newItems);
    // async reorganize images
    const _reorgImgs = async () => {
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
        // reorganize images
        await dispatch(
          reorderSupplierProductImages(
            sessionToken,
            productId || "",
            newItems.map((it, idx) => ({
              id: it.id,
              priority: idx + 1,
            }))
          )
        );
      } catch (error) {
        console.error(error);
        enqueueSnackbar("Error al reorganizar las imágenes", {
          variant: "error",
          autoHideDuration: 1000,
        });
      }
    };
    _reorgImgs();
  };

  // it not product id return null
  if (!productId) return null;

  // render vars
  const defaultImg = "/static/assets/alima/alima-leaf.jpg";
  const coverImg = selectedImg
    ? buildImageDetail(selectedImg.imageUrl)
    : defaultImg;

  return (
    <>
      {/* Add Image Dialog */}
      <ImageUploadModal
        open={addImageOpen}
        onClose={(correctImg: boolean) => {
          if (correctImg) {
            // refetch product details
            dispatch(getProductDetails(productId || "", sessionToken || ""));
          }
          setAddImageOpen(false);
        }}
        supplierProductId={productId}
      />
      {/* Edit Image Dialog */}
      <ImageUploadModal
        open={editImageOpen}
        editMode
        onClose={(correctImg: boolean) => {
          if (correctImg) {
            // refetch product details
            dispatch(getProductDetails(productId || "", sessionToken || ""));
          }
          setEditImageOpen(false);
        }}
        supplierProductId={productId}
        supplierProductImageId={selectedImg?.id || ""}
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
                deleteSupplierProductImage(sessionToken, selected || "")
              );
              // refetch product details
              dispatch(getProductDetails(productId || "", sessionToken || ""));
              // close dialog
              setDeleteImageOpen(false);
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
              {selectedImg ? (
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
                </>
              ) : null}
              <Button
                startIcon={<PlusIcon />}
                variant="contained"
                color="info"
                size="small"
                onClick={() => setAddImageOpen(true)}
              >
                Agregar
              </Button>
            </Box>
            {/* display selected image */}
            {selectedImg ? (
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Box
                  component="img"
                  alt={
                    supplierProductDetails?.productDescription ||
                    "Imagen producto"
                  }
                  data-src={`${coverImg}?${Date.now()}`}
                  src={`${coverImg}?${Date.now()}`}
                  className="lazyload blur-up"
                  sx={{
                    my: 2,
                    mx: 1,
                    width: 360,
                    height: 360,
                    borderRadius: 1.5,
                  }}
                />
              </Box>
            ) : null}
            {/* If no images */}
            {prodImages.length === 0 ? (
              <Box sx={{ my: 10 }}>
                <Typography variant="h6" color="text.secondary" align="center">
                  No hay imágenes para mostrar.
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
          <Grid item xs={12} md={12}>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              <Paper
                sx={{
                  flex: 1,
                  width: "100%",
                  overflowX: "scroll",
                }}
              >
                <DraggableImageList
                  items={prodImages}
                  onDragEnd={onDragEnd}
                  selectedImg={selected}
                  onSelectImg={(v) => setSelected(v)}
                />
              </Paper>
            </div>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
};
