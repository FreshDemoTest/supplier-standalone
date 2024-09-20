import * as Yup from "yup";
import { useEffect, useState } from "react";
// material
import { Icon } from "@iconify/react";
import { useSnackbar } from "notistack";
import { useFormik, Form, FormikProvider } from "formik";
import closeFill from "@iconify/icons-eva/close-fill";
import {
  Stack,
  TextField,
  IconButton,
  InputAdornment,
  Typography,
  useTheme,
  Grid,
  Box,
  Checkbox,
  FormControlLabel,
  Tooltip,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  DialogActions,
} from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import { LoadingButton } from "@mui/lab";
// redux
import {
  resetSupplierProdDetails,
} from "../../redux/slices/supplier";
// hooks
import { useAppDispatch } from "../../redux/store";
import useAuth from "../../hooks/useAuth";
// utils
import { delay } from "../../utils/helpers";
import {
  SupplierProductType
} from "../../domain/supplier/SupplierProduct";
import { EcommerceDetailsType } from "../../domain/account/Ecommerce";
import { EcommerceImageSelector } from "./images/EcommerceImageSelector";
import ColorPickerBlock from "../services/ColorPickerBlock";
import { editEcommerceParams, getEcommerceInfo } from "../../redux/slices/account";
import { SelectedMultiValueInput } from "../MultiValueInput";
import { buildAllImage, buildImageUrl } from "../../utils/imagesCdn";


// ----------------------------------------------------------------------

type OptionType = {
  label: string;
  value: string;
};

type EcommerceParamsFormProps = {
  onSuccessCallback: (flag: boolean) => void;
  ecommerceState: EcommerceDetailsType;
  supplierProdsCatalog: SupplierProductType[];
};

