import React, { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import track from "../../utils/analytics";
import StripeCard from "./StripeCard";
import { Alert, Box, Button, LinearProgress, Typography } from "@mui/material";

const btnStyles = {
  background: "#5469d4",
  color: "#ffffff",
  borderRadius: "8px 8px 8px 8px",
  border: 0,
  padding: "8px 8px 12px 12px",
  marginTop: "22px",
  fontSize: "16px",
  fontWeight: 600,
  cursor: "pointer",
  display: "block",
  transition: "all 0.2s ease",
  boxShadow: "0px 4px 5.5px 0px rgba(0, 0, 0, 0.07)",
  width: "100%",
  "::hover": {
    filter: "contrast(115%)",
  },
  "::disabled": {
    opacity: 0.5,
    cursor: "default",
  },
};

const txtStyles = {
  color: "#32325d",
  fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
  fontSmoothing: "antialiased",
  fontSize: "16px",
  "::placeholder": {
    color: "#aab7c4",
  },
  border: 0,
  marginTop: "2px",
  marginBottom: "16px",
  width: "100%",
  height: "26px",
  opacity: "100%",
  paddingLeft: "4px",
  "&:hover": {
    border: "1px solid #5469d4",
  },
};

const placeholderStyles = {
  ...txtStyles,
  opacity: "55%",
};

type StripeCardSetupFormProps = {
  onCardAdded: () => void;
  clientSecret: string;
  clientEmail: string;
  handleChangePaymentMethod: (paymentMethodId: string) => void;
};

const StripeCardSetupForm: React.FC<StripeCardSetupFormProps> = ({
  onCardAdded,
  clientSecret,
  clientEmail,
  handleChangePaymentMethod,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMsg, setErrorMsg] = useState("");
  const [clientName, setClientName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setClientName(event.target.value);
    setErrorMsg("");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsProcessing(true);

    if (!stripe || !elements) {
      setIsProcessing(false);
      return;
    }

    if (!clientName) {
      setErrorMsg("El Nombre de la tarjeta está Incompleto");
      setIsProcessing(false);
      return;
    }

    const confirmCard = async () => {
      const cardEle = elements.getElement(CardElement);
      if (!cardEle) {
        setErrorMsg(
          "Lo sentimos, no pudimos dar de alta tu tarjeta. Por favor, intenta de nuevo."
        );
        return;
      }
      const result = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardEle,
          billing_details: {
            name: clientName,
            email: clientEmail,
          },
        },
      });
      // Error routine
      if (result.error) {
        console.error(result.error);
        setErrorMsg(
          result.error.message ||
            "Lo sentimos, no pudimos dar de alta tu tarjeta."
        );
        setIsProcessing(false);
      }
      // Success routine
      else {
        if (!result.setupIntent.payment_method) {
          setErrorMsg(
            "Lo sentimos, no pudimos dar de alta tu tarjeta. Por favor, intenta de nuevo."
          );
          setIsProcessing(false);
          return;
        }
        // Set new card as default
        if (typeof result.setupIntent.payment_method === "string") {
          handleChangePaymentMethod(result.setupIntent.payment_method);
        } else {
          handleChangePaymentMethod(result.setupIntent.payment_method.id);
        }

        // call parent function & track event
        onCardAdded();
        track("add_payment_info", {
          visit: window.location.toString(),
          email: clientEmail,
        });
        setIsProcessing(false);

        // clear form
        setTimeout(() => {
          const cardElement = elements.getElement(CardElement);
          if (cardElement) cardElement.clear();
          setClientName("");
          setErrorMsg("");
        }, 200);
      }
    };
    // call async function
    confirmCard();
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Card info */}
      {!errorMsg ? (
        <>
          <Typography variant="subtitle2" color="text.secondary" mb={2}>
            <b>Información de la Tarjeta</b>
          </Typography>
          {stripe !== null ? (
            <StripeCard />
          ) : (
            <LinearProgress color="primary" />
          )}
          <Typography variant="subtitle2" color="text.secondary" mt={3} mb={2}>
            <b>Nombre en la Tarjeta</b>
          </Typography>
          <div style={{ textAlign: "left" }}>
            <input
              type="text"
              aria-label="Nombre en la Tarjeta"
              value={clientName}
              onChange={handleNameChange}
              placeholder={"Nombre en la Tarjeta"}
              // style={clientName ? txtStyles : placeholderStyles}
              style={placeholderStyles}
            />
          </div>
          <button disabled={!stripe || isProcessing} style={btnStyles}>
            {isProcessing ? "Agregando Tarjeta ..." : "Agregar Tarjeta"}
          </button>
          {/* Powered by Stripe */}
          <div style={{ marginTop: 10, textAlign: "right" }}>
            <img
              width={"30%"}
              src={"/static/assets/powered-stripe.png"}
              alt=""
            />
          </div>
        </>
      ) : null}
      {/* Error message */}
      {errorMsg ? (
        <>
          <Alert severity="error">{errorMsg}</Alert>
          <Box sx={{ mt: 1, display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              color="info"
              onClick={() => setErrorMsg("")}
            >
              Intentar de Nuevo
            </Button>
          </Box>
        </>
      ) : null}
    </form>
  );
};

export default StripeCardSetupForm;
