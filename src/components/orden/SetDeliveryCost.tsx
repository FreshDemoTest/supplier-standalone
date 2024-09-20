import {
  Box,
  Card,
  CardContent,
  CardHeader,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
// domain

type SetDeliveryCostSectionProps = {
  deliveryCost: string;
  updateDeliveryCost: (key: string, value: any) => void;
  sx?: any;
};

const SetDeliveryCostSection: React.FC<SetDeliveryCostSectionProps> = ({
  deliveryCost,
  updateDeliveryCost,
  sx,
}) => {
  return (
    <Card sx={{ ...sx }}>
      <CardHeader title="Define tu costo de envío" />
      <CardContent>
        <Box sx={{ mt: 0 }}>
          <Typography variant="body2" color={"text.secondary"} sx={{ mb: 2 }}>
            Costo de envío es opcional. Si no se define, será $0 MXN.
          </Typography>
          <Box sx={{ mx: { xs: 2, md: 8 } }}>
            <TextField
              fullWidth
              type="number"
              label="Costo de envío"
              value={deliveryCost}
              onChange={(e: any) =>
                updateDeliveryCost("shippingCost", e.target.value)
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    $
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SetDeliveryCostSection;
