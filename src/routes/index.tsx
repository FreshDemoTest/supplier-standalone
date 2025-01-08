import React, { Suspense, lazy } from "react";
import { Navigate, Route, RouteProps, Routes } from "react-router-dom";
// layouts
// import MainLayout from '../layouts/main';
import DashboardLayout from "../layouts/dashboard";
// import LogoOnlyLayout from '../layouts/LogoOnlyLayout';
// guards
import GuestGuard from "../guards/GuestGuard";
import AuthGuard from "../guards/AuthGuard";
// components
import LoadingScreen from "../components/LoadingScreen";
import { PATH_APP, PATH_AUTH } from "./paths";

// ----------------------------------------------------------------------
type IterativeRouteProps = {
  route: RouteProps;
  layout?: JSX.Element;
  subpaths?: Array<RouteProps>;
};

type RouterProps = {
  routes: Array<IterativeRouteProps>;
};

const Router: React.FC<RouterProps> = ({ routes }) => {
  const routeBuilder = () => {
    const builtRs = [];
    for (const k in routes) {
      const rout = routes[k];
      const layRoutes = [];
      if (rout.layout === undefined) {
        // if nno layout - set route alone
        builtRs.push(<Route key={rout.route.path} {...rout.route} />);
      } else {
        layRoutes.push(<Route key={"l-" + rout.route.path} {...rout.route} />);
      }
      if (rout.subpaths !== undefined) {
        for (const s in rout.subpaths) {
          const srout = rout.subpaths[s];
          const newpath = [rout.route.path || "", srout.path].join("/");
          if (rout.layout === undefined) {
            // if no layout - set route alone
            builtRs.push(<Route key={newpath} {...srout} path={newpath} />);
          } else {
            layRoutes.push(<Route key={newpath} {...srout} path={newpath} />);
          }
        }
      }
      // if layout add it on top of the route tree
      if (layRoutes.length > 0) {
        builtRs.push(
          <Route key={rout.route.path} element={rout.layout}>
            {layRoutes.map((lr) => lr)}
          </Route>
        );
      }
    }
    return builtRs;
  };

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>{routeBuilder().map((rout) => rout)}</Routes>
    </Suspense>
  );
};

// IMPORT COMPONENTS
// Init Screen
// const InitScreen = lazy(() => import('../pages/InitScreen'));

// App
const Home = lazy(() => import("../pages/Home"));
const Onboarding = lazy(() => import("../pages/Onboarding"));
const AlimaAccount = lazy(() => import("../pages/account/AlimaAccount"));
const NotAllowed = lazy(() => import("../pages/NotAllowed"));
const AccountDeleted = lazy(() => import("../pages/AccountDeleted"));
const BusinessAccount = lazy(() => import("../pages/account/BusinessAccount"));
const Personel = lazy(
  () => import("../pages/account/BusinessAccount/Personel")
);
const SUnit = lazy(() => import("../pages/account/SUnit"));
const ListClients = lazy(() => import("../pages/client/ListClients"));
const Client = lazy(() => import("../pages/client/Client"));
const ClientDetails = lazy(() => import("../pages/client/Details"));
const SupplierProduct = lazy(() => import("../pages/supplier/SupplierProduct"));
const SupplierPriceList = lazy(
  () => import("../pages/supplier/SupplierPriceList")
);
const SupplierProductStock = lazy(
  () => import("../pages/supplier/SupplierProductStock")
);
const ListSupplierProducts = lazy(
  () => import("../pages/supplier/ListSupplierProductPrices")
);
const ListOrdenes = lazy(() => import("../pages/orden/ListOrdenes"));
const ListInvoices = lazy(() => import("../pages/invoice/ListInvoices"));
const AddInvoice = lazy(() => import("../pages/invoice/AddInvoice"));
// const ReInvoice = lazy(() => import("../pages/invoice/ReInvoice"));
const ListPayments = lazy(() => import("../pages/payment/ListPayments"));
const AddPayment = lazy(() => import("../pages/payment/AddPayment"));
const ListReports = lazy(() => import("../pages/report/ListReports"));
const Orden = lazy(() => import("../pages/orden/Orden"));
const AddOrden = lazy(() => import("../pages/orden/AddOrden"));
const EditOrden = lazy(() => import("../pages/orden/EditOrden"));
const Report = lazy(() => import("../pages/report/Report"));
const ListEcommerce = lazy(() => import("../pages/ecommerce/ListMetrics"));

