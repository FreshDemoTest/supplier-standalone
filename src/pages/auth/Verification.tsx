import React, { useEffect, useRef, useState } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
// material
import { styled, useTheme } from "@mui/material/styles";
import {
  Box,
  Card,
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  MenuItem,
  IconButton,
  capitalize,
  Grid,
  TextField,
  Link,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Icon } from "@iconify/react";
import closeFill from "@iconify/icons-eva/close-fill";
import questionMarkFill from "@iconify/icons-eva/question-mark-circle-outline";
import { closeSnackbar, enqueueSnackbar } from "notistack";
// hooks
import useAuth from "../../hooks/useAuth";
import { useAppDispatch, useAppSelector } from "../../redux/store";
// redux
import { getUser } from "../../redux/slices/registration";
// layouts
import AuthLayout from "../../layouts/AuthLayout";
// components
import Page from "../../components/Page";
import MHidden from "../../components/extensions/MHidden";
import FixedAddButton from "../../components/footers/FixedAddButton";
// utils
import { delay } from "../../utils/helpers";
import track from "../../utils/analytics";
// routes
import { PATHS_EXTERNAL } from "../../routes/paths";

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    display: "flex",
  },
}));

const SectionStyle = styled(Card)(({ theme }) => ({
  width: "100%",
  maxWidth: 464,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  margin: theme.spacing(2, 0, 2, 2),
}));

