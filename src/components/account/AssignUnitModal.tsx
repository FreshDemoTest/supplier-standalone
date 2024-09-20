import * as Yup from 'yup';
import { ChangeEvent, useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { Icon } from '@iconify/react';
import { Form, FormikErrors, FormikProvider, useFormik } from 'formik';
// material
import closeFill from '@iconify/icons-eva/close-fill';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  styled,
  useTheme
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// hooks
import useIsMountedRef from '../../hooks/useIsMountedRef';
import { useAppSelector } from '../../redux/store';
// domain
import { UnitType } from '../../domain/account/SUnit';
import { UnitPermissionsType, PermissionType } from '../../domain/account/User';
import { APP_PERMISSION_GROUPS } from '../../domain/auth/AccountPermissions';
// components
import BasicDialog from '../navigation/BasicDialog';
// utils
import { reduceBoolArray } from '../../utils/helpers';
// import { getUnitsAllowed } from '../../utils/permissions';

// --------------------------------------------------------

const numPermissions = APP_PERMISSION_GROUPS.reduce((acc, val) => {
  acc += val.permissions.length;
  return acc;
}, 0);

// --------------------------------------------------------

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  '& .MuiAccordionSummary-content': {
    '&.Mui-expanded': {
      margin: theme.spacing(0)
    }
  }
}));

// --------------------------------------------------------

type PermissionsFormProps = {
  permissions: PermissionType[];
  setPermissions: (permissions: PermissionType[]) => void;
  editMode?: boolean;
};

