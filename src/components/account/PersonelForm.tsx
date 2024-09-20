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
  Alert,
  Grid,
  useTheme,
  Typography,
  Box,
  Divider,
  Button,
  Checkbox,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
// redux
import { addNewTeamMember, updateTeamMember } from "../../redux/slices/account";
// hooks
import useIsMountedRef from "../../hooks/useIsMountedRef";
import { useAppDispatch, useAppSelector } from "../../redux/store";
// components
import AssignUnitModal, { numPermissions } from "./AssignUnitModal";
import PersonelItem from "./PersonelItem";
// domain
import {
  UnitPermissionsType,
  UserInfoType,
  UserPermissionType,
} from "../../domain/account/User";
import useAuth from "../../hooks/useAuth";

//

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

type PersonelFormProps = {
  onSuccessCallback: (() => void) | ((flag: boolean) => void);
  userState?: UserPermissionType & UserInfoType & { admin: boolean };
  editMode?: boolean;
};

const PersonelForm: React.FC<PersonelFormProps> = ({
  onSuccessCallback,
  userState = {
    user: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
    },
    role: "",
    department: "",
    admin: false,
    units: [],
  },
  editMode = false,
}) => {
  const isMountedRef = useIsMountedRef();
  const { sessionToken } = useAuth();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { teammateDetails, units, business } = useAppSelector(
    (state) => state.account
  );
  const [unitPerms, setUnitPerms] = useState(userState.units);
  const [openAssignUnit, setOpenAssignUnit] = useState(false);
  const [editAssignUnit, setEditAssignUnit] = useState<
    UnitPermissionsType | undefined
  >(undefined);

  // hook - update units when redux teammateDetails
  useEffect(() => {
    setUnitPerms(userState.units);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teammateDetails]);

  const PersonelSchema = Yup.object().shape({
    user: Yup.object().shape({
      firstName: Yup.string()
        .min(2, "¡Nombre demasiado corto!")
        .max(50, "¡Nombre demasiado largo!")
        .required("Nombre es requerido."),
      lastName: Yup.string()
        .min(2, "Apellido(s) demasiado corto!")
        .max(50, "¡Apellido(s) demasiado largo!")
        .required("Apellido(s) es requerido."),
      email: Yup.string()
        .email("Correo electrónico inválido")
        .required("Correo electrónico es requerido."),
      phoneNumber: Yup.string()
        .length(10, "¡Teléfono debe de ser a 10 dígitos")
        .matches(/\d*/)
        .required("Teléfono es requerido."),
    }),
    role: Yup.string()
      .max(255, "¡Puesto es demasiado larga, Máx. 255 caractéres!")
      .required("Puesto es requerido."),
    department: Yup.string()
      .max(255, "Área es demasiado largo, Máx. 255 caractéres!")
      .required("Área es requerido."),
    admin: Yup.boolean(),
  });

  const formik = useFormik({
    initialValues: userState,
    validationSchema: PersonelSchema,
    onSubmit: async (values, { setErrors, setSubmitting }) => {
      try {
        // warning for admin without units
        if (values.admin && unitPerms.length === 0) {
          enqueueSnackbar(
            "No se puede guardar un usuario administrador sin CEDIS asignadas.",
            {
              variant: "warning",
            }
          );
          return;
        }
        // add admin permissions
        const tmpUnitPerms = unitPerms.map((bp) => {
          return {
            ...bp,
            permissions: bp.permissions.concat([
              {
                key: "usersadmin-all",
                value: values.admin,
              },
            ]),
          };
        });
        // redux
        if (editMode) {
          await dispatch(
            updateTeamMember(
              {
                ...values,
                units: tmpUnitPerms,
              },
              business.id,
              sessionToken || ""
            )
          );
        } else {
          await dispatch(
            addNewTeamMember(
              {
                ...values,
                units: tmpUnitPerms,
              },
              business.id,
              sessionToken || ""
            )
          );
        }
        // action
        if (isMountedRef.current) {
          setSubmitting(false);
        }
        // callback - check if invoice info is valid. If so Callback is false.
        onSuccessCallback(true);
      } catch (error: any) {
        console.error(error);
        enqueueSnackbar(
          `Error ${
            editMode ? "actualizando" : "agregando"
          } a tu Personal. Por favor intenta de nuevo.`,
          {
            variant: "error",
            action: (key) => (
              <IconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </IconButton>
            ),
          }
        );
        if (isMountedRef.current) {
          // setErrors({ user: error } as FormikErrors<any>);
          setSubmitting(false);
        }
        if (!editMode) {
          onSuccessCallback(false);
        }
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
    // setFieldValue
  } = formik;

  const empty =
    values.user?.email === "" &&
    values.user?.firstName === "" &&
    values.user?.lastName === "" &&
    values.user?.phoneNumber === "" &&
    values.role === "" &&
    values.department === "" &&
    unitPerms.length === 0;

  const areErrors = Object.keys(errors).length > 0;

  // handler - assign unit
  const handleNewUnit = (action: "save" | "update" | "back", data?: any) => {
    if (action === "back") {
      setOpenAssignUnit(false);
    } else {
      // update and save
      const exists = unitPerms.find((bp) => bp.unit.id === data.unit.id) as
        | UnitPermissionsType
        | undefined;
      if (data && !exists) {
        // save new unit
        setUnitPerms([...unitPerms, data]);
      } else if (exists && action === "save") {
        // show error
        enqueueSnackbar("Ya existe un CEDIS asignada a éste usuario.", {
          variant: "warning",
        });
      } else if (exists && action === "update") {
        // update unit
        const _unitPerms = unitPerms.map((bp) => {
          if (bp.unit.id === data.unit.id) {
            return data;
          }
          return bp;
        });
        setUnitPerms(_unitPerms);
      }
      setOpenAssignUnit(false);
    }
  };

  // handler - open to edit assigned unit
  const handleOpenAssignUnit = (unit: UnitPermissionsType) => {
    setEditAssignUnit(unit);
    setOpenAssignUnit(true);
  };

  // handler - delete assigned unit
  const handleDeleteUnit = (unit: UnitPermissionsType) => {
    const _unitPerms = unitPerms.filter((bp) => bp.unit.id !== unit.unit.id);
    setUnitPerms(_unitPerms);
  };

  return (
    <>
      {/* assign new unit */}
      {!editAssignUnit && (
        <AssignUnitModal
          openModal={openAssignUnit}
          onCloseModal={() => setOpenAssignUnit(false)}
          onSuccess={handleNewUnit}
        />
      )}
      {/* edit assigned unit */}
      {editAssignUnit && (
        <AssignUnitModal
          openModal={openAssignUnit}
          onCloseModal={() => setOpenAssignUnit(false)}
          onSuccess={handleNewUnit}
          editMode
          unitPermissionState={editAssignUnit}
        />
      )}
      <FormikProvider value={formik}>
        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {areErrors && !empty && (
              <Alert severity="error">
                {errors.user?.email ||
                  errors.user?.firstName ||
                  errors.user?.lastName ||
                  errors.user?.phoneNumber ||
                  errors.role ||
                  errors.department}
              </Alert>
            )}

            <Grid container>
              <Grid item xs={5} lg={5} sx={{ pr: theme.spacing(2) }}>
                <TextField
                  fullWidth
                  label="Área"
                  {...getFieldProps("department")}
                  error={Boolean(touched.department && errors.department)}
                  helperText={touched.department && errors.department}
                />
              </Grid>
              <Grid item xs={7} lg={7}>
                <TextField
                  fullWidth
                  label="Puesto"
                  {...getFieldProps("role")}
                  error={Boolean(touched.role && errors.role)}
                  helperText={touched.role && errors.role}
                />
              </Grid>
            </Grid>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                fullWidth
                label="Nombre"
                {...getFieldProps("user.firstName")}
                error={Boolean(
                  touched.user?.firstName && errors.user?.firstName
                )}
                helperText={touched.user?.firstName && errors.user?.firstName}
              />

              <TextField
                fullWidth
                label="Apellido(s)"
                {...getFieldProps("user.lastName")}
                error={Boolean(touched.user?.lastName && errors.user?.lastName)}
                helperText={touched.user?.lastName && errors.user?.lastName}
              />
            </Stack>

            <TextField
              fullWidth
              autoComplete="phone"
              type="number"
              label="Teléfono"
              {...getFieldProps("user.phoneNumber")}
              error={Boolean(
                touched.user?.phoneNumber && errors.user?.phoneNumber
              )}
              helperText={touched.user?.phoneNumber && errors.user?.phoneNumber}
              InputProps={{
                startAdornment: <Typography>+52&nbsp;</Typography>,
              }}
            />

            <TextField
              fullWidth
              autoComplete="email"
              type="email"
              label="Correo electrónico"
              {...getFieldProps("user.email")}
              error={Boolean(touched.user?.email && errors.user?.email)}
              helperText={touched.user?.email && errors.user?.email}
            />

            <Box>
              <Divider />
              <Typography
                variant="subtitle1"
                color={"text.secondary"}
                sx={{ mt: theme.spacing(2) }}
              >
                CEDIS
              </Typography>
              {/* No hay cedis asignadas */}
              {unitPerms.length === 0 && (
                <Box
                  sx={{
                    mt: theme.spacing(2),
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography sx={{ color: "text.secondary" }}>
                      {" "}
                      No hay ningun CEDIS asignado a éste usuario.
                    </Typography>
                  </Box>
                </Box>
              )}
              {/* Lista de CEDIS */}
              {unitPerms.length > 0 && (
                <Box
                  sx={{
                    mt: theme.spacing(2),
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    {unitPerms.map((unitPerm, ix) => {
                      return (
                        <PersonelItem
                          key={ix}
                          topCaption={`(${
                            unitPerm.permissions.filter((p: any) => p.value)
                              .length
                          }/${numPermissions}) permisos`}
                          mainLabel={unitPerm?.unit?.unitName}
                          subLabel={unitPerm?.unit?.fullAddress}
                          options={[
                            {
                              label: "Editar",
                              onClick: () => handleOpenAssignUnit(unitPerm),
                            },
                            {
                              label: "Eliminar",
                              onClick: () => handleDeleteUnit(unitPerm),
                            },
                          ]}
                        />
                      );
                    })}
                  </Box>
                </Box>
              )}

              {/* Asignar cedis */}
              {units.length > unitPerms.length && (
                <Box textAlign={"center"}>
                  <Button
                    variant="contained"
                    color="info"
                    sx={{ mt: theme.spacing(2) }}
                    onClick={() => setOpenAssignUnit(true)}
                  >
                    Asignar CEDIS
                  </Button>
                </Box>
              )}
              <Divider sx={{ mt: theme.spacing(2) }} />
            </Box>

            <Box>
              <Typography
                variant="body2"
                color={"text.secondary"}
                sx={{ mb: theme.spacing(1) }}
              >
                Selecciona la casilla para que éste usuario pueda agregar,
                activar, desactivar y eliminar usuarios.
              </Typography>
              <Grid container>
                <Grid item xs={2} lg={1} sx={{ textAlign: "center" }}>
                  <Checkbox
                    {...getFieldProps("admin")}
                    checked={values.admin}
                    color="primary"
                  />
                </Grid>
                <Grid item xs={10} lg={11}>
                  <Typography
                    variant="h6"
                    color={"text.secondary"}
                    sx={{
                      mt: theme.spacing(1),
                      fontWeight: theme.typography.fontWeightLight,
                    }}
                  >
                    Administrador de Usuarios
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <LoadingButton
              fullWidth
              disabled={areErrors || empty}
              size="large"
              type="submit"
              variant="contained"
              loading={isSubmitting}
            >
              {!editMode ? "Guardar" : "Actualizar"}
            </LoadingButton>
          </Stack>
        </Form>
      </FormikProvider>
    </>
  );
};

export default PersonelForm;
