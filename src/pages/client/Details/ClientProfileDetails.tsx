import {
  Stack,
  Typography,
  Grid,
  Chip,
  Box,
  Button,
  TextField,
  Alert,
} from "@mui/material";
import {
  ClientBranchTag,
  ClientProfileType,
} from "../../../domain/client/Client";
import { LoadingButton } from "@mui/lab";
import { UnitStateType, UnitType } from "../../../domain/account/SUnit";
import { ChangeEvent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import BasicDialog from "../../../components/navigation/BasicDialog";
import { ListUnitOptions } from "../../../layouts/dashboard/UnitSelectPopover";
import {
  upsertAssignedSupplierRestaurant,
  addEcommerceClient,
  editEcommerceClient,
  getClientProfile,
  editTagsClient,
} from "../../../redux/slices/client";
import { enqueueSnackbar } from "notistack";
import useAuth from "../../../hooks/useAuth";
import { setActiveUnitSuccess } from "../../../redux/slices/account";
import {
  KeyValueOption,
  MultiKeyValueInput,
} from "../../../components/MultiKeyValueInput";

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------

type ClientProfileFormProps = {
  clientProfile: ClientProfileType;
  unitProfile: UnitStateType;
};

const ClientProfileDetailsView: React.FC<ClientProfileFormProps> = ({
  clientProfile,
  unitProfile,
}) => {
  const dispatch = useAppDispatch();
  const { sessionToken } = useAuth();
  const { units } = useAppSelector((state) => state.account);
  const { ecommerceTemporalPassword } = useAppSelector((state) => state.client);
  const [isBranchSelected, setBranchSelected] = useState<string | undefined>(
    undefined
  );
  const [nonDeletedUnits, setNonDeletedUnits] = useState<UnitType[]>(
    units.filter((units: UnitType) => !units.deleted)
  );
  const [isPopoverOpen, setPopoverOpen] = useState(false);
  const [isEcommerceUserPopoverOpen, setEcommerceUserPopoverOpen] =
    useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ecommerceEmailStr, setEcommerceEmailStr] = useState<string>(() => {
    // Set myVariable to initialVariable if it exists, otherwise set a default value
    return clientProfile.ecommerceUser?.email || clientProfile.email || "";
  });
  const [ecommerceTemporalPasswordStr, setEcommerceTemporalPasswordStr] =
    useState<string>(() => {
      // Set myVariable to initialVariable if it exists, otherwise set a default value
      return ecommerceTemporalPassword || "";
    });
  const [selectedTags, setSelectedTags] = useState<KeyValueOption[]>(
    (clientProfile.tags || []).map((t) => ({
      key: t.tagKey,
      value: t.tagValue,
    }))
  );

  useEffect(() => {
    // Cleanup function
    setEcommerceTemporalPasswordStr(ecommerceTemporalPassword);
  }, [dispatch, ecommerceTemporalPassword]);

  const handleClick = () =>
    navigator.clipboard.writeText(ecommerceTemporalPassword);

  const handleOpenPopover = () => {
    setBranchSelected(clientProfile.id);
    const nonDeletedUnits = units.filter(
      (units: UnitType) =>
        !units.deleted && units.id !== clientProfile.business?.assignedUnit
    );
    setNonDeletedUnits(nonDeletedUnits);
    setPopoverOpen(true);
  };

  const handleEcommerceUserPopover = () => {
    setEcommerceUserPopoverOpen(true);
  };

  const handleClosePopover = () => {
    setBranchSelected("");
    setPopoverOpen(false);
  };

  const handleCloseEccomerceUserPopover = () => {
    setEcommerceUserPopoverOpen(false);
  };

  const handleConfirm = async () => {
    setIsSubmitted(true);
    if (clientProfile.ecommerceUser?.id) {
      try {
        await dispatch(
          editEcommerceClient(
            clientProfile,
            ecommerceEmailStr,
            sessionToken || ""
          )
        );
        enqueueSnackbar("El cliente de ecommerce ha sido actualizado", {
          variant: "success",
        });
        // dispatch(setActiveUnitSuccess(UnitProfile));
        dispatch(
          getClientProfile(
            unitProfile?.id || "",
            clientProfile.id || "",
            sessionToken || ""
          )
        );
      } catch (error: any) {
        console.error(error);
        if (error.msg === "This email already in use") {
          enqueueSnackbar("Ese correo ya esta en uso", {
            variant: "error",
          });
        } else if (error.msg === "there is no ecommerce") {
          enqueueSnackbar("No tienes ecommerce para crear usuarios", {
            variant: "error",
          });
        } else {
          enqueueSnackbar("Error al crear usuario", {
            variant: "error",
          });
        }
      }
    } else {
      try {
        await dispatch(
          addEcommerceClient(
            clientProfile,
            ecommerceEmailStr,
            sessionToken || ""
          )
        );
        enqueueSnackbar(
          "El cliente de ecommerce ha sido creado correctamente",
          {
            variant: "success",
          }
        );
        dispatch(
          getClientProfile(
            unitProfile?.id || "",
            clientProfile.id || "",
            sessionToken || ""
          )
        );
      } catch (error: any) {
        console.error(error);
        if (error.msg === "This email already in use") {
          enqueueSnackbar("Ese correo ya esta en uso", {
            variant: "error",
          });
        } else if (error.msg === "This restaurant already has a user") {
          enqueueSnackbar("Este restaurant ya tiene usuario", {
            variant: "error",
          });
        } else if (error.msg === "there is no ecommerce") {
          enqueueSnackbar("No tienes ecommerce para crear usuarios", {
            variant: "error",
          });
        } else {
          enqueueSnackbar("Error al crear usuario", {
            variant: "error",
          });
        }
      }
    }
    setIsSubmitted(false);
  };

  function convertToClientBranchTag(
    keyValueOption: KeyValueOption
  ): ClientBranchTag {
    return {
      tagKey: keyValueOption.key,
      tagValue: keyValueOption.value,
    };
  }

  const handleUpdateEtiquetas = async () => {
    setIsSubmitted(true);
    const clientBranchTags: ClientBranchTag[] = selectedTags.map(
      convertToClientBranchTag
    );
    const values: ClientProfileType = {
      ...clientProfile,
      tags: clientBranchTags,
    };
    try {
      await dispatch(
        editTagsClient(
          {
            ...values,
          },
          unitProfile.id || "",
          sessionToken || ""
        )
      );
      enqueueSnackbar("Las etiquetas se han actualizado correctamente", {
        variant: "success",
      });
      // dispatch(setActiveUnitSuccess(UnitProfile));
      dispatch(
        getClientProfile(
          unitProfile?.id || "",
          clientProfile.id || "",
          sessionToken || ""
        )
      );
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar("Error al actualizar etiquetas", {
        variant: "error",
      });
      setIsSubmitted(false);
    }
  };

  const handleAddTag = (option: KeyValueOption) => {
    const _tags = [...selectedTags, option];
    setSelectedTags(_tags);
  };

  // delete tag handler
  const handleDeleteTag = (option: KeyValueOption) => {
    const _tags = [...selectedTags].filter((t) => t.key !== option.key);
    setSelectedTags(_tags);
  };

  // handlers
  const handleSelectUnit = async (unit: UnitType) => {
    if (unit && isBranchSelected !== "") {
      try {
        await dispatch(
          upsertAssignedSupplierRestaurant(
            unit?.id,
            isBranchSelected,
            sessionToken || ""
          )
        );
        enqueueSnackbar("El cliente ha sido assignado correctamente", {
          variant: "success",
        });
        dispatch(setActiveUnitSuccess(unit));
        handleClosePopover();
      } catch (error: any) {
        console.error(error);
        enqueueSnackbar("Error al crear usuario", {
          variant: "error",
        });
      }
    }
  };

  const handleEcommerceEmailStr = (e: ChangeEvent<HTMLInputElement>) => {
    setEcommerceEmailStr(e.target.value);
  };

  return (
    <Grid container spacing={2}>
      {/* General info section */}
      <ClientProfileInfoDetailsView
        clientProfile={clientProfile}
        unitProfile={unitProfile}
      />

      <Grid item xs={12} md={6} sx={{ px: { xs: 0, md: 6 } }}>
        <Stack spacing={2}>
          <Typography
            variant="h6"
            sx={{ mt: { xs: 1, md: -3 }, px: 1, pb: 1 }}
            color="text.secondary"
          >
            UNIDAD ASIGNADA
          </Typography>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Grid container alignItems="flex-start">
              <Grid item xs={6} sx={{ mt: 1, pb: 1, px: 1 }}>
                <Chip label={unitProfile.unitName} variant="outlined" />
              </Grid>
              <Grid item xs={6} container justifyContent="flex-end">
                <LoadingButton
                  disabled={false}
                  size="medium"
                  type="submit"
                  variant="contained"
                  loading={isSubmitted}
                  onClick={handleOpenPopover}
                >
                  {"Reasignar Cedis"}
                </LoadingButton>
              </Grid>
            </Grid>
          </Box>

          <Typography
            variant="h6"
            sx={{ pt: 2, pb: 1, px: 1 }}
            color="text.secondary"
          >
            USUARIO ECOMMERCE
          </Typography>
          {clientProfile?.ecommerceUser?.email ? (
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Grid container alignItems="flex-start">
                <Grid item xs={6} sx={{ mt: 1, pb: 1, px: 1 }}>
                  <Chip
                    label={clientProfile?.ecommerceUser?.email}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6} container justifyContent="flex-end">
                  <LoadingButton
                    disabled={false}
                    size="medium"
                    type="submit"
                    variant="contained"
                    loading={isSubmitted}
                    onClick={handleEcommerceUserPopover}
                  >
                    {"Editar usuario"}
                  </LoadingButton>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Grid container alignItems="flex-start">
                <Grid item xs={6}>
                  <Typography variant="body1" sx={{ pb: 1, px: 1 }}>
                    No hay usuario de Ecommerce
                  </Typography>
                </Grid>
                <Grid item xs={6} container justifyContent="flex-end">
                  <LoadingButton
                    disabled={false}
                    size="medium"
                    type="submit"
                    variant="contained"
                    loading={isSubmitted}
                    onClick={handleEcommerceUserPopover}
                  >
                    {"Crear usuario"}
                  </LoadingButton>
                </Grid>
              </Grid>
            </Box>
          )}
          {ecommerceTemporalPasswordStr && (
            <Grid item>
              <Typography
                variant="subtitle2"
                sx={{ pt: 1.5, pb: 1, px: 1 }}
                color="text.primary"
              >
                Contraseña Temporal: {ecommerceTemporalPassword}
              </Typography>
              <Grid container alignItems="flex-start">
                <Button onClick={handleClick}>Copiar contraseña</Button>
              </Grid>
              <Alert severity="info" sx={{ mt: 2 }}>
                Guarda esta contraseña y guárdala, ya que solamente será
                mostrara de manera temporal
              </Alert>
            </Grid>
          )}

          <Grid>
            <Typography
              variant="h6"
              sx={{ pt: 2, pb: 1, px: 1 }}
              color="text.secondary"
            >
              Etiquetas (Opcional)
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ pb: 1 }}>
              Las etiquetas son palabras clave para identificar tus clientes.
            </Typography>

            <MultiKeyValueInput
              selectedOptions={selectedTags}
              onAdd={handleAddTag}
              onRemove={handleDeleteTag}
            />
          </Grid>
          <Grid item xs={6} md={12} container justifyContent="flex-end">
            <LoadingButton
              disabled={false}
              size="medium"
              type="submit"
              variant="contained"
              loading={isSubmitted}
              onClick={handleUpdateEtiquetas}
            >
              {"Actualizar Etiquetas"}
            </LoadingButton>
          </Grid>
        </Stack>
      </Grid>
      {isPopoverOpen && (
        <BasicDialog
          open={isPopoverOpen}
          onClose={handleClosePopover}
          title="Elije Cedis a Asignar"
          msg="Elije el cedis al cual se asignará el cliente"
          closeMark={true}
        >
          <ListUnitOptions
            unitOptions={nonDeletedUnits}
            onSelect={handleSelectUnit}
          />
          {units.length === 0 && (
            <Box sx={{ textAlign: "center" }}>
              <Button
                color="info"
                onClick={async () => {
                  handleClosePopover();

                  // await delay(500);
                }}
              >
                Regresar
              </Button>
            </Box>
          )}
        </BasicDialog>
      )}

      {isEcommerceUserPopoverOpen && (
        <BasicDialog
          open={isEcommerceUserPopoverOpen}
          onClose={handleCloseEccomerceUserPopover}
          title="Elige Correo del usuario"
          msg="Ingresa el correo del usuario"
          closeMark={true}
          continueAction={{
            active:
              ecommerceEmailStr.length > 0 && ecommerceEmailStr.includes("@"),
            msg: clientProfile.ecommerceUser?.email
              ? "Actualizar Usuario"
              : "Crear Usuario",
            actionFn: () => handleConfirm(),
          }}
        >
          <Box
            sx={{
              mt: 2,
              mx: { md: 3, xs: 2 },
              mb: !(
                ecommerceEmailStr.length > 0 && ecommerceEmailStr.includes("@")
              )
                ? 2
                : 0,
              width: { md: "24vw", xs: "64vw" },
            }}
          >
            <TextField
              fullWidth
              label="Correo"
              value={ecommerceEmailStr}
              onChange={handleEcommerceEmailStr}
            />
          </Box>
        </BasicDialog>
      )}
    </Grid>
  );
};

type ClientProfileDetailsFormProps = {
  clientProfile: ClientProfileType;
  unitProfile: UnitStateType;
};

const ClientProfileInfoDetailsView: React.FC<ClientProfileDetailsFormProps> = ({
  clientProfile,
  unitProfile,
}) => {
  return (
    <Grid item xs={12} md={6} sx={{ px: { xs: 0, md: 6 } }}>
      {clientProfile?.branchName && (
        <Stack spacing={2}>
          <Typography
            variant="h6"
            sx={{ mt: -3, pb: 1, px: 1 }}
            color="text.primary"
          >
            {clientProfile.branchName}
          </Typography>
        </Stack>
      )}
      {clientProfile?.id && (
        <Stack spacing={2}>
          <Typography
            variant="subtitle2"
            sx={{ mt: -1, pb: 1, px: 1 }}
            color="text.primary"
          >
            ID: {clientProfile.id}
          </Typography>
        </Stack>
      )}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} sx={{ px: { xs: 0, md: 0 } }}>
          <Typography
            variant="overline"
            sx={{ mt: -3, pb: 1, px: 1 }}
            color="text.disabled"
          >
            CONTACTO
          </Typography>
          {clientProfile?.displayName && (
            <Typography variant="body1" sx={{ mt: 0, pb: 1, px: 1 }}>
              {clientProfile.displayName}
            </Typography>
          )}
          {clientProfile?.phoneNumber && (
            <Typography variant="body1" sx={{ mt: 0, pb: 1, px: 1 }}>
              Tel: <b>{clientProfile.phoneNumber}</b>
            </Typography>
          )}
          {clientProfile?.email && (
            <Box sx={{ width: "100%" }}>
              <Typography
                variant="body1"
                sx={{
                  mt: 0,
                  pb: 1,
                  px: 1,
                  wordWrap: "break-word",
                  hyphens: "auto",
                }}
              >
                Email: <b>{clientProfile.email}</b>
              </Typography>
            </Box>
          )}
        </Grid>
        <Grid item xs={12} md={6} sx={{ px: { xs: 0, md: 0 } }}>
          <Typography
            variant="overline"
            sx={{ mt: -3, pb: 1, px: 1 }}
            color="text.disabled"
          >
            DIRECCION DE ENTREGA
          </Typography>
          {clientProfile?.fullAddress && (
            <Stack spacing={2}>
              <Typography variant="body1" sx={{ mt: 0, pb: 1, px: 1 }}>
                {clientProfile.fullAddress}
              </Typography>
            </Stack>
          )}
        </Grid>
      </Grid>

      <Typography
        variant="overline"
        sx={{ mt: -3, pb: 1, px: 1 }}
        color="text.disabled"
      >
        INFO FISCAL
      </Typography>

      {clientProfile?.taxName && (
        <Typography variant="body1" sx={{ mt: 0, pb: 1, px: 1 }}>
          {clientProfile.taxName}
        </Typography>
      )}
      {clientProfile?.taxId && (
        <Typography variant="subtitle2" sx={{ mt: 0, pb: 1, px: 1 }}>
          RFC: {clientProfile.taxId}
        </Typography>
      )}

      {clientProfile?.taxAddress && (
        <Typography variant="body1" sx={{ mt: 0, pb: 1, px: 1 }}>
          {clientProfile.taxAddress}, CP. {clientProfile.taxZipCode}
        </Typography>
      )}
      {!clientProfile?.taxZipCode &&
        !clientProfile?.taxAddress &&
        !clientProfile?.taxId &&
        !clientProfile?.taxName && (
          <Typography variant="subtitle2" sx={{ mt: 0, pb: 1, px: 1 }}>
            {"No hay información fiscal"}
          </Typography>
        )}
      {clientProfile?.invoicePaymentMethod && (
        <Typography variant="subtitle2" sx={{ mt: 0, pb: 1, px: 1 }}>
          Tipo de facturación: {clientProfile.invoicePaymentMethod}
        </Typography>
      )}
      {!clientProfile?.invoicePaymentMethod &&
        unitProfile?.invoicePaymentMethod && (
          <Typography variant="subtitle2" sx={{ mt: 0, pb: 1, px: 1 }}>
            Tipo de facturación: {unitProfile.invoicePaymentMethod}
          </Typography>
        )}
    </Grid>
  );
};

export default ClientProfileDetailsView;
