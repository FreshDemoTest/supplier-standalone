import { SyntheticEvent, useEffect, useState } from 'react';
// material
import {
  Box,
  Container,
  Grid,
  Step,
  StepLabel,
  Stepper,
  styled,
  useTheme
} from '@mui/material';
// hooks
import useAuth from '../../../hooks/useAuth';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
// redux
import { getOrdenDetails, setNewOrden, setNewOrdenClient } from '../../../redux/slices/orden';
import { getUnits, setActiveUnitSuccess } from '../../../redux/slices/account';
// styles
import { STab, StyledTabs } from '../../../styles/navtabs/NavTabs';
// components
import Page from '../../../components/Page';
import OrdenDeliveryView from '../AddOrden/OrdenDelivery';
import OrdenPickupView from '../AddOrden/OrdenPickup';
import LoadingProgress from '../../../components/LoadingProgress';
// domain
import { UnitType } from '../../../domain/account/SUnit';
// utils
import { mixtrack } from '../../../utils/analytics';
import { delay } from '../../../utils/helpers';
import { clearClientToOrden } from '../../../redux/slices/client';

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex'
  }
}));

// ----------------------------------------------------------------------

export const NEW_ORDEN_STEPS = [
  'Escoge tus productos',
  'Selecciona detalles de pedido',
  'Define método de pago'
];

// ----------------------------------------------------------------------

type EditOrdenProps = {
  viewMode: 'orden' | 'reInvoice';
};


const EditOrden: React.FC<EditOrdenProps> = ({viewMode}) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { sessionToken } = useAuth();
  const { ordenId } = useParams<{
    ordenId: string;
  }>();
  const { hash } = useLocation();
  const navigate = useNavigate();
  const [clientId, setClientId] = useState('');
  const [activeTab, setActiveTab] = useState<'pickup' | 'delivery'>('delivery');
  const { newOrdenCurrentStep, newOrden, ordenDetails, isLoading } =
    useAppSelector((state) => state.orden);
  const { business, units } = useAppSelector((state) => state.account);

  useEffect(() => {
    return () => {
      dispatch(setNewOrdenClient({}));
      dispatch(clearClientToOrden());
    };
  }, [dispatch]);

  // fetch orden details
  useEffect(() => {
    if (ordenId && ordenId !== 'null' && sessionToken) {
      dispatch(getOrdenDetails(ordenId, sessionToken));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, ordenId, sessionToken]);

  // fetch units
  useEffect(() => {
    if (units.length === 0 && business?.id && sessionToken) {
      dispatch(getUnits(business, sessionToken));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, units, business, sessionToken]);

  // on fetch orden details - update newOrden
  useEffect(() => {
    if (ordenDetails.id && units.length > 0) {
      dispatch(
        setNewOrden({
          ...ordenDetails,
          cart: {
            ...ordenDetails.cart,
            cartProducts:
              ordenDetails.cart.cartProducts?.map((product: any) => ({
                ...product,
                quantity:
                  product.quantity / (product.supplierProduct.unitMultiple || 1)
              })) || []
          },
          deliveryAddress: ordenDetails.restaurantBranch.fullAddress
        })
      );
      setClientId(ordenDetails.restaurantBranch.id);
      // set active Unit
      const selUnit = units.find(
        (unit: UnitType) => unit.id === ordenDetails.supplierUnitId
      );
      dispatch(setActiveUnitSuccess(selUnit));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, ordenDetails, units]);

  // tab handlers
  const changeTab = (newValue: string) => {
    setActiveTab(newValue === 'delivery' ? 'delivery' : 'pickup');
  };

  const handleChange = async (event: SyntheticEvent, newValue: string) => {
    const ordenCpy = { ...newOrden };
    navigate(`#${newValue}`);
    mixtrack('orden_type_tab_change', {
      visit: window.location.toString(),
      page: 'EditOrden',
      section: 'OrdenTypeNavTabs',
      tab: newValue
    });
    // wait 1 second and reassign
    await delay(500);
    dispatch(setNewOrden(ordenCpy));
  };

  useEffect(() => {
    if (hash) {
      if (hash === '#delivery') {
        changeTab('delivery');
      } else {
        changeTab('pickup');
      }
    }
  }, [hash]);

  return (
    <>
      {isLoading && <LoadingProgress />}
      {!isLoading && (
        <RootStyle title={'Editar Pedido | Alima'}>
          <Container>
            <Grid
              container
              spacing={1}
              justifyContent={'center'}
              alignItems={'center'}
              sx={{ mb: theme.spacing(1), px: theme.spacing(0) }}
            >
              <Grid item xs={12} lg={8}>
                {/* stepper */}
                <Box sx={{ mb: theme.spacing(1) }}>
                  <Stepper activeStep={newOrdenCurrentStep} alternativeLabel>
                    {NEW_ORDEN_STEPS.map((label) => (
                      <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </Box>
                {/* order type tabs */}
                <Box>
                  <StyledTabs
                    value={activeTab}
                    onChange={handleChange}
                    aria-label="info orden type tabs"
                    centered
                  >
                    <STab value="delivery" label="Entrega" />
                    <STab value="pickup" label="En Almacén" />
                  </StyledTabs>
                </Box>
                {isLoading && <LoadingProgress sx={{ mt: 2 }} />}
                {activeTab === 'delivery' && !isLoading && (
                  <OrdenDeliveryView editMode={true} clientId={clientId} viewMode={viewMode}/>
                )}
                {activeTab === 'pickup' && !isLoading && (
                  <OrdenPickupView editMode={true} clientId={clientId} viewMode={viewMode} />
                )}
              </Grid>
            </Grid>
          </Container>
        </RootStyle>
      )}
    </>
  );
};

export default EditOrden;
