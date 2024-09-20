import * as Yup from "yup";
import { useEffect, useRef, useState } from "react";
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
  MenuItem,
  Box,
  Autocomplete,
  Button,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
// redux
import {
  addSupplierProduct,
  editSupplierProduct,
  getProductCategories,
  searchEditProductSATCodes,
  searchProductSATCodes,
} from "../../redux/slices/supplier";
// hooks
import { useAppDispatch, useAppSelector } from "../../redux/store";
import useAuth from "../../hooks/useAuth";
// utils
import { delay } from "../../utils/helpers";
import {
  BuyUOMMap,
  IntegerUOMTypes,
  MxSatProductCodeType,
  SupplierProductType,
  UOMType,
  UOMTypes,
} from "../../domain/supplier/SupplierProduct";
import SearchInput from "../SearchInput";
import {
  GroupHeader,
  GroupItems,
} from "../../styles/forms/AutoCompleteHeaderItems";
import LoadingProgress from "../LoadingProgress";
import { KeyValueOption, MultiKeyValueInput } from "../MultiKeyValueInput";
import { MultiValueInput } from "../MultiValueInput";
import { ProductImageSelector } from "./images/ProductImageSelector";
import MarkdownEditor from "../MarkdownEditor";
import BasicDialog from "../navigation/BasicDialog";

// ----------------------------------------------------------------------

const UOMOptions = Object.entries(UOMTypes).map(([key, value]) => ({
  label: value,
  value: key,
}));

// ----------------------------------------------------------------------

type SupplierProductFormProps = {
  onSuccessCallback: (flag: boolean) => void;
  supProductState?: SupplierProductType;
  editMode?: boolean;
};

const SupplierProductForm: React.FC<SupplierProductFormProps> = ({
  onSuccessCallback,
  supProductState = {
    id: "",
    productUuid: "",
    sku: "",
    upc: "",
    productCategory: "",
    productDescription: "",
    sellUnit: "",
    buyUnit: "",
    conversionFactor: undefined,
    minimumQuantity: undefined,
    unitMultiple: undefined,
    estimatedWeight: undefined,
    price: undefined,
    taxAmount: undefined,
    iepsAmount: undefined,
    taxId: "",
    tags: [],
    longDescription: "",
  },
  editMode = false,
}) => {
  // vars
  const categFetched = useRef(false);
  const satCodeFetch = useRef(false);
  const searchFetch = useRef(supProductState.taxId?.slice(0, 5));
  const initialSatCode = useRef(false);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const theme = useTheme();
  const { sessionToken } = useAuth();
  const dispatch = useAppDispatch();
  const { productCategories, satCodes: globalSAT, supplierUnitDefaultPricesLists } = useAppSelector(
    (state) => state.supplier
  );
  const { business } = useAppSelector((state) => state.account);
  const [sCodeSearch, setSCodeSearch] = useState(
    supProductState.taxId?.slice(0, 5)
  );
  const [satCodes, setSatCodes] = useState<MxSatProductCodeType[]>([]);
  const [selectedTags, setSelectedTags] = useState<KeyValueOption[]>(
    (supProductState.tags || [])
      .filter((t) => t.tagKey !== "category")
      .map((t) => ({
        key: t.tagKey,
        value: t.tagValue,
      }))
  );
  const [selectedCategory, setSelectedCategory] = useState<KeyValueOption[]>(
    (supProductState.tags || [])
      .filter((t) => t.tagKey === "category")
      .map((t) => ({
        key: t.tagKey,
        value: t.tagValue,
      }))
  );
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // hook - fetch sat codes
  useEffect(() => {
    if (globalSAT.length === 0) return;
    const _satOpts = globalSAT.map((s: any) => ({
      satCode: s.satCode,
      satCodeFamily: s.satCodeFamily,
      satDescription: s.satDescription,
    }));
    setSatCodes(_satOpts);
    // for first fetch find sat code from options
    if (!initialSatCode.current && editMode) {
      const _satCode = _satOpts.find(
        (s: any) => s.satCode === supProductState.taxId
      );
      if (!_satCode) return;
      setFieldValue("taxId", _satCode.satCode);
      setFieldValue("taxCode", _satCode);
      initialSatCode.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalSAT]);

  // hoook - fetch sunit categories
  useEffect(() => {
    if (productCategories.length === 0 && !categFetched.current) {
      dispatch(getProductCategories());
      categFetched.current = true;
    }
    if (globalSAT.length === 0 && !satCodeFetch.current) {
      dispatch(searchProductSATCodes(sCodeSearch));
      satCodeFetch.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // hook - search sat codes
  useEffect(() => {
    if (searchFetch.current === sCodeSearch) return;
    // [TODO] fix this later, it should work even in editMode
    if (editMode) {
      dispatch(searchEditProductSATCodes(sCodeSearch));
    }
    else {
      dispatch(searchProductSATCodes(sCodeSearch));
    }
    searchFetch.current = sCodeSearch || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, sCodeSearch]);

  // sellUnit handler
  const handleSellUnit = (option: { label: string; value: string }) => {
    // update formik values
    setFieldValue("sellUnit", option.value);
  };

  const renderBuyUOMOptions = (sellUnit: string) => {
    if (sellUnit === "") return [];
    const _opts = Object.entries(BuyUOMMap[sellUnit as UOMType]).map(
      ([key, value]) => ({
        label: UOMTypes[value],
        value: value,
      })
    );
    return _opts;
  };

  // buyUnit handler
  const handleBuyUnit = (option: { label: string; value: string }) => {
    // update formik values
    setFieldValue("buyUnit", option.value);
  };

  // add tag handler
  const handleAddTag = (option: KeyValueOption) => {
    const isOptionInList = selectedTags.some(
      (item) => item.key === option.key && item.value === option.value
    );
    const catKeyList = [
      "Category",
      "category",
      "categoria",
      "Categoria",
      "Categoría",
      "categoría",
      "CATEGORIA",
      "CATEGORÍA",
      "CATEGORY",
    ];
    if (catKeyList.includes(option.key)) {
      enqueueSnackbar(`Error: No se puede ingresar un tag con esa Etiqueta`, {
        variant: "error",
        autoHideDuration: 4000,
      });
    } else {
      if (isOptionInList) {
        enqueueSnackbar(`Error: Este producto ya tiene ese tag.`, {
          variant: "error",
          autoHideDuration: 4000,
        });
      } else {
        const _selectedTags = [...selectedTags, option];
        const _tags = [...selectedCategory, option, ...selectedTags];
        setSelectedTags(_selectedTags);
        setFieldValue(
          "tags",
          _tags.map((t) => ({ tagKey: t.key, tagValue: t.value }))
        );
      }
    }
  };

  // add tag handler
  const handleAddTagCategory = (option: KeyValueOption) => {
    const foundItem = selectedCategory.find(
      (item) => item.value === option.value
    );

    if (foundItem) {
      enqueueSnackbar(`Error: Este producto ya esta en esa categoria.`, {
        variant: "error",
        autoHideDuration: 4000,
      });
    } else {
      const _tagsCategory = [...selectedCategory, option];
      const _tags = [...selectedTags, option, ...selectedCategory];
      setSelectedCategory(_tagsCategory);
      setFieldValue(
        "tags",
        _tags.map((t) => ({ tagKey: t.key, tagValue: t.value }))
      );
    }
  };

  // delete tag handler
  const handleDeleteTag = (option: KeyValueOption) => {
    const _tags = [...selectedTags].filter((t) => t.key !== option.key);
    setSelectedTags(_tags);
    setFieldValue(
      "tags",
      _tags.map((t) => ({ tagKey: t.key, tagValue: t.value }))
    );
  };

  // delete tag handler
  const handleDeleteCategory = (option: KeyValueOption) => {
    const _filterCategory = [...selectedCategory].filter(
      (t) => !(t.value === option.value)
    );
    setSelectedCategory(_filterCategory);
    const _tags = [..._filterCategory, ...selectedTags];
    setFieldValue(
      "tags",
      _tags.map((t) => ({ tagKey: t.key, tagValue: t.value }))
    );
  };

  // yup schema based on supProductState
  const SupplierProductSchema = Yup.object().shape({
    id: Yup.string(),
    productUuid: Yup.string(),
    sku: Yup.string()
      .min(1, "Mínimo 1 caracteres")
      .required("SKU es requerido"),
    // upc: Yup.string()
    //   .min(12, "UPCs válidos tienen entre 12 y 13 caracteres")
    //   .max(13, "UPCs válidos tienen entre 12 y 13 caracteres"),
    productDescription: Yup.string()
      .min(2, "Mínimo 2 caracteres")
      .required("Descripción del producto es requerida."),
    longDescription: Yup.string().min(2, "Mínimo 2 caracteres"),
    sellUnit: Yup.string()
      .oneOf(Object.keys(UOMTypes))
      .required("Unidad de Venta es requerida."),
    buyUnit: Yup.string()
      .oneOf(Object.keys(UOMTypes))
      .required("Unidad de Compra es requerida."),
    conversionFactor: Yup.number()
      .min(0, "Factor de conversión debe ser mayor a 0")
      .required("Factor de conversión es requerido."),
    minimumQuantity: Yup.number()
      .min(0, "Cantidad mínima debe ser mayor a 0")
      .required("Cantidad mínima es requerida."),
    unitMultiple: Yup.number()
      .min(0, "Múltiplo de unidad debe ser mayor a 0")
      .required("Múltiplo de unidad es requerido."),
    estimatedWeight: Yup.number().min(0, "Peso estimado debe ser mayor a 0"),
    price: Yup.mixed(),
    defaultPrice: Yup.number(),
    taxAmount: Yup.number()
      .min(0, "Impuesto debe ser mayor a 0%")
      .max(100, "Impuesto debe ser menor a 100%"),
    taxCode: Yup.mixed(),
    taxId: Yup.string().required("Código de producto (SAT) es requerido."),
    tags: Yup.array(Yup.mixed()),
  });

  // formik declaration
  const formik = useFormik({
    initialValues: {
      ...supProductState,
      taxAmount:
        supProductState.taxAmount !== undefined
          ? supProductState.taxAmount * 100
          : undefined,
      iepsAmount:
        (supProductState.iepsAmount === null || supProductState.iepsAmount === undefined || supProductState.iepsAmount === 0)
          ? undefined
          : supProductState.iepsAmount * 100,
      upc: supProductState.upc || undefined,
      estimatedWeight: supProductState.estimatedWeight || undefined,
      productUuid: supProductState.productUuid || undefined,
      // remap taxId to taxCode
      taxCode: {
        satCode: supProductState.taxId,
        satCodeFamily: "",
        satDescription: "",
      },
      // remap price to defaultPrice
      defaultPrice: supProductState.price?.amount || undefined,
      price: supProductState.price
        ? {
          ...supProductState.price,
        }
        : undefined,
    },
    validationSchema: SupplierProductSchema,
    validateOnChange: true,
    onSubmit: async (values, { setErrors, setSubmitting }) => {
      try {
        if (!editMode) {
          // Add product
          await dispatch(
            addSupplierProduct(
              business?.id || "",
              sessionToken || "",
              values.productDescription,
              values.buyUnit || "kg",
              values.conversionFactor || 1,
              values.minimumQuantity || 1,
              values.sellUnit,
              values.sku,
              values.taxAmount || 0,
              values.taxId || "00000000",
              values.unitMultiple || 1,
              undefined,
              values.defaultPrice,
              values.estimatedWeight,
              undefined,
              values.tags,
              values.longDescription || "",
              values.iepsAmount || undefined
            )
          );
          enqueueSnackbar("Producto creado correctamente.", {
            variant: "success",
            action: (key) => (
              <IconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </IconButton>
            ),
          });
        } else {
          // edit product
          await dispatch(
            editSupplierProduct(
              values?.id || "",
              sessionToken || "",
              values.productDescription,
              values.buyUnit || "kg",
              values.conversionFactor || 1,
              values.minimumQuantity || 1,
              values.sellUnit,
              values.sku,
              values.taxAmount || 0,
              values.taxId || "00000000",
              values.unitMultiple || 1,
              undefined,
              values.defaultPrice,
              values.estimatedWeight,
              values.upc,
              values.tags,
              values.longDescription || "",
              values.iepsAmount || undefined
            )
          );
          enqueueSnackbar("Producto actualizado correctamente.", {
            variant: "success",
            action: (key) => (
              <IconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </IconButton>
            ),
          });
        }
        await delay(500);
        // action
        setSubmitting(false);
        onSuccessCallback(true);
      } catch (error) {
        console.error(error);
        let errmsg = ""; // Declare the variable errmsg
        if ((error as Error).message === "Error: Product already exists") {
          errmsg = "Ya existe un producto con ese SKU."; // Assign value to errmsg
        }
        else {
          errmsg = "Error creando el producto."; // Assign value to errmsg
        }
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
  const isFull = values.sku !== "";
  // const areErrors = Object.keys(errors).length === 0;

  // loading state
  if (productCategories.length === 0) {
    return <LoadingProgress sx={{ mt: 2 }} />;
  }

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>

        <Grid container spacing={2}>
          <BasicDialog
            open={confirmModalOpen}
            onClose={() => setConfirmModalOpen(false)}
            closeMark={false}
            title={"Listas de precios por default del producto"}
            backAction={{
              active: true,
              msg: "Cerrar",
              actionFn: () => {
                setConfirmModalOpen(false);
              },
            }}
          >
            <div>
              {supplierUnitDefaultPricesLists.map((item: string, index: number) => (
                <div key={index} style={{ marginBottom: "10px" }}>
                  {item}
                </div>
              ))}
            </div>
          </BasicDialog>
          {/* General info section */}
          <Grid item xs={12} md={6} sx={{ px: { xs: 0, md: 6 } }}>
            <Stack spacing={2}>
              <Typography
                variant="h6"
                sx={{ mt: -3, pb: 1, px: 1 }}
                color="text.secondary"
              >
                Información de Venta
              </Typography>

              <TextField
                fullWidth
                label="Nombre del Producto"
                {...getFieldProps("productDescription")}
                error={Boolean(
                  touched.productDescription && errors.productDescription
                )}
                helperText={
                  touched.productDescription && errors.productDescription
                }
              />

              {/* Input to add product SKU */}
              <Grid container>
                <Grid item xs={6} sx={{ pr: theme.spacing(2) }}>
                  <TextField
                    fullWidth
                    label="SKU"
                    {...getFieldProps("sku")}
                    error={Boolean(touched.sku && errors.sku)}
                    helperText={touched.sku && errors.sku}
                  />
                </Grid>

                <Grid item xs={6}>
                  <SearchInput
                    fullWidth
                    label="U. de Venta"
                    options={UOMOptions}
                    onSelectOption={handleSellUnit}
                    defaultValue={
                      editMode
                        ? UOMOptions.find(
                          (b: any) => b.value === supProductState.sellUnit
                        ) || undefined
                        : undefined
                    }
                    displayLabelFn={(
                      option: { label: string; value: string } | string
                    ) => (typeof option === "string" ? option : option.label)}
                    fieldProps={{
                      error: Boolean(touched.sellUnit && errors.sellUnit),
                      helperText: touched.sellUnit && errors.sellUnit,
                    }}
                    searchOnLabel
                    initialSize={10}
                  />
                </Grid>
              </Grid>

              <Grid container>
                <Grid item xs={7} sx={{ pr: theme.spacing(2) }}>
                  <TextField
                    fullWidth
                    label="Mín. Cantidad"
                    {...getFieldProps("minimumQuantity")}
                    error={Boolean(
                      touched.minimumQuantity && errors.minimumQuantity
                    )}
                    helperText={
                      touched.minimumQuantity && errors.minimumQuantity
                    }
                    InputProps={{
                      endAdornment: (
                        <Typography
                          color={"text.secondary"}
                          sx={{ fontWeight: theme.typography.fontWeightBold }}
                        >
                          &nbsp;
                          {getFieldProps("sellUnit").value
                            ? UOMTypes[
                            getFieldProps("sellUnit").value as UOMType
                            ]
                            : ""}
                        </Typography>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    fullWidth
                    select
                    label="Incrementos"
                    {...getFieldProps("unitMultiple")}
                    error={Boolean(touched.unitMultiple && errors.unitMultiple)}
                    helperText={touched.unitMultiple && errors.unitMultiple}
                    SelectProps={{
                      native: false,
                    }}
                  >
                    {IntegerUOMTypes.includes(getFieldProps("sellUnit").value)
                      ? Array.from({ length: 50 }, (_, i) => i + 1).map(
                        (num) => (
                          <MenuItem key={num} value={num}>
                            {num}
                          </MenuItem>
                        )
                      )
                      : [
                        10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0.5, 0.25, 0.1, 0.05,
                        0.01, 0.001,
                      ].map((num) => (
                        <MenuItem key={num} value={num}>
                          {num}
                        </MenuItem>
                      ))}
                  </TextField>
                </Grid>
              </Grid>

              <MarkdownEditor
                label="Descripción (Opcional)"
                placeholder={
                  "Escribe la descripción detallada de tu producto..."
                }
                simple
                value={getFieldProps("longDescription").value || ""}
                onChange={(data: any) => {
                  setFieldValue("longDescription", data);
                }}
                error={Boolean(
                  touched.longDescription && errors.longDescription
                )}
                helperText={touched.longDescription && errors.longDescription}
              />

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1.5, px: 1 }}
              >
                El <b>factor de conversión</b> es un número que se utiliza para
                convertir una unidad de venta a compra. Por ejemplo, si un
                paquete contiene 6 piezas, el factor de conversión sería 6.
                {/* , ya que se necesitan 6 piezas para formar un paquete. */}
              </Typography>

              <Grid container>
                <Grid item xs={6} sx={{ pr: 2 }}>
                  <TextField
                    fullWidth
                    label="Factor de Conversión"
                    {...getFieldProps("conversionFactor")}
                    error={Boolean(
                      touched.conversionFactor && errors.conversionFactor
                    )}
                    helperText={
                      touched.conversionFactor && errors.conversionFactor
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <SearchInput
                    fullWidth
                    label="U. de Compra"
                    options={renderBuyUOMOptions(
                      getFieldProps("sellUnit").value
                    )}
                    onSelectOption={handleBuyUnit}
                    defaultValue={
                      editMode
                        ? UOMOptions.find(
                          (b: any) => b.value === supProductState.buyUnit
                        ) || undefined
                        : undefined
                    }
                    displayLabelFn={(
                      option: { label: string; value: string } | string
                    ) => (typeof option === "string" ? option : option.label)}
                    fieldProps={{
                      error: Boolean(touched.buyUnit && errors.buyUnit),
                      helperText: touched.buyUnit && errors.buyUnit,
                    }}
                    searchOnLabel
                    initialSize={10}
                    noOptionsText={
                      getFieldProps("sellUnit").value
                        ? "No hay resultados"
                        : "Selecciona la U. de Venta primero"
                    }
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                label="Peso Estimado (opcional)"
                {...getFieldProps("estimatedWeight")}
                error={Boolean(
                  touched.estimatedWeight && errors.estimatedWeight
                )}
                helperText={touched.estimatedWeight && errors.estimatedWeight}
                InputProps={{
                  endAdornment: (
                    <Typography
                      color={"text.secondary"}
                      sx={{
                        fontWeight: theme.typography.fontWeightRegular,
                      }}
                    >
                      Kg
                    </Typography>
                  ),
                }}
              />

              {/* <TextField
                fullWidth
                label="UPC (opcional)"
                {...getFieldProps("upc")}
                error={Boolean(touched.upc && errors.upc)}
                helperText={touched.upc && errors.upc}
              /> */}
              <Box>
                <Typography
                  variant="h6"
                  sx={{ pt: 2, pb: 1, px: 1 }}
                  color="text.secondary"
                >
                  Categorias (Opcional)
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ pb: 1 }}
                >
                  En esta sección puedes añadir tus productos a las categorias
                </Typography>

                <MultiValueInput
                  selectedOptions={selectedCategory}
                  onAdd={handleAddTagCategory}
                  onRemove={handleDeleteCategory}
                  valueKey="category"
                />
              </Box>

              <Box>
                <Typography
                  variant="h6"
                  sx={{ pt: 2, pb: 1, px: 1 }}
                  color="text.secondary"
                >
                  Etiquetas (Opcional)
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ pb: 1 }}
                >
                  Las etiquetas son palabras clave para identificar tus
                  productos.
                </Typography>

                <MultiKeyValueInput
                  selectedOptions={selectedTags}
                  onAdd={handleAddTag}
                  onRemove={handleDeleteTag}
                />
              </Box>
            </Stack>
          </Grid>

          {/* Image, Tax and default price section */}
          <Grid item xs={12} md={6} sx={{ px: { xs: 0, md: 6 } }}>
            <Stack spacing={2}>
              {/* Show Images only in edit mode */}
              {editMode ? (
                <Typography
                  variant="h6"
                  sx={{ mt: { xs: 1, md: -3 }, px: 1, pb: 1 }}
                  color="text.secondary"
                >
                  Imágenes
                </Typography>
              ) : null}
              {editMode ? (
                <ProductImageSelector productId={supProductState.id} />
              ) : null}

              <Typography
                variant="h6"
                sx={{ mt: { xs: 1, md: -3 }, px: 1, pb: 1 }}
                color="text.secondary"
              >
                Facturación
              </Typography>

              <Autocomplete
                fullWidth
                id="grouped-sat-codes-select"
                options={satCodes}
                groupBy={(option) => option?.satCodeFamily}
                getOptionLabel={(option) => {
                  return option?.satCode
                    ? `${option?.satCode} - ${option.satDescription}`
                    : "";
                }}
                value={getFieldProps("taxCode").value || undefined}
                isOptionEqualToValue={(option, value) => {
                  return option?.satCode === value?.satCode;
                }}
                sx={{ mb: 1 }}
                renderInput={(params) => (
                  <TextField {...params} label="Código de Producto (SAT)" />
                )}
                renderGroup={(params) => (
                  <li key={params.key}>
                    <GroupHeader>{params.group}</GroupHeader>
                    <GroupItems>{params.children}</GroupItems>
                  </li>
                )}
                noOptionsText={
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    sx={{
                      mt: 1,
                      fontWeight: theme.typography.fontWeightRegular,
                    }}
                    align="center"
                  >
                    No hay códigos del SAT.
                  </Typography>
                }
                onChange={(
                  event: React.SyntheticEvent,
                  value: MxSatProductCodeType | null
                ) => {
                  if (value) {
                    setFieldValue("taxId", value.satCode);
                    setFieldValue("taxCode", value);
                  } else {
                    setFieldValue("taxCode", undefined);
                    setFieldValue("taxId", "");
                  }
                }}
                onInputChange={(e, value) => {
                  const _scode = value?.split(" - ")[0] || "";
                  if (editMode && _scode === supProductState.taxId) return;
                  // console.log(satCodes);
                  const _satOpts = satCodes.map(
                    (_s: any) => `${_s.satCode} - ${_s.satDescription}`
                  );
                  if (!_satOpts.includes(value)) {
                    setSCodeSearch(value);
                  }
                }}
              />

              <TextField
                fullWidth
                label="I.V.A."
                {...getFieldProps("taxAmount")}
                error={Boolean(touched.taxAmount && errors.taxAmount)}
                helperText={touched.taxAmount && errors.taxAmount}
                InputProps={{
                  endAdornment: (
                    <Typography
                      color={"text.secondary"}
                      sx={{
                        fontWeight: theme.typography.fontWeightRegular,
                      }}
                    >
                      %
                    </Typography>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="I.E.P.S."
                {...getFieldProps("iepsAmount") || undefined}
                error={Boolean(touched.iepsAmount && errors.iepsAmount)}
                helperText={touched.iepsAmount && errors.iepsAmount}
                InputProps={{
                  endAdornment:
                    <Typography
                      color={"text.secondary"}
                      sx={{
                        fontWeight: theme.typography.fontWeightRegular,
                      }}
                    >
                      %
                    </Typography>
                  ,
                }}
              />

              <Typography
                variant="h6"
                sx={{ pt: 2, pb: 1, px: 1 }}
                color="text.secondary"
              >
                Precio por defecto
              </Typography>

              <Grid container>
                <Grid item xs={editMode ? 7 : 12} sx={{ pr: 2 }}>
                  <TextField
                    fullWidth
                    type="currency"
                    label="Precio (MXN)"
                    {...getFieldProps("defaultPrice")}
                    error={Boolean(touched.defaultPrice && errors.defaultPrice)}
                    helperText={touched.defaultPrice && errors.defaultPrice}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">$</InputAdornment>
                      ),
                      placeholder: "0.00 (Por defecto)",
                    }}
                  />
                </Grid>
                {editMode ? (
                  <Grid item xs={5}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="info"
                      disabled={supplierUnitDefaultPricesLists.length === 0}
                      sx={{ mt: 1 }}
                      onClick={() => {
                        setConfirmModalOpen(true);
                      }}
                    >
                      Ver en listas de precios
                    </Button>
                  </Grid>
                ) : null}
              </Grid>

              {/* add product button */}
              <Box sx={{ pt: 2 }}>
                <LoadingButton
                  fullWidth
                  disabled={!isFull}
                  size="large"
                  type="submit"
                  variant="contained"
                  loading={isSubmitting}
                >
                  {editMode ? `Editar Producto` : `Crear Producto`}
                </LoadingButton>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Form>
    </FormikProvider>
  );
};

export default SupplierProductForm;