// External
const SupplierPurchaseOrden = lazy(
  () => import("../pages/external/SupplierPurchaseOrden")
);

// Authentication
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));
// const UserProfile = lazy(() => import('../pages/account/UserProfile'));

const appRoutes = [
  // Auth
  {
    route: {
      path: "auth",
      element: <Navigate to={PATH_AUTH.login} replace />,
    },
    subpaths: [
      {
        path: "login",
        element: (
          <GuestGuard>
            <Login />
          </GuestGuard>
        ),
      },
      {
        path: "register",
        element: (
          <GuestGuard>
            <Register />
          </GuestGuard>
        ),
      },
      { path: "reset-password", element: <ResetPassword /> },
    ],
  },
  // ----------------------------------------------------------------------
  // Home Routes
  // {
  //   route: {
  //     path: '/',
  //     element: <InitScreen />
  //   }
  // },
  // ----------------------------------------------------------------------
  // App Onboarding Routes
  {
    route: {
      path: "app/onboarding",
      element: (
        <AuthGuard>
          <Onboarding />
        </AuthGuard>
      ),
    },
  },
  /// App Home Routes
  {
    layout: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    route: {
      path: "app",
      element: <Home />,
    },
    subpaths: [
      // Account
      {
        path: "account/business",
        element: <BusinessAccount />,
      },
      // // Profle
      // {
      //   path: 'profile',
      //   element: <UserProfile />
      // },
      // Account Deleted
      {
        path: "account-deleted",
        element: <AccountDeleted />,
      },
      // Profle
      {
        path: "not-allowed",
        element: <NotAllowed />,
      },
    ],
  },
  // App Account Team
  {
    layout: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    route: {
      path: "app/account/team",
      element: <Navigate to={PATH_APP.account.root + `#personal`} />,
    },
    subpaths: [
      // Account Team
      {
        path: "add",
        element: <Personel viewMode="add" />,
      },
      {
        path: "edit/:userId",
        element: <Personel viewMode="edit" />,
      },
    ],
  },
  // Alima Account
  {
    layout: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    route: {
      path: "app/alima-billing",
      element: <AlimaAccount />,
    },
  },
  // App Account Supplier Unit
  {
    layout: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    route: {
      path: "app/account/unit",
      element: <Navigate to={PATH_APP.account.unit.add} replace />,
    },
    subpaths: [
      // Account Supplier Unit
      {
        path: "add",
        element: <SUnit viewMode="add" />,
      },
      {
        path: "edit/:unitId",
        element: <SUnit viewMode="edit" />,
      },
    ],
  },
  // App Account Supplier Catalog
  {
    layout: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    route: {
      path: "app/catalog",
      element: <Navigate to={PATH_APP.catalog.list} replace />,
    },
    subpaths: [
      // product catalog & price lists
      {
        path: "list",
        element: <ListSupplierProducts viewMode="products" />,
      },
      // Account Supplier product
      {
        path: "product/upload-file",
        element: <SupplierProduct viewMode="upload" />,
      },
      {
        path: "product/add",
        element: <SupplierProduct viewMode="add" />,
      },
      {
        path: "product/edit/:productId",
        element: <SupplierProduct viewMode="edit" />,
      },
      // Account Supplier price list
      {
        path: "price/upload-file",
        element: <SupplierPriceList viewMode="upload" />,
      },
      {
        path: "price/add-list",
        element: <SupplierPriceList viewMode="add" />,
      },
      {
        path: "price/edit-list/:priceListId",
        element: <SupplierPriceList viewMode="edit" />,
      },
      {
        path: "price/edit-upload-file/:priceListId",
        element: <SupplierPriceList viewMode="editUpload" />,
      },
      {
        path: "price/list-details/:priceListId",
        element: <SupplierPriceList viewMode="details" />,
      },
      {
        path: "stock/upload-file",
        element: <SupplierProductStock viewMode="upload" />,
      },
      {
        path: "stock/add-stock",
        element: <SupplierProductStock viewMode="add" />,
      }
    ],
  },
  // App Orden
  {
    layout: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    route: {
      path: "app/orden",
      element: <Navigate to={PATH_APP.orden.list} replace />,
    },
    subpaths: [
      // Pedidos
      {
        path: "list",
        element: <ListOrdenes viewMode="ordenes" />,
      },
      {
        path: "add",
        element: <AddOrden viewMode="orden"/>,
      },
      {
        path: "edit/:ordenId",
        element: <EditOrden viewMode="orden"/>,
      },
      {
        path: "details/:ordenId",
        element: <Orden viewMode="orden" />,
      },
    ],
  },
  // App Invoice
  {
    layout: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    route: {
      path: "app/invoice",
      element: <Navigate to={PATH_APP.invoice.list} replace />,
    },
    subpaths: [
      // Facturas
      {
        path: "list",
        element: <ListInvoices />,
      },
      {
        path: "add",
        element: <AddInvoice />,
      },
      {
        path: "reInvoice/:ordenId",
        element: <EditOrden viewMode="reInvoice"/>,
      },
    ],
  },
  // App Payments
  {
    layout: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    route: {
      path: "app/payment",
      element: <Navigate to={PATH_APP.payment.list} replace />,
    },
    subpaths: [
      // Pagos
      {
        path: "list",
        element: <ListPayments />,
      },
      {
        path: "add",
        element: <AddPayment />,
      },
    ],
  },
  // App Reports
  {
    layout: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    route: {
      path: "app/report",
      element: <Navigate to={PATH_APP.report.list} replace />,
    },
    subpaths: [
      // Reportes
      {
        path: "list",
        element: <ListReports viewMode="general" />,
      },
      {
        path: "custom/list",
        element: <ListReports viewMode="custom" />,
      },
      {
        path: "custom/details/:pluginSlug",
        element: <Report />,
      },
    ],
  },
  // ecommerce
  {
    layout: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    route: {
      path: "app/ecommerce",
      element: <Navigate to={PATH_APP.ecommerce.list} replace />,
    },
    subpaths: [
      // Reportes
      {
        path: "list",
        element: <ListEcommerce viewMode="metrics"/>,
      },
    ],
  },
  // App Client
  {
    layout: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    route: {
      path: "app/client",
      element: <Navigate to={PATH_APP.client.list} replace />,
    },
    subpaths: [
      // Clients
      {
        path: "list",
        element: <ListClients viewMode="active" />,
      },
      {
        path: "add",
        element: <Client viewMode="add" />,
      },
      {
        path: "edit/:clientId",
        element: <Client viewMode="edit" />,
      },
      {
        path: "details/:clientId",
        element: <ClientDetails/>,
      },
      
    ],
  },
  // External Temporal Links
  {
    route: {
      path: 'ext',
      element: <Navigate to={PATH_AUTH.login} replace />
    },
    subpaths: [
      // Link para ver Orden de Compra
      {
        path: 'supplier/purchase-order',
        element: <SupplierPurchaseOrden />
      },
      // Link para Marketplace landing
      // {
      //   path: 'marketplace',
      //   element: <MarketplaceLanding />
      // }
    ]
  },
  // ----------------------------------------------------------------------
  // Redirect Routes
  {
    route: {
      path: "*",
      element: <Navigate to={PATH_APP.root} replace />,
    },
  },
  // ----------------------------------------------------------------------
];

export { appRoutes };
export default Router;
