import { useEffect, useRef, useState } from 'react';
import { Box, styled } from '@mui/material';
// stripe
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
// hooks
import { useAppDispatch, useAppSelector } from '../../redux/store';
// components
import LoadingProgress from '../LoadingProgress';
import StripeCardSetupForm from './StripeCardSetupForm';
// domain
import { AlimaPaymentMethodsType } from '../../domain/account/Business';
import { stripeConfig } from '../../config';
import useAuth from '../../hooks/useAuth';
import { getStripeSetupIntent } from '../../redux/slices/account';

// ----------------------------------------------------------------------

const StyledCardBox = styled(Box)(({ theme }) => ({
    cardBox: {
        maxWidth: '90%',
        marginTop: theme.spacing(5),
        [theme.breakpoints.up('md')]: {
            maxWidth: '60%'
        }
    }
}));

// ----------------------------------------------------------------------
// Stripe
const stripePromise = loadStripe(stripeConfig.publicKey);

// ----------------------------------------------------------------------

type StripeSaveCardProps = {
    paymentMethods: AlimaPaymentMethodsType[],
    onSave: () => void;
    handleChangePaymentMethod: (paymentMethodId: string) => void;
}

const StripeSaveCard: React.FC<StripeSaveCardProps> = ({ paymentMethods, onSave, handleChangePaymentMethod }) => {
    const dispatch = useAppDispatch();
    const fetchedSecret = useRef(false);
    const { sessionToken, user: userApp } = useAuth()
    const [clientSecret, setClientSecret] = useState(null);
    const { stripeSetupIntent } = useAppSelector((state) => state.account);


    // onMount - fetch client secret
    useEffect(() => {
        if (!sessionToken) return;
        if (fetchedSecret.current) return;
        const pm = paymentMethods[0];
        // fetch client secret
        dispatch(getStripeSetupIntent(sessionToken, pm.paymentProviderId));
        fetchedSecret.current = true;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paymentMethods, sessionToken]);

    // when response of client secret is received
    useEffect(() => {
        setClientSecret(stripeSetupIntent.clientSecret);
    }, [stripeSetupIntent]);

    if (!clientSecret) {
        return <LoadingProgress sx={{ my: 5 }} />
    }

    if (!userApp) {
        return (<div style={{ display: 'flex', justifyContent: 'center' }}>
            <p>Ha ocurrido un error en tu usuario, por favor recarga la página.</p>
        </div>);
    }

    return (
        <div style={{ display: "flex", justifyContent: 'center' }}>
            <div style={{ display: "flex", justifyContent: 'center' }}>
                <StyledCardBox>
                    <Elements stripe={stripePromise} options={{ locale: 'es' }}>
                        <StripeCardSetupForm
                            onCardAdded={onSave}
                            clientSecret={clientSecret}
                            clientEmail={userApp.email}
                            handleChangePaymentMethod={handleChangePaymentMethod}
                        />
                    </Elements>
                </StyledCardBox>
            </div>
        </div>
    );
}

export default StripeSaveCard;