const EcommerceParamsForm: React.FC<EcommerceParamsFormProps> = ({
  onSuccessCallback,
  ecommerceState = {
    sellerName: '',
    bannerImgHref: '',
    categories: undefined,
    recProds: [],
    stylesJson: '',
    shippingEnabled: false,
    shippingRuleVerifiedBy: '',
    shippingThreshold: 0,
    shippingCost: 0,
    searchPlaceholder: '',
    footerMsg: '',
    footerCta: '',
    footerPhone: '',
    footerIsWa: false,
    footerEmail: '',
    seoDescription: '',
    seoKeywords: '',
    defaultSupplierUnitId: '',
    commerceDisplay: '',
    currency: '',
    supplierBusinessId: '',
    ecommerceUrl: '',
  },
  supplierProdsCatalog = [],
}) => {
  // vars

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const theme = useTheme();
  const { sessionToken } = useAuth();
  const dispatch = useAppDispatch();
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [productList, setProductList] = useState<{ id: string | undefined; productDescription: string }[]>([]);
  const [colors, setColors] = useState<string[]>([
    '#ff0000',
    '#00ff00',
    '#0000ff'
  ]);
  const [border, setBorder] = useState<number>(0);
  const [productDict, setProductDict] = useState<Record<string, string>>({});
  const [getAllInfo, setGetAllInfo] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  // useEffect(()=> {
  //   setRecProducts(supplierProdsCatalog.map((sp) => ({
  //     label: sp.productDescription,
  //     value: sp.id || "",
  //   })));
  // })

  // hook to fetch products
  useEffect(() => {
    const categorySet = new Set<string>();
    supplierProdsCatalog.forEach((sp: SupplierProductType) => {
      sp.tags?.forEach((tag) => {
        if (tag.tagKey === "category") {
          categorySet.add(tag.tagValue);
        }
      });
    });
    setCategoriesList(Array.from(categorySet));
    const productListDescriptions = supplierProdsCatalog.map((sp) => ({
      id: sp.id,
      productDescription: sp.productDescription,
    })).filter((v) => v.id !== undefined);
    setProductList(productListDescriptions);
    const productsDict = productListDescriptions.reduce((acc, v) => {
      acc[v.id || ""] = v.productDescription;
      return acc;
    }, {} as Record<string, string>);
    setProductDict(productsDict);
    setGetAllInfo(true);
  }, [supplierProdsCatalog]
  );

  // hook to fetch products
  useEffect(() => {
    //convert stylesJson to json
    if (ecommerceState.stylesJson === '' || ecommerceState.stylesJson === undefined) return;
    const stylesJsonData = JSON.parse(ecommerceState.stylesJson);
    const stylescolor = [stylesJsonData["palette"]["primary"], stylesJsonData["palette"]["secondary"], stylesJsonData["palette"]["info"]];
    setColors(stylescolor);
    const stylesborder = stylesJsonData["shape"]["borderRadius"];
    setBorder(stylesborder);
  }, [ecommerceState]
  );

  // on dismount reset satCodes
  useEffect(() => {
    return () => {
      dispatch(resetSupplierProdDetails());
    };
  }, [dispatch]);


  // yup schema based on supProductState
  const EcommerceParamsSchema = Yup.object().shape({
    bannerImgHref: Yup.string(),
    searchPlaceholder: Yup.string(),
    footerMsg: Yup.string(),
    footerCta: Yup.string(),
    footerPhone: Yup.string()
      .length(10, '¡Teléfono debe de ser a 10 dígitos')
      .matches(/\d*/)
      .required('Teléfono es requerido.'),
    footerEmail: Yup.string()
      .email('¡Correo eléctronico inválido!')
      .required('Correo electrónico es requerido.'),
    footerIsWa: Yup.boolean(),
    seoDescription: Yup.string().required("Costo de envío es requerida."),
    seoKeywords: Yup.string().required("Costo de envío es requerida."),
    shippingThreshold: Yup.number()
      .min(0, "Cantidad mínima debe ser mayor a 0")
      .required("Cantidad mínima es requerida."),
    shippingCost: Yup.number()
      .min(0, "Costo de envío debe ser mayor a 0")
      .required("Costo de envío es requerida."),
  });

  // formik declaration
  const formik = useFormik({
    initialValues: {
      ...ecommerceState,
    },
    enableReinitialize: true,
    validationSchema: EcommerceParamsSchema,
    validateOnChange: true,
    onSubmit: async (values, { setErrors, setSubmitting }) => {
      try {
        // edit ecommerce Params
        await dispatch(
          editEcommerceParams(
            sessionToken || "",
            values.supplierBusinessId || "",
            values.sellerName,
            values.bannerImgHref,
            values.categories,
            values.recProds,
            JSON.stringify({
              palette: {
                primary: colors[0],
                secondary: colors[1],
                info: colors[2],
                success: '#54D62C',
                warning: '#FFC107',
                error: '#FF4842'
              },
              shape: {
                borderRadius: typeof (border) === "string" ? parseFloat(border) : border,
                borderRadiusSm: 4,
                borderRadiusMd: 8
              },
              type: 'Helvetica'
            }
            ),
            values.shippingEnabled,
            // values.shippingRuleVerifiedBy,
            values.shippingThreshold,
            values.shippingCost,
            values.searchPlaceholder,
            values.footerMsg,
            values.footerCta,
            values.footerPhone,
            // values.footerIsWa,
            values.footerEmail,
            values.seoDescription,
            values.seoKeywords,
            // defaultSupplierUnitId: string,
            // commerceDisplay: string,
            // accountActive: boolean,
            // currency: string,
          )
        );
        enqueueSnackbar("Datos actualizados correctamente.", {
          variant: "success",
          action: (key) => (
            <IconButton size="small" onClick={() => closeSnackbar(key)}>
              <Icon icon={closeFill} />
            </IconButton>
          ),
        });
        await delay(500);
        // action
        setSubmitting(false);
        onSuccessCallback(true);
        dispatch(getEcommerceInfo(sessionToken || ""));
      } catch (error) {
        console.error(error);
        let errmsg = "Error creando el producto.";
        enqueueSnackbar(errmsg, {
          variant: "error",
          action: (key) => (
            <IconButton size="small" onClick={() => closeSnackbar(key)}>
              <Icon icon={closeFill} />
            </IconButton>
          ),
        });
        setSubmitting(false);
      }
    },
  });

  const {
    values,
    errors,
    touched,
    handleSubmit,
    isSubmitting,
    getFieldProps,
    setFieldValue,
  } = formik;
  const fieldsFull =
    values.footerCta !== '' &&
    values.footerEmail !== '' &&
    values.footerMsg !== '' &&
    values.footerPhone !== '' &&
    values.searchPlaceholder !== '' &&
    values.shippingThreshold !== undefined &&
    values.shippingThreshold >= 0 &&
    values.shippingCost !== undefined &&
    values.shippingCost >= 0 &&
    values.seoDescription !== '' &&
    values.seoKeywords !== '' &&
    values.bannerImgHref !== '' &&
    border >= 0;
  const hasErrors =
    Object.keys(errors).filter((k) => !['website', 'accountNumber'].includes(k))
      .length === 0;

  const setNewCategories = (e: OptionType) => {
    const selectedCategoriesList = values.categories || [];
    const isAlreadySelected = selectedCategoriesList.some(
      (option) => option === e.value
    );
    if (isAlreadySelected) {
      enqueueSnackbar("Esa categoria ya esta seleccionada", { variant: "error" });
      return;
    }
    const newCategories = selectedCategoriesList.filter((v) => v !== e.value) as string[];
    if (newCategories.length === selectedCategoriesList.length) {
      if (newCategories.length >= 4) {
        enqueueSnackbar("No puedes agregar más de 4 categorías", { variant: "error" });
        return;
      }
      setFieldValue("categories", [...newCategories, e.value]);
    }
    else {
      setFieldValue("categories", newCategories);
    }
  }

  const setNewRecProds = (e: OptionType) => {
    const selectedRecProdsList = values.recProds || [];
    const isAlreadySelected = selectedRecProdsList.some(
      (option) => option === e.value
    );
    if (isAlreadySelected) {
      enqueueSnackbar("Ese Producto ya esta seleccionado", { variant: "error" });
      return;
    }
    const newRecProds = selectedRecProdsList.filter((v) => v !== e.value) as string[];
    if (newRecProds.length === selectedRecProdsList.length) {
      if (newRecProds.length >= 4) {
        enqueueSnackbar("No puedes agregar más de 4 productos recomendados", { variant: "error" });
        return;
      }
      setFieldValue("recProds", [...newRecProds, e.label]);
    }
    else {
      setFieldValue("recProds", newRecProds);
    }
  }

  const onRemoveCategory = (e: OptionType) => {
    const newCategories = values.categories?.filter((v) => v !== e.value);
    setFieldValue("categories", newCategories)
  }

  const onRemoveProds = (e: OptionType) => {
    const newRecProds = values.recProds?.filter((v) => v !== e.value);
    setFieldValue("recProds", newRecProds)
  }

  const handleClose = () => {
    setOpenDialog(false);
  }

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        {/* {!hasErrors && fieldsFull && (
          <Alert severity="error">
            {errors.footerCta ||
              errors.footerEmail ||
              errors.footerMsg ||
              errors.footerPhone ||
              errors.searchPlaceholder}
          </Alert> */}
        {/* )} */}
        {getAllInfo && (
          <Grid container spacing={2}>
            {/* General info section */}
            <Grid item xs={12} md={6} sx={{ px: { xs: 0, md: 6 } }}>

              <Stack spacing={2}>
                <Link href={values.ecommerceUrl} target="_blank" rel="noopener noreferrer" sx={{ marginTop: -7 }}>
                  Ir a mi E-commerce
                </Link>
                <Typography
                  variant="h5"
                  sx={{ mt: -3, pb: 1, px: 1 }}
                  color="text.secondary"
                >
                  Configuración de Imágenes
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1.5, px: 1 }}
                >
                  Aquí puedes agregar las imágenes de tu banner de inicio,
                  logo e imagen de producto sin foto
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                  <Typography
                    variant="h6"
                    sx={{ mt: { xs: 1, md: 1 }, px: 1, pb: 1 }}
                    color="text.secondary"
                  >
                    Banner de inicio
                  </Typography>

                  <Tooltip title={
                    <Typography variant="body2"
                      sx={{
                        // backgroundColor: theme.palette.primary.main,
                        // color: theme.palette.primary.contrastText,
                        padding: '8px',
                        borderRadius: '4px',
                      }}>
                      Se recomienda que el banner tenga una medida de 1720 x 420 px o mayor proporcional para una mejor visualización
                    </Typography>
                  }>
                    <IconButton>
                      <InfoIcon color="disabled" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <EcommerceImageSelector supplierBusinessId={values.supplierBusinessId || ""} imageType="banner" />

                <TextField
                  fullWidth
                  label="Link del banner"
                  {...getFieldProps("bannerImgHref")}
                  error={Boolean(
                    touched.bannerImgHref && errors.bannerImgHref
                  )}
                  helperText={
                    touched.bannerImgHref && errors.bannerImgHref
                  }
                />

                <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                  <Typography
                    variant="h6"
                    sx={{ mt: { xs: 1, md: 1 }, px: 1, pb: 1 }}
                    color="text.secondary"
                  >
                    Logo
                  </Typography>

                  <Tooltip title={
                    <Typography variant="body2"
                      sx={{
                        // backgroundColor: theme.palette.primary.main,
                        // color: theme.palette.primary.contrastText,
                        padding: '8px',
                        borderRadius: '4px',
                      }}>
                      Se recomienda que el logo tenga proporcional de 4 a 1 (4 de ancho x 1 alto), mientras mejor sea la resolución, mejor visualización
                    </Typography>
                  }>
                    <IconButton>
                      <InfoIcon color="disabled" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <EcommerceImageSelector supplierBusinessId={values.supplierBusinessId || ""} imageType="logo" />
                <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                  <Typography
                    variant="h6"
                    sx={{ mt: { xs: 1, md: 1 }, px: 1, pb: 1 }}
                    color="text.secondary"
                  >
                    Imagen de Producto sin foto
                  </Typography>
                  <Tooltip title={
                    <Typography variant="body2"
                      sx={{
                        // backgroundColor: theme.palette.primary.main,
                        // color: theme.palette.primary.contrastText,
                        padding: '8px',
                        borderRadius: '4px',
                      }}>
                      Se recomienda que la imagen por defecto cuando no hay imagen de producto tenga proporcional de 1:1 y al menos de 1024 x 1014 px, para mejor visualización
                    </Typography>
                  }>
                    <IconButton>
                      <InfoIcon color="disabled" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <EcommerceImageSelector supplierBusinessId={values.supplierBusinessId || ""} imageType="icon" />

              </Stack>
            </Grid>

            {/* Image, Tax and default price section */}
            <Grid item xs={12} md={6} sx={{ px: { xs: 0, md: 6 } }}>
              <Stack spacing={2}>
                <Typography
                  variant="h5"
                  sx={{ mt: { xs: 0, md: -3 }, pb: 1, px: 1 }}
                  color="text.secondary"
                >
                  Configuración de categorias, envío y SEO
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1.5, px: 1 }}
                >
                  Agrega las descripciones para poder actualizar la información
                  que se muestra en tu portal de compras.
                </Typography>

                <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                  <Typography
                    variant="h6"
                    sx={{ mt: { xs: 1, md: 1 }, pb: 1, px: 1 }}
                    color="text.secondary"
                  >
                    Categorías Favoritas
                  </Typography>

                  <Tooltip
                    title={
                      <Typography variant="body2"
                        sx={{
                          // backgroundColor: theme.palette.primary.main,
                          // color: theme.palette.primary.contrastText,
                          padding: '8px',
                          borderRadius: '4px',
                        }}>
                        Estas categorías son aquellas que estarán desplegadas en tu Página Principal.
                      </Typography>
                    }
                  >
                    <IconButton>
                      <InfoIcon color="disabled" />
                    </IconButton>
                  </Tooltip>
                </Box>

                <SelectedMultiValueInput
                  options={categoriesList.map((v) => ({
                    value: v,
                    label: v,
                  }))}
                  label="Categorias"
                  selectedOptions={values.categories ? values.categories.map((v) => ({ value: v, label: v })) : []}
                  onSelectOption={(option) => {
                    setNewCategories(option);
                  }}
                  onRemove={(option) => {
                    onRemoveCategory(option);
                  }}
                />
                <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                  <Typography
                    variant="h6"
                    sx={{ mt: 1, pb: 1, px: 1 }}
                    color="text.secondary"
                  >
                    Productos Recomendados
                  </Typography>
                  <Tooltip title={
                    <Typography variant="body2"
                      sx={{
                        // backgroundColor: theme.palette.primary.main,
                        // color: theme.palette.primary.contrastText,
                        padding: '8px',
                        borderRadius: '4px',
                      }}>
                      Estos productos serán desplegados dentro de la sección de "Productos Recomendados"
                    </Typography>
                  }>
                    <IconButton>
                      <InfoIcon color="disabled" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <SelectedMultiValueInput
                  options={productList.map((v) => ({
                    value: v.id || "",
                    label: v.productDescription,
                  }))}
                  label="Productos Recomendados"
                  selectedOptions={values.recProds ? values.recProds.map((v) => ({ value: v, label: productDict[v] })) : []}
                  onSelectOption={(option) => {
                    setNewRecProds(option);
                  }}
                  onRemove={(option) => {
                    onRemoveProds(option);
                  }}
                />

                <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                  <Typography
                    variant="h6"
                    sx={{ mt: 1, pb: 1, px: 1 }}
                    color="text.secondary"
                  >
                    Regla de Envios
                  </Typography>

                  <Tooltip title={
                    <Typography variant="body2"
                      sx={{
                        // backgroundColor: theme.palette.primary.main,
                        // color: theme.palette.primary.contrastText,
                        padding: '8px',
                        borderRadius: '4px',
                      }}>
                      Puedes establecer una regla para cobrar envío a pedidos que estén por debajo de cierto monto
                    </Typography>
                  }>
                    <IconButton>
                      <InfoIcon color="disabled" />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* ADD CHECKBOX */}
                <FormControlLabel
                  control={
                    <Checkbox
                      {...getFieldProps("shippingEnabled")}
                      checked={values.shippingEnabled}
                      onChange={(e) => {
                        setFieldValue("shippingEnabled", e.target.checked);
                      }}
                      name="shippingEnabled"
                    />
                  }
                  label="Regla de Envío Activada"
                />
                <Grid container>
                  <Grid item xs={7} md={7} sx={{ pr: theme.spacing(2) }}>
                    <TextField
                      fullWidth
                      label="Min. para No Cobrar Envío"
                      type="number"
                      {...getFieldProps("shippingThreshold")}
                      error={Boolean(touched.shippingThreshold && errors.shippingThreshold)}
                      helperText={touched.shippingThreshold && errors.shippingThreshold}
                      disabled={!values.shippingEnabled}
                      value={formik.values.shippingThreshold} // Ensure value is passed from formik values
                      onChange={(e) => formik.setFieldValue('shippingThreshold', e.target.value)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={5} md={5}>
                    <TextField
                      fullWidth
                      label="Costo de Envío"
                      type="number"
                      {...getFieldProps("shippingCost")}
                      value={formik.values.shippingCost} // Ensure value is passed from formik values
                      onChange={(e) => formik.setFieldValue('shippingCost', e.target.value)}
                      error={Boolean(touched.shippingCost && errors.shippingCost)}
                      helperText={touched.shippingCost && errors.shippingCost}
                      disabled={!values.shippingEnabled}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                  <Typography
                    variant="h6"
                    sx={{ mt: 1, pb: 1, px: 1 }}
                    color="text.secondary"
                  >
                    Estilos de la Tienda
                  </Typography>

                  <Tooltip title={
                    <Typography variant="body2"
                      sx={{
                        // backgroundColor: theme.palette.primary.main,
                        // color: theme.palette.primary.contrastText,
                        padding: '8px',
                        borderRadius: '4px',
                      }}>
                      Da click para ver más información de los estilos de la tienda
                    </Typography>
                  }
                    onClick={() => {
                      setOpenDialog(true);
                    }}
                  >
                    <IconButton>
                      <InfoIcon color="disabled" />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Grid container>
                  <Grid item xs={8} sx={{ pr: theme.spacing(2) }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ mt: -2, pb: 1, px: 1 }}
                      color="text.secondary"
                    >
                      Escoge tu paleta de Colores
                    </Typography>
                    <ColorPickerBlock colors={colors} size={40} setColors={setColors} />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="Borde"
                      type="number"
                      placeholder="Define tu borde (ej. 4)"
                      value={border}
                      error={Boolean(touched.stylesJson && errors.stylesJson)}
                      helperText={touched.stylesJson && errors.stylesJson}
                      inputProps={{
                        type: "number",
                        min: 0, // Optional: Minimum allowed value
                        step: 1, // Optional: Step size for increment/decrement buttons
                      }}
                      onChange={(e) => {
                        setBorder(parseFloat(e.target.value));
                      }}
                    />
                    <Tooltip title={
                      <Typography variant="body2"
                        sx={{
                          // backgroundColor: theme.palette.primary.main,
                          // color: theme.palette.primary.contrastText,
                          padding: '8px',
                          borderRadius: '4px',
                          display: "flex",
                          justifyContent: "flex-start"
                        }}>
                        Este borde aplica en la forma en la que tus productos se muestran en la tienda
                      </Typography>
                    }>
                      <IconButton>
                        <InfoIcon color="disabled" />
                      </IconButton>
                    </Tooltip>
                  </Grid>


                </Grid>

                <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                  <Typography
                    variant="h6"
                    sx={{ mt: 1, pb: 1, px: 1 }}
                    color="text.secondary"
                  >
                    Textos y SEO
                  </Typography>

                  <Tooltip title={
                    <Typography variant="body2"
                      sx={{
                        // backgroundColor: theme.palette.primary.main,
                        // color: theme.palette.primary.contrastText,
                        padding: '8px',
                        borderRadius: '4px',
                      }}>
                      Este título y palabras clave son para que los clientes puedan encontrarte en Google más fácilmente. Elige frases y palabras que creas que van a ser coincidentes con lo que están buscando
                    </Typography>
                  }>
                    <IconButton>
                      <InfoIcon color="disabled" />
                    </IconButton>
                  </Tooltip>
                </Box>

                <TextField
                  fullWidth
                  label="Mensaje de Búsqueda"
                  {...getFieldProps("searchPlaceholder")}
                  error={Boolean(
                    touched.searchPlaceholder && errors.searchPlaceholder
                  )}
                  helperText={
                    touched.searchPlaceholder && errors.searchPlaceholder
                  }
                />

                {/* Input to add product SKU */}
                <Grid container>
                  <Grid item xs={6} sx={{ pr: theme.spacing(2) }}>
                    <TextField
                      fullWidth
                      label="Mensaje de Footer"
                      {...getFieldProps("footerMsg")}
                      error={Boolean(touched.footerMsg && errors.footerMsg)}
                      helperText={touched.footerMsg && errors.footerMsg}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Texto Botón de Footer"
                      {...getFieldProps("footerCta")}
                      error={Boolean(touched.footerCta && errors.footerCta)}
                      helperText={touched.footerCta && errors.footerCta}
                    />
                  </Grid>
                </Grid>

                <Grid container>
                  <Grid item xs={7} sx={{ pr: theme.spacing(2) }}>

                    <TextField
                      fullWidth
                      label="Email del Footer"
                      {...getFieldProps("footerEmail")}
                      error={Boolean(touched.footerEmail && errors.footerEmail)}
                      helperText={touched.footerEmail && errors.footerEmail}
                    />
                    {/* {errors.footerEmail && (
                      <Alert severity="error">{errors.footerEmail}</Alert>
                    )} */}
                  </Grid>
                  <Grid item xs={5}>
                    <TextField
                      fullWidth
                      label="Burbuja de WhatsApp "
                      {...getFieldProps("footerPhone")}
                      error={Boolean(touched.footerPhone && errors.footerPhone)}
                      helperText={touched.footerPhone && errors.footerPhone}
                    />
                  </Grid>
                </Grid>
                <TextField
                  fullWidth
                  label="Descripción del SEO"
                  {...getFieldProps("seoDescription")}
                  error={Boolean(
                    touched.seoDescription && errors.seoDescription
                  )}
                  helperText={
                    touched.seoDescription && errors.seoDescription
                  }
                />
                <TextField
                  fullWidth
                  label="Palabras Clave del SEO"
                  {...getFieldProps("seoKeywords")}
                  error={Boolean(
                    touched.seoKeywords && errors.seoKeywords
                  )}
                  helperText={
                    touched.seoKeywords && errors.seoKeywords
                  }
                />
                {/* add product button */}
                <Box sx={{ pt: 2 }}>
                  <LoadingButton
                    fullWidth
                    disabled={!fieldsFull || !hasErrors}
                    size="large"
                    type="submit"
                    variant="contained"
                    loading={isSubmitting}
                  >
                    {`Actualizar Datos`}
                  </LoadingButton>
                </Box>

              </Stack>
            </Grid>
          </Grid>
        )}
      </Form>
      <Dialog
        open={openDialog}
        onClose={handleClose}
        scroll="paper"
        aria-labelledby="Información de paleta de colores"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">Estilos de la Tienda</DialogTitle>
        <DialogContent dividers>
          <div id="scroll-dialog-description">
            <Typography
              variant="subtitle2"
              sx={{ mt: -2, pb: 1, px: 1 }}
              color="text.secondary"
            >
              Paleta de colores
            </Typography>
            <img src={buildAllImage("alima-marketplace-PROD/supplier/documentation/format_styles_colors_ecommerce_0.png")} alt="format_styles_colors_ecommerce_0.png" style={{ width: '100%', marginBottom: '16px' }} />
            <Typography
              variant="subtitle2"
              sx={{ mt: -2, pb: 1, px: 1 }}
              color="text.secondary"
            >
              Vista principal
            </Typography>
            <img src={buildImageUrl("alima-marketplace-PROD/supplier/documentation/format_styles_colors_ecommerce_1.png", 600)} alt="format_styles_colors_ecommerce_1.png" style={{ width: '100%', marginBottom: '16px' }} />
            <Typography
              variant="subtitle2"
              sx={{ mt: -2, pb: 1, px: 1 }}
              color="text.secondary"
            >
              Vista de productos
            </Typography>
            <img src={buildImageUrl("alima-marketplace-PROD/supplier/documentation/format_styles_colors_ecommerce_2.png", 600)} alt="format_styles_colors_ecommerce_2.png" style={{ width: '100%', marginBottom: '16px' }} />
            <Typography
              variant="subtitle2"
              sx={{ mt: -2, pb: 1, px: 1 }}
              color="text.secondary"
            >
              Vista de footer
            </Typography>
            <img src={buildImageUrl("alima-marketplace-PROD/supplier/documentation/format_styles_colors_ecommerce_3.png", 600)} alt="format_styles_colors_ecommerce_3.png" style={{ width: '100%', marginBottom: '16px' }} />
            <Typography
              variant="subtitle2"
              sx={{ mt: -2, pb: 1, px: 1 }}
              color="text.secondary"
            >
              Vista de configuración
            </Typography>
            <img src={buildImageUrl("alima-marketplace-PROD/supplier/documentation/format_styles_colors_ecommerce_4.png", 600)} alt="format_styles_colors_ecommerce_4.png" style={{ width: '100%', marginBottom: '16px' }} />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>

    </FormikProvider>
  );
};

export default EcommerceParamsForm;
