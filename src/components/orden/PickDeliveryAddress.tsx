import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Radio,
  Typography
} from '@mui/material';

type PickDeliveryDateSectionProps = {
  address: string;
  allowsAddressModification?: boolean;
  sx?: any;
};

const PickDeliveryAddressSection: React.FC<PickDeliveryDateSectionProps> = ({
  address,
  allowsAddressModification = false,
  sx
}) => {
  return (
    <Card sx={{ ...sx }}>
      <CardHeader title="Confirma la dirección de tu entrega" />
      <CardContent>
        <Card>
          <CardContent>
            <Grid container>
              <Grid item xs={3} md={3}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    pt: { xs: 3, md: 1 }
                  }}
                >
                  <Radio checked={true} />
                </Box>
              </Grid>
              <Grid item xs={9} md={7}>
                <Box sx={{ pt: { xs: 0.5, md: 1.5 } }}>
                  <Typography variant="body1" align="right">
                    {address}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        {allowsAddressModification && (
          // [TODO] implement update address here
          <Button>Modificar dirección</Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PickDeliveryAddressSection;
