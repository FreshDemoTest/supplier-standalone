import { Box, Button, Grid, Typography, useTheme } from "@mui/material";
import { StripeCardType } from "../../domain/account/Business";
import { mixtrack } from "../../utils/analytics";

// -----------------------------------------------------------------------------------------

type cardBrandType = 'mastercard' | 'master_card' | 'visa';


function renderIcon(cardType: cardBrandType): string {
  if (cardType === 'master_card' || cardType === 'mastercard') {
    return '/static/assets/ic_mastercard.svg';
  } else if (cardType === 'visa') {
    return '/static/assets/ic_visa.svg';
  } else if (cardType === 'american_express') {
    return '/static/assets/ic_amex.svg';
  }
  return '/static/assets/ic_credit_card.svg';
}

// -----------------------------------------------------------------------------------------

type CreditCardListItemProps = {
  card: StripeCardType;
  handleDefaultCard: (paymentMethodId: string) => void;
  deleteCard: (paymentMethodId: string) => void;
}

const CreditCardListItem: React.FC<CreditCardListItemProps> = ({ card, handleDefaultCard, deleteCard }) => {
  const theme = useTheme();
  return (
    <Box sx={{
      position: 'relative',
      padding: theme.spacing(3),
      border: `solid 1px ${theme.palette.grey[500]}`,
      borderRadius: theme.spacing(1),
      mx: { xs: 0, md: 3 }
    }}>
      <Grid container>
        <Grid item xs={6} md={6} >
          <Typography variant="h6" color="text.secondary" mt={1}>
            {'**** **** **** ' + card.cardLast4}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {card.nameInCard}
          </Typography>
        </Grid>
        <Grid item xs={6} md={6} sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Box
            component="img"
            alt={card.cardBrand}
            src={renderIcon(card.cardBrand as cardBrandType)}
            sx={{ mb: 1 }}
            height={40}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <div>
          {card.isDefault !== undefined ? <Button
            disabled={card.isDefault}
            size="small"
            onClick={() => {
              mixtrack(
                'SetCardAsDefault',
                { visit: window.location.toString() },
              );
              handleDefaultCard(card.id);
            }}
          >
            {card.isDefault
              ? 'Default'
              : 'Seleccionar como default'}
          </Button> : null}
        </div>
        <div>
          <Button
            color="error"
            size="small"
            onClick={() => {
              mixtrack(
                'StripeDeleteCard',
                { visit: window.location.toString() },
              );
              deleteCard(card.id);
            }}
          >
            Eliminar
          </Button>
        </div>
      </Box>
    </Box>);
}

export default CreditCardListItem;