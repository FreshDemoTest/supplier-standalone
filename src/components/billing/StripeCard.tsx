/**
* Use the CSS tab above to style your Element's container.
*/
import { CardElement } from '@stripe/react-stripe-js';


const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            color: "#32325d",
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: "antialiased",
            fontSize: "16px",
            "::placeholder": {
                color: "#aab7c4",
            },
        },
        invalid: {
            color: "#fa755a",
            iconColor: "#fa755a",
        },
    },
};
function StripeCard() {
    return (
        <label>
            <CardElement options={CARD_ELEMENT_OPTIONS} />
        </label>
    );
};
export default StripeCard;