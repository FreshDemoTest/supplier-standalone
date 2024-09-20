import React, { useEffect, useState } from "react";
// material
import { Box, Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
// hooks
import { useAppDispatch, useAppSelector } from "../../../redux/store";
// components
import LoadingProgress from "../../../components/LoadingProgress";
// domain
import { AlimaPaymentMethodsType } from "../../../domain/account/Business";
import BasicDialog from "../../../components/navigation/BasicDialog";
import CreditCardListItem from "../../../components/billing/CreditCardListItem";
import StripeSaveCard from "../../../components/billing/StripeSaveCard";
import {
  deleteStripeCard,
  getSupplierAlimaAccount,
} from "../../../redux/slices/account";
import useAuth from "../../../hooks/useAuth";
import { useSnackbar } from "notistack";

// ----------------------------------------------------------------------

const TransferPaymentInfo = (pMethod: AlimaPaymentMethodsType) => {
  if (!pMethod.transferAccount) {
    return (
      <>
        <Typography variant="body2" color="text.secondary">
          Tu método de pago es
        </Typography>
        <Typography variant="h5" color="text.secondary">
          <b>Transferencia</b>
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 3, mb: 3 }}
        >
          Parece haber un error en la cuenta a la cual debes realizar el pago.
          <br />
          <br />
          Favor de contactar a Soporte.
        </Typography>
      </>
    );
  }
  return (
    <>
      <Typography variant="body2" color="text.secondary">
        Tu método de pago es
      </Typography>
      <Typography variant="h5" color="text.secondary">
        <b>Transferencia</b>
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 3, mb: 3 }}>
        La cuenta a la que debes realizar el pago es:
      </Typography>

      {pMethod.transferAccount.accountName ? (
        <Typography variant="body2" color="text.secondary">
          <b>Nombre: {pMethod.transferAccount.accountName}</b>
        </Typography>
      ) : null}
      <Typography variant="body2" color="text.secondary">
        <b>Banco: {pMethod.transferAccount.bankName}</b>
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        <b>CLABE: {pMethod.transferAccount.accountNumber}</b>
      </Typography>
    </>
  );
};

// ----------------------------------------------------------------------

const StripeCardPaymentInfo = (pMethod: AlimaPaymentMethodsType) => {
  const [open, setOpen] = useState(false);
  const [cardSaved, setCardSaved] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const { sessionToken } = useAuth();

  return (
    <>
      <BasicDialog
        title="Agregar una tarjeta"
        msg="Da de alta la información de tu Tarjeta."
        open={open}
        onClose={() => setOpen(false)}
        closeMark={false}
        continueAction={{
          active: cardSaved,
          msg: "Continuar",
          actionFn: () => {
            setOpen(false);
          },
        }}
        props={{ marginLeft: { xs: 0, md: 36 } }}
      >
        <Box sx={{ my: 4, mx: { xs: 0, md: 3 } }}>
          {!cardSaved ? (
            <StripeSaveCard
              paymentMethods={[pMethod]}
              onSave={() => {
                dispatch(getSupplierAlimaAccount(sessionToken || ""));
                setCardSaved(true);
              }}
              handleChangePaymentMethod={(pmId: string) => {
                // [TODO]: Add this function
                console.log("handleChangePaymentMethod", pmId);
              }}
            />
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
              Tarjeta registrada exitosamente.
            </Typography>
          )}
        </Box>
      </BasicDialog>

      <Typography variant="body2" color="text.secondary">
        Tu método de pago es
      </Typography>
      <Typography variant="h5" color="text.secondary">
        <b>Tarjeta de crédito</b>
      </Typography>

      {pMethod.stripeCards && pMethod.stripeCards.length > 0 ? (
        <>
          {/* List Cards */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 3, mb: 2 }}
          >
            Éstas son tus tarjetas registradas:
          </Typography>

          <Box sx={{ mb: 2 }}>
            {pMethod.stripeCards.map((card) => (
              <Box sx={{ mb: 1 }}>
                <CreditCardListItem
                  key={card.id}
                  card={card}
                  handleDefaultCard={() => {
                    // [TODO]: Add this function
                    console.log("handleDefaultCard");
                  }}
                  deleteCard={() => {
                    const _deleteCard = async () => {
                      try {
                        // delete card
                        await dispatch(
                          deleteStripeCard(
                            sessionToken || "",
                            pMethod.paymentProviderId,
                            card.id
                          )
                        );
                        // refresh account
                        dispatch(getSupplierAlimaAccount(sessionToken || ""));
                      } catch (error) {
                        console.error("Error deleting card:", error);
                        enqueueSnackbar(
                          "Ocurrió un error al intentar eliminar la tarjeta.",
                          { variant: "error" }
                        );
                      }
                    };
                    _deleteCard();
                  }}
                />
              </Box>
            ))}
          </Box>
        </>
      ) : (
        <>
          {/* No cards found */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 3, mb: 3 }}
          >
            No tienes ninguna tarjeta registrada, por favor agrega una.
          </Typography>
        </>
      )}

      {/* Add Card Button */}
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          color="info"
          onClick={() => setOpen(true)}
        >
          Agregar Tarjeta
        </Button>
      </Box>
    </>
  );
};

// ----------------------------------------------------------------------

const SetupStripeCardPayment = (pMethod: AlimaPaymentMethodsType) => {
  const [open, setOpen] = useState(false);
  const [cardSaved, setCardSaved] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const { sessionToken } = useAuth();

  return (
    <>
      <BasicDialog
        title="Agregar una tarjeta"
        msg="Da de alta la información de tu Tarjeta."
        open={open}
        onClose={() => setOpen(false)}
        closeMark={false}
        continueAction={{
          active: cardSaved,
          msg: "Continuar",
          actionFn: () => {
            setOpen(false);
          },
        }}
        props={{ marginLeft: { xs: 0, md: 36 } }}
      >
        <Box sx={{ my: 4, mx: { xs: 0, md: 3 } }}>
          {!cardSaved ? (
            <StripeSaveCard
              paymentMethods={[pMethod]}
              onSave={() => {
                dispatch(getSupplierAlimaAccount(sessionToken || ""));
                setCardSaved(true);
                setOpen(false);
              }}
              handleChangePaymentMethod={(pmId: string) => {
                // [TODO]: Add this function
                console.log("handleChangePaymentMethod", pmId);
              }}
            />
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
              Tarjeta registrada exitosamente.
            </Typography>
          )}
        </Box>
      </BasicDialog>

      {pMethod.stripeCards && pMethod.stripeCards.length > 0 ? (
        <>
          {/* List Cards */}
          <Box sx={{ mb: 2 }}>
            {pMethod.stripeCards.map((card) => (
              <Box sx={{ mb: 1 }}>
                <CreditCardListItem
                  key={card.id}
                  card={card}
                  handleDefaultCard={() => {
                    // [TODO]: Add this function
                    console.log("handleDefaultCard");
                  }}
                  deleteCard={() => {
                    const _deleteCard = async () => {
                      try {
                        // delete card
                        await dispatch(
                          deleteStripeCard(
                            sessionToken || "",
                            pMethod.paymentProviderId,
                            card.id
                          )
                        );
                        // refresh account
                        dispatch(getSupplierAlimaAccount(sessionToken || ""));
                      } catch (error) {
                        console.error("Error deleting card:", error);
                        enqueueSnackbar(
                          "Ocurrió un error al intentar eliminar la tarjeta.",
                          { variant: "error" }
                        );
                      }
                    };
                    _deleteCard();
                  }}
                />
              </Box>
            ))}
          </Box>
        </>
      ) : (
        <>
          {/* No cards found */}
          <Typography
            color="text.secondary"
            sx={{ mt: 3, mb: 3 }}
            align="center"
          >
            Agrega tu tarjeta, puede ser de crédito o débito.
          </Typography>

          {/* Add Card Button */}
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              color="info"
              onClick={() => setOpen(true)}
            >
              Agregar Tarjeta
            </Button>
          </Box>
        </>
      )}
    </>
  );
};

// ----------------------------------------------------------------------

type PayMethodsInfoProps = {
  paymentMethods: AlimaPaymentMethodsType[];
};

const PayMethodsInfo: React.FC<PayMethodsInfoProps> = ({ paymentMethods }) => {
  const { isLoading } = useAppSelector((state) => state.account);
  const [payMethods, setPayMethods] =
    useState<AlimaPaymentMethodsType[]>(paymentMethods);

  useEffect(() => {
    setPayMethods(
      paymentMethods.map((p) => ({
        ...p,
      }))
    );
  }, [paymentMethods]);

  return (
    <>
      {/* Loading screen */}
      {isLoading && <LoadingProgress />}
      {/* Payment Method info */}
      {!isLoading && (
        <Box
          sx={{
            pl: { xs: 0, md: "20%" },
            mt: 3,
            width: { xs: "100%", md: "80%" },
          }}
        >
          {payMethods.map((pm) => (
            <React.Fragment key={pm.id}>
              {pm.paymentType.toLowerCase() === "transfer" ? (
                <TransferPaymentInfo {...pm} />
              ) : null}

              {pm.paymentType.toLowerCase() === "card" ? (
                <StripeCardPaymentInfo {...pm} />
              ) : null}
            </React.Fragment>
          ))}
        </Box>
      )}
    </>
  );
};

export default PayMethodsInfo;
export { SetupStripeCardPayment };
