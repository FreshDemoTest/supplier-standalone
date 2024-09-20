export const GET_STRIPE_SETUP_INTENT = `query getStripeSetup($stripeCustId: String!) {
    getSupplierAlimaAccountStripeSetupIntentSecret(stripeCustomerId: $stripeCustId) {
      ... on SupplerAlimaStripeIntentSecret {
        secret
      }
      ... on SupplierAlimaAccountError {
        code
        msg
      }
    }
  }`;

export const DELETE_STRIPE_CARD = `mutation deleteCard($stripeCustId: String!, $stripeCardId: String!) {
  deleteSupplierAlimaStripeCreditCard(
    stripeCardId: $stripeCardId
    stripeCustomerId: $stripeCustId
  ) {
    ... on SupplerAlimaStripeResponse {
      data
      msg
      status
    }
    ... on SupplierAlimaAccountError {
      code
      msg
    }
  }
}`;