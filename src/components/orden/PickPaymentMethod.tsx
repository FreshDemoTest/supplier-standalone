import {
  Alert,
  Box,
  Card,
  CardContent,
  CardHeader,
  MenuItem,
  TextField,
} from "@mui/material";
// domain
import { paymentMethods } from "../../domain/orden/Orden";
import MHidden from "../extensions/MHidden";
import { UnitType } from "../../domain/account/SUnit";

type PickPaymentMethodSectionProps = {
  supUnit: UnitType;
  paymentMethod: string;
  updatePaymentMethod: (key: string, value: any) => void;
  sx?: any;
};

const PickPaymentMethodSection: React.FC<PickPaymentMethodSectionProps> = ({
  supUnit,
  paymentMethod,
  updatePaymentMethod,
  sx,
}) => {
  const allowedPaymentMethods = supUnit.paymentMethods?.map((pm) => ({
    value: pm,
    label: paymentMethods[pm],
  }));
  return (
    <Card sx={{ ...sx }}>
      <CardHeader title="Selecciona tu método de pago" />
      <CardContent>
        <Box sx={{ mt: 0 }}>
          <TextField
            fullWidth
            select
            label="Método de pago"
            value={paymentMethod?.toLowerCase()}
            onChange={(e: any) =>
              updatePaymentMethod("paymentMethod", e.target.value)
            }
          >
            {allowedPaymentMethods?.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          {paymentMethod && paymentMethod.toLowerCase() === "transfer" && (
            <>
              <MHidden width="mdDown">
                {/* Desktop */}
                <Alert severity="success" sx={{ mt: 2 }}>
                  Por favor, realiza el pago a la cuenta:&nbsp;
                  <b>CLABE: {supUnit.accountNumber}</b>
                </Alert>
              </MHidden>

              <MHidden width="mdUp">
                {/* mobile */}
                <Alert severity="success" sx={{ mt: 2 }}>
                  Por favor, realiza el pago a la cuenta: <br />
                  <b>CLABE: {supUnit.accountNumber}</b>
                </Alert>
              </MHidden>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default PickPaymentMethodSection;