const PermissionsForm: React.FC<PermissionsFormProps> = ({
  permissions,
  setPermissions,
  editMode = false
}) => {
  // checkedStore = { 'groupKey' : {'permissionKey': boolean, ...}, ... }
  const [checkedStore, setCheckedStore] = useState(
    APP_PERMISSION_GROUPS.map((gp) => {
      return gp.permissions.map((p) => ({
        groupKey: gp.groupKey,
        key: p.key,
        value: false
      }));
    }).reduce((gacc, gval) => {
      const gkey = gval[0].groupKey;
      gacc[gkey] = gval.reduce((acc, val) => {
        acc[val.key] = val.value;
        return acc;
      }, {} as { [key: string]: boolean });
      return gacc;
    }, {} as { [key: string]: { [key: string]: boolean } })
  );

  // hook - onReceived permissions -> update checkedStore
  useEffect(() => {
    if (editMode) {
      const permIdx = permissions.reduce((acc, val) => {
        acc[val.key] = val.value;
        return acc;
      }, {} as { [key: string]: boolean });
      const tmpCheckedStore = { ...checkedStore };
      Object.keys(checkedStore).forEach((g) => {
        tmpCheckedStore[g] = Object.entries(tmpCheckedStore[g])
          .map(([pkey, pval]) => {
            if (permIdx[pkey] !== undefined) {
              return {
                key: pkey,
                value: permIdx[pkey]
              };
            }
            return {
              key: pkey,
              value: pval
            };
          })
          .reduce((acc, val) => {
            acc[val.key] = val.value;
            return acc;
          }, {} as { [key: string]: boolean });
      });
      setCheckedStore(tmpCheckedStore);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissions]);

  const handleChangeBoxes = (group: string, key: string, val: boolean) => {
    // update local store
    setCheckedStore({
      ...checkedStore,
      [group]: {
        ...checkedStore[group],
        [key]: val
      }
    });

    // update permissions component state
    if (!permissions.map((p) => p.key).includes(key)) {
      const newPerms = permissions.map((p) => p); // deep copy
      newPerms.push({
        key,
        value: val
      });
      setPermissions(newPerms);
    } else {
      setPermissions(
        permissions.map((p) => {
          if (p.key === key) {
            return {
              key: p.key,
              value: val
            };
          } else {
            return p;
          }
        })
      );
    }
  };

  const handleParentChangeBoxes = (
    group: string,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    // update local store
    setCheckedStore({
      ...checkedStore,
      [group]: Object.keys(checkedStore[group]).reduce((acc, key) => {
        acc[key] = event.target.checked;
        return acc;
      }, {} as { [key: string]: boolean })
    });

    // update permissions component state
    const tmpPerms = [...permissions];
    for (const pkey in checkedStore[group]) {
      if (!tmpPerms.map((p) => p.key).includes(pkey)) {
        tmpPerms.push({
          key: pkey,
          value: event.target.checked
        });
      } else {
        tmpPerms.forEach((p) => {
          if (Object.keys(checkedStore[group]).includes(p.key)) {
            const idx = tmpPerms.findIndex((tp) => tp.key === p.key);
            tmpPerms[idx] = {
              key: p.key,
              value: event.target.checked
            };
          }
        });
      }
    }
    setPermissions(tmpPerms);
  };

  const validateGroupIndeterminate = (group: { [key: string]: boolean }) => {
    const allsz = Object.keys(group).length;
    const truesz = Object.values(group).filter((v) => v).length;
    return truesz > 0 && truesz < allsz;
  };

  // render
  return (
    <Box sx={{ mt: 1, mb: 2 }}>
      {APP_PERMISSION_GROUPS.map((gp) => (
        <Accordion key={gp.groupLabel}>
          {/* Group permission */}
          <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
            <FormControlLabel
              label={gp.groupLabel}
              control={
                <Checkbox
                  checked={reduceBoolArray(
                    Object.values(checkedStore[gp.groupKey]),
                    'and'
                  )}
                  indeterminate={validateGroupIndeterminate(
                    checkedStore[gp.groupKey]
                  )}
                  onChange={(e) => handleParentChangeBoxes(gp.groupKey, e)}
                />
              }
            />
          </StyledAccordionSummary>
          {/* Children permissions */}
          <AccordionDetails sx={{ pt: 0, mt: -1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', ml: 2 }}>
              {gp.permissions.map((p) => (
                <FormControlLabel
                  key={p.key}
                  label={
                    <Typography variant="caption" color="text.secondary">
                      {p.label}
                    </Typography>
                  }
                  control={
                    <Checkbox
                      checked={checkedStore[gp.groupKey][p.key]}
                      onChange={(e) =>
                        handleChangeBoxes(gp.groupKey, p.key, e.target.checked)
                      }
                    />
                  }
                />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

// --------------------------------------------------------

type AssignUnitFormProps = {
  unitAssignState: {
    unitName: string;
    unitId: string;
  };
  permissionsState: PermissionType[];
  editMode?: boolean;
  onSuccessCallback: (action: 'save' | 'update' | 'back', data?: any) => void;
  units: UnitType[];
};

const AssignUnitForm: React.FC<AssignUnitFormProps> = ({
  unitAssignState = {
    unitName: '',
    unitId: ''
  },
  permissionsState = [],
  editMode = false,
  onSuccessCallback,
  units = []
}) => {
  const isMountedRef = useIsMountedRef();
  const theme = useTheme();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [unitPerms, setUnitPerms] = useState<PermissionType[]>([]);

  // on received permissions -> update unitPerms
  useEffect(() => {
    if (editMode) {
      setUnitPerms(permissionsState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionsState]);

  const AssignUnitSchema = Yup.object().shape({
    unitId: Yup.string()
      .oneOf(units.map((b) => b.id))
      .required('CEDIS es requerida.'),
    unitName: Yup.string()
  });

  const formik = useFormik({
    initialValues: unitAssignState,
    validationSchema: AssignUnitSchema,
    onSubmit: async (values, { setErrors, setSubmitting }) => {
      try {
        // get unit name
        const selUnit = units.find((b) => b.id === values.unitId);
        // redux
        if (editMode) {
          onSuccessCallback('update', {
            unit: selUnit,
            permissions: unitPerms
          });
        } else {
          onSuccessCallback('save', {
            unit: selUnit,
            permissions: unitPerms
          });
        }
        if (isMountedRef.current) {
          setSubmitting(false);
        }
      } catch (error) {
        enqueueSnackbar(
          'Error asignando CEDIS a tu Personal. Por favor intenta de nuevo.',
          {
            variant: 'error',
            action: (key) => (
              <IconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </IconButton>
            )
          }
        );
        if (isMountedRef.current) {
          setErrors({ user: error } as FormikErrors<any>);
          setSubmitting(false);
          // redux
          // dispatch(raiseError(error));
        }
      }
    }
  });

  const {
    values,
    errors,
    touched,
    handleSubmit,
    isSubmitting,
    getFieldProps
    // setFieldValue
  } = formik;

  const nonEmpty = values.unitId !== '';

  const allValues = Object.keys(errors).length === 0;

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Stack spacing={3} sx={{ mt: theme.spacing(2) }}>
          {!allValues && nonEmpty && (
            <Alert severity="error">{errors.unitId}</Alert>
          )}

          <Grid container>
            <Grid item xs={12} lg={12}>
              <TextField
                fullWidth
                select
                label="CEDIS"
                {...getFieldProps('unitId')}
                error={Boolean(touched.unitId && errors.unitId)}
                helperText={touched.unitId && errors.unitId}
              >
                {units.map((unit) => (
                  <MenuItem key={unit.id} value={unit.id}>
                    {unit.unitName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          {/* Permissions form */}
          <Box>
            <Typography variant="subtitle1" color="text.secondary">
              Permisos
            </Typography>
            <PermissionsForm
              permissions={unitPerms}
              setPermissions={setUnitPerms}
              editMode={editMode}
            />
          </Box>

          <Stack direction="row-reverse" spacing={2}>
            <LoadingButton
              fullWidth
              disabled={!allValues}
              size="large"
              type="submit"
              variant="contained"
              loading={isSubmitting}
            >
              Guardar
            </LoadingButton>
            <Button
              fullWidth
              variant="outlined"
              color="info"
              onClick={() => onSuccessCallback('back')}
            >
              Cancelar
            </Button>
          </Stack>
        </Stack>
      </Form>
    </FormikProvider>
  );
};

// --------------------------------------------------------

type AssignUnitModalProps = {
  openModal?: boolean;
  onCloseModal: () => void;
  onSuccess: (action: 'save' | 'update' | 'back', data?: any) => void;
  unitPermissionState?: UnitPermissionsType;
  editMode?: boolean;
};

const AssignUnitModal: React.FC<AssignUnitModalProps> = ({
  openModal = false,
  onCloseModal,
  onSuccess,
  unitPermissionState = {
    unit: {
      unitName: '',
      id: ''
    },
    permissions: []
  },
  editMode = false
}) => {
  const { units: AllUnits } = useAppSelector((state) => state.account);
  // const { allowed } = useAppSelector((state) => state.permission);
  // const allowed = {};
  const [units, setUnits] = useState<UnitType[]>([]);

  // filter units
  useEffect(
    () => {
      if (AllUnits.length > 0) {
        // const _units = getUnitsAllowed(
        //   AllUnits,
        //   allowed?.unitPermissions
        // ).filter((b: any) => !b.deleted);
        const _units = AllUnits.filter((b: any) => !b.deleted);
        setUnits(_units);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [AllUnits] // add allowed
  );

  return (
    <BasicDialog open={openModal} onClose={onCloseModal} title="Asignar CEDIS">
      <Typography variant="body2" color="text.secondary">
        Escoge la CEDIS a a cual quieres asignar éste usuario, qué permisos
        tendrá dentro de la plataforma.
      </Typography>
      {/* Assignation Form */}
      <AssignUnitForm
        unitAssignState={{
          unitName: unitPermissionState?.unit?.unitName,
          unitId: unitPermissionState.unit.id || ''
        }}
        permissionsState={unitPermissionState.permissions}
        editMode={editMode}
        onSuccessCallback={onSuccess}
        units={units || []}
      />
    </BasicDialog>
  );
};

export default AssignUnitModal;
export { numPermissions };