const ContentStyle = styled("div")(({ theme }) => ({
  maxWidth: 480,
  margin: "auto",
  display: "flex",
  minHeight: "100vh",
  flexDirection: "column",
  justifyContent: "left",
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function Verification() {
  // hooks
  const {
    sendPhoneNumberValidation,
    verifyPhoneNumberCode,
    sendEmailValidation,
    verification,
    logout,
  } = useAuth();
  const theme = useTheme();
  const fetchedUser = useRef(false);
  // redux
  const { user } = useAppSelector((state) => state.registration);
  const dispatch = useAppDispatch();
  // states
  const [validationMethod, setValidationMethod] = useState("");
  const [valMethodFixed, setValMethodFixed] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [isCodeSent, setCodeSent] = useState(false);
  const [valCode, setValCode] = useState<string>("");
  const [isConfirming, setConfirming] = useState(false);
  const [revCounter, setRevCounter] = useState(0);

  // hook - fetch user
  useEffect(() => {
    const _getUser = async () => {
      const token = await firebase.auth().currentUser?.getIdToken(true);
      if (!token || fetchedUser.current) {
        return;
      }
      fetchedUser.current = true;
      try {
        await dispatch(getUser(token));
      } catch (error) {
        console.error(error);
        // [TODO] - here instead of logging out, we should redirect to a page of different onboarding
        enqueueSnackbar(
          `Error: tu usuario Alima Seller no está registrado. Por favor contacta a soporte.`,
          {
            variant: "error",
            autoHideDuration: 4000,
          }
        );
        await logout();
      }
    };
    if (!user.phoneNumber) {
      _getUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const handleChange = (event: SelectChangeEvent) => {
    setValidationMethod(event.target.value as string);
    track("select_content", {
      method: event.target.value as string,
      visit: window.location.toString(),
      page: "Verification",
      section: "",
    });
  };

  const handleValCodeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    let tmpstr = event.target.value.replaceAll("-", "");
    let dipstr = "";
    for (let j = 0; j < tmpstr.length; j += 1) {
      let dig = tmpstr[j];
      if (!dig.match(/\d+/)) {
        continue;
      }
      if (j === 3) {
        dipstr += "-";
      }
      if (j < 6) {
        dipstr += tmpstr[j];
      }
    }
    setValCode(dipstr);
  };

  const sendCode = async () => {
    setSubmitting(true);
    setValMethodFixed(true); // fix the val method
    setRevCounter(60); // resend message in 30 secs
    if (validationMethod === "sms") {
      await sendPhoneNumberValidation(
        "recaptcha-container",
        "+" + user.phoneNumber
      );
      setCodeSent(true);
    } else {
      await sendEmailValidation();
      await delay(2000); // code is been sent
      setCodeSent(true);
    }
    // send message
    enqueueSnackbar(`Enviando código por ${capitalize(validationMethod)}`, {
      variant: "info",
      autoHideDuration: 1000,
      action: (key) => (
        <IconButton size="small" onClick={() => closeSnackbar(key)}>
          <Icon icon={closeFill} />
        </IconButton>
      ),
    });
    setSubmitting(false);
    track("select_content", {
      method: validationMethod,
      visit: window.location.toString(),
      page: "Verification",
      section: "",
    });
  };

  const confirmCode = async () => {
    setConfirming(true);
    verifyPhoneNumberCode(valCode.replaceAll("-", ""));
    track("select_content", {
      method: validationMethod,
      visit: window.location.toString(),
      page: "Verification",
      section: "",
    });
  };

  const validationObj =
    validationMethod === "sms"
      ? "código"
      : validationMethod === ""
      ? ""
      : "link";

  useEffect(() => {
    // Validation of errors
    if (verification.error === "sms_sending_phone_validation_issue") {
      enqueueSnackbar(
        `Error enviando el código por SMS. Intenta con otro método de validación.`,
        {
          variant: "error",
          autoHideDuration: 2000,
          action: (key) => (
            <IconButton size="small" onClick={() => closeSnackbar(key)}>
              <Icon icon={closeFill} />
            </IconButton>
          ),
        }
      );
      setConfirming(false);
    } else if (verification.error === "sms_verifying_phone_validation_issue") {
      enqueueSnackbar(
        `Error en tu código de validación. Por favor revísalo de nuevo.`,
        {
          variant: "error",
          autoHideDuration: 2000,
          action: (key) => (
            <IconButton size="small" onClick={() => closeSnackbar(key)}>
              <Icon icon={closeFill} />
            </IconButton>
          ),
        }
      );
      setValCode(""); // reset validation code to retry
      setConfirming(false);
    } else if (verification.error === "email_verifying_validation_issue") {
      enqueueSnackbar(
        `Error enviando el código por Email. Intenta con otro método de validación .`,
        {
          variant: "error",
          autoHideDuration: 2000,
          action: (key) => (
            <IconButton size="small" onClick={() => closeSnackbar(key)}>
              <Icon icon={closeFill} />
            </IconButton>
          ),
        }
      );
      setConfirming(false);
    } else if (verification.isVerified && verification.method === "sms") {
      enqueueSnackbar(
        `Tu código de validación ha sido correctamente verificado.`,
        {
          variant: "success",
          autoHideDuration: 2000,
          action: (key) => (
            <IconButton size="small" onClick={() => closeSnackbar(key)}>
              <Icon icon={closeFill} />
            </IconButton>
          ),
        }
      );
      setValCode(""); // reset validation code to retry
      setConfirming(false);
    }
    if (verification) {
      track("select_content", {
        ...verification,
        visit: window.location.toString(),
        page: "Verification",
        section: "",
      });
    }
  }, [verification]);

  // Reverse counter to resend code.
  setTimeout(() => {
    if (revCounter > 0) {
      setRevCounter(revCounter - 1);
    }
  }, 1000);

  return (
    <RootStyle title="Verificación Cuenta | Alima">
      <AuthLayout pageName="Verification" />

      <MHidden width="mdDown">
        <SectionStyle>
          <Typography variant="h4" sx={{ px: 5, mt: 10 }}>
            La mejor plataforma para proveedores.
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ pl: 5, pr: 6, mt: 4, mb: 5 }}
          >
            Factura en automático, olvídate de los retrasos de pagos por
            facturas con errores manuales.
          </Typography>
          <Box sx={{ px: 8 }}>
            <img
              alt="Verify"
              className="lazyload blur-up"
              src="/static/assets/illustrations/invoice_data.jpg"
              style={{ borderRadius: "16px" }}
            />
          </Box>
        </SectionStyle>
      </MHidden>

      <Container>
        <ContentStyle>
          {/* Instructions */}
          <Box
            sx={{ mt: theme.spacing(5), display: "flex", alignItems: "center" }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" gutterBottom>
                Escoge tu método de validación.
              </Typography>
              <Typography variant="body1" sx={{ color: "text.secondary" }}>
                Selecciona Email o SMS para enviarte la información de
                validación de tu usuario.
              </Typography>
            </Box>
          </Box>

          {/* Validation method selector */}
          <Box sx={{ my: theme.spacing(4) }}>
            <FormControl fullWidth>
              <InputLabel id="validation-select-label">
                Método de Validación
              </InputLabel>
              <Select
                labelId="validation-select-label"
                id="validation-select"
                value={validationMethod}
                label="Método de Validación"
                onChange={handleChange}
                disabled={valMethodFixed}
              >
                <MenuItem value={"sms"}>SMS</MenuItem>
                <MenuItem value={"email"}>Correo Electrónico</MenuItem>
                {/* <MenuItem value={'whatsapp'}>WhatsApp</MenuItem> */}
              </Select>
            </FormControl>
          </Box>

          {/* Firebase recaptcha */}
          <div id="recaptcha-container"></div>

          {/* Send code buttons */}
          {!isCodeSent && (
            <Box>
              <LoadingButton
                fullWidth
                disabled={validationMethod === ""}
                size="large"
                variant="contained"
                loading={isSubmitting}
                onClick={sendCode}
              >
                Enviar {validationObj}
              </LoadingButton>
              {validationMethod === "sms" && (
                <Typography
                  variant="body1"
                  sx={{ color: "text.secondary", mt: theme.spacing(1) }}
                >
                  Recibirás tu código al número: <b>+{user.phoneNumber}</b>.
                </Typography>
              )}
              {validationMethod === "email" && (
                <Typography
                  variant="body1"
                  sx={{ color: "text.secondary", mt: theme.spacing(1) }}
                >
                  Recibirás tu link de validación al correo electrónico:{" "}
                  <b>{user.email}</b>.
                </Typography>
              )}
            </Box>
          )}
          {/* Code validation components */}
          {isCodeSent && (
            <Box>
              {validationMethod === "sms" && (
                <Grid container>
                  <Grid item>
                    <Typography
                      variant="body1"
                      sx={{ color: "text.secondary" }}
                    >
                      Debiste recibir un código de 6 dígitos, cópialo aquí:
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    textAlign={"center"}
                    sx={{ mt: theme.spacing(2) }}
                  >
                    <TextField
                      type="text"
                      value={valCode}
                      onChange={handleValCodeInput}
                      placeholder="000-000"
                      inputProps={{
                        style: {
                          textAlign: "center",
                          maxWidth: theme.spacing(12),
                          fontSize: theme.typography.h4.fontSize,
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              )}

              {validationMethod === "email" && (
                <Grid container>
                  <Grid item>
                    <Typography
                      variant="body1"
                      sx={{ color: "text.secondary" }}
                    >
                      Debiste recibir un link de validación al correo
                      electrónico: <b>{user.email}</b>.
                    </Typography>
                  </Grid>
                </Grid>
              )}

              <Grid container direction={"row"} sx={{ mt: theme.spacing(2) }}>
                <Grid item xs={6} lg={6} sx={{ px: theme.spacing(1) }}>
                  <LoadingButton
                    fullWidth
                    size="large"
                    color="info"
                    variant="contained"
                    loading={false}
                    onClick={() => {
                      setCodeSent(false);
                      setValMethodFixed(false);
                      track("select_content", {
                        method: validationMethod,
                        visit: window.location.toString(),
                        page: "Verification",
                        section: "",
                      });
                    }}
                  >
                    Regresar
                  </LoadingButton>
                </Grid>
                {validationMethod === "sms" && (
                  <Grid item xs={6} lg={6} sx={{ px: theme.spacing(1) }}>
                    <LoadingButton
                      fullWidth
                      disabled={valCode.length < 7}
                      size="large"
                      color="primary"
                      variant="contained"
                      loading={isConfirming}
                      onClick={confirmCode}
                    >
                      Continuar
                    </LoadingButton>
                  </Grid>
                )}
              </Grid>
              <Grid container spacing={2} sx={{ mt: theme.spacing(3) }}>
                <Grid item xs={12} lg={12}>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", cursor: "pointer" }}
                  >
                    ¿No recibiste tu {validationObj}?&nbsp;
                    {revCounter === 0 && (
                      <Link variant="subtitle1" onClick={sendCode}>
                        Reenviar {validationObj}
                      </Link>
                    )}
                    {revCounter > 0 && (
                      <Link
                        variant="subtitle1"
                        color={theme.palette.action.disabled}
                      >
                        Reenvíalo en {revCounter} segs.
                      </Link>
                    )}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </ContentStyle>
      </Container>
      {/* Help button */}
      <FixedAddButton
        onClick={() => {
          track("select_content", {
            visit: window.location.toString(),
            page: "Verification",
            section: "HelpBottomButton",
          });
          window.open(PATHS_EXTERNAL.supportAlimaWA, "_blank");
        }}
        buttonIcon={questionMarkFill}
        iconButtonSx={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.secondary,
          boxShadow: theme.shadows[2],
        }}
      />
    </RootStyle>
  );
}
