// ----------------------------------------------------------------------

function buildpath(root: string, sublink: string) {
  return `${root}/${sublink}`;
}

const ROOTS_AUTH = "/auth";
const ROOTS_APP = "/app";
// const ROOTS_EXT = '/ext';

// ----------------------------------------------------------------------

export const PATH_AUTH = {
  root: ROOTS_AUTH,
  login: buildpath(ROOTS_AUTH, "login"),
  register: buildpath(ROOTS_AUTH, "register"),
  resetPassword: buildpath(ROOTS_AUTH, "reset-password"),
};

export const PATH_APP = {
  root: ROOTS_APP,
  profile: buildpath(ROOTS_APP, "profile"),
  accountDeleted: buildpath(ROOTS_APP, "account-deleted"),
  notAllowed: buildpath(ROOTS_APP, "not-allowed"),
  alimaAccount: buildpath(ROOTS_APP, "alima-billing"),
  account: {
    root: buildpath(ROOTS_APP, "account/business"),
    legal: buildpath(ROOTS_APP, "account/business#legal"),
    onboarding: buildpath(ROOTS_APP, "onboarding"),
    team: {
      list: buildpath(ROOTS_APP, "account/team"),
      add: buildpath(ROOTS_APP, "account/team/add"),
      edit: buildpath(ROOTS_APP, "account/team/edit/:userId"),
    },
    unit: {
      root: buildpath(ROOTS_APP, "account/unit"),
      add: buildpath(ROOTS_APP, "account/unit/add"),
      edit: buildpath(ROOTS_APP, "account/unit/edit/:unitId"),
    },
  },
  catalog: {
    root: buildpath(ROOTS_APP, "catalog"),
    list: buildpath(ROOTS_APP, "catalog/list"),
    listProducts: buildpath(ROOTS_APP, "catalog/list#products"),
    listPrices: buildpath(ROOTS_APP, "catalog/list#prices"),
    listStock: buildpath(ROOTS_APP, "catalog/list#stock"),
    product: {
      add: buildpath(ROOTS_APP, "catalog/product/add"),
      upload: buildpath(ROOTS_APP, "catalog/product/upload-file"),
      edit: buildpath(ROOTS_APP, "catalog/product/edit/:productId"),
    },
    price: {
      listDetails: buildpath(
        ROOTS_APP,
        "catalog/price/list-details/:priceListId"
      ),
      addList: buildpath(ROOTS_APP, "catalog/price/add-list"),
      upload: buildpath(ROOTS_APP, "catalog/price/upload-file"),
      editUpload: buildpath(
        ROOTS_APP,
        "catalog/price/edit-upload-file/:priceListId"
      ),
      editList: buildpath(ROOTS_APP, "catalog/price/edit-list/:priceListId"),
    },
    stock: {
      upload: buildpath(ROOTS_APP, "catalog/stock/upload-file"),
      addStock: buildpath(ROOTS_APP, "catalog/stock/add-stock"),
    }
  },
  orden: {
    root: buildpath(ROOTS_APP, "orden"),
    list: buildpath(ROOTS_APP, "orden/list"),
    add: buildpath(ROOTS_APP, "orden/add"),
    details: buildpath(ROOTS_APP, "orden/details/:ordenId"),
    edit: buildpath(ROOTS_APP, "orden/edit/:ordenId"),
  },
  invoice: {
    root: buildpath(ROOTS_APP, 'invoice'),
    list: buildpath(ROOTS_APP, 'invoice/list'),
    add: buildpath(ROOTS_APP, 'invoice/add'),
    reInvoice: buildpath(ROOTS_APP, 'invoice/reInvoice/:ordenId'),
  },
  payment: {
    root: buildpath(ROOTS_APP, "payment"),
    list: buildpath(ROOTS_APP, "payment/list"),
    add: buildpath(ROOTS_APP, "payment/add"),
  },
  report: {
    root: buildpath(ROOTS_APP, "report"),
    list: buildpath(ROOTS_APP, "report/list"),
    custom: buildpath(ROOTS_APP, "report/custom/list"),
    details: buildpath(ROOTS_APP, "report/custom/details/:pluginSlug"),
  },
  client: {
    root: buildpath(ROOTS_APP, "client"),
    list: buildpath(ROOTS_APP, "client/list"),
    add: {
      form: buildpath(ROOTS_APP, "client/add"),
      file: buildpath(ROOTS_APP, "client/add/file"),
    },
    details: buildpath(ROOTS_APP, "client/details/:clientId"),
    edit: buildpath(ROOTS_APP, "client/edit/:clientId"),
  },
  ecommerce: {
    root: buildpath(ROOTS_APP, "ecommerce"),
    list: buildpath(ROOTS_APP, "ecommerce/list"),
    listMetrics: buildpath(ROOTS_APP, "ecommerce/list#metrics"),
    listCustom: buildpath(ROOTS_APP, "ecommerce/list#custom"),
  },
};

export const PATHS_EXTERNAL = {
  supportAlimaWA:
    "https://api.whatsapp.com/send/?phone=%2B527751084135&type=phone_number&app_absent=0&text",
  landingSuppliers: "https://landing.alima.la/proveedores",
  termsAndConditions:
    "https://docs.google.com/document/d/1IBhnKeVO-sOztk5LXmj5jtp_sNT5HS5XbN-jP_fsoSI/preview",
  privacyPolicy:
    "https://docs.google.com/document/d/1F1imFPJfvnMVMvCMXkLrtfVJIsEV83HRIuIzVISz8G0/preview",
  restaurantApp: "https://app.alima.la",
  whatsAppAutomationCTA: "https://forms.gle/DenaTgEE73LKQ1JV6",
  requestReport:
    "https://api.whatsapp.com/send/?phone=%2B527751084135&type=phone_number&app_absent=0&text=Hola%2C+soy+usuario+de+Alima+Supply+y+quiero+más+información+de+los+Reportes+Personalizados",
};

// ----------------------------------------------------------------------

// List of paths that show Back nav button
export const pathsWithBack = [
  // app
  PATH_APP.alimaAccount,
  PATH_APP.notAllowed,
  // catalog
  PATH_APP.catalog.product.add,
  PATH_APP.catalog.product.upload,
  PATH_APP.catalog.price.upload,
  PATH_APP.catalog.price.editUpload,
  PATH_APP.catalog.stock.upload,
  // account
  PATH_APP.account.root,
  PATH_APP.account.team.list,
  PATH_APP.account.team.add,
  PATH_APP.account.team.edit,
  PATH_APP.account.legal,
  // all account branch routes
  PATH_APP.account.unit.root,
  PATH_APP.account.unit.add,
  PATH_APP.account.unit.edit,
  // order
  // PATH_APP.orden.details,
  // client routes
  PATH_APP.client.add.file,
  PATH_APP.client.add.form,
  PATH_APP.client.details,
  PATH_APP.client.edit,
];

// List of paths that do not show Unit Selector
export const pathsWithoutUnitSelector = [
  PATH_APP.root,
  PATH_APP.profile,
  PATH_APP.accountDeleted,
  PATH_APP.notAllowed,
  PATH_APP.alimaAccount,
  // catalog
  PATH_APP.catalog.root,
  PATH_APP.catalog.product.add,
  PATH_APP.catalog.product.upload,
  PATH_APP.catalog.price.upload,
  PATH_APP.catalog.price.editUpload,
  PATH_APP.catalog.list,
  PATH_APP.catalog.price.addList,
  PATH_APP.catalog.stock.upload,
  // all account branch routes
  PATH_APP.account.root,
  PATH_APP.account.onboarding,
  PATH_APP.account.team.list,
  PATH_APP.account.team.add,
  PATH_APP.account.team.edit,
  PATH_APP.account.legal,
  PATH_APP.account.unit.root,
  PATH_APP.account.unit.add,
  // client routes
  PATH_APP.client.list,
  PATH_APP.client.edit,
  // reportes
  PATH_APP.report.list,
  PATH_APP.report.custom,
  // ecommerce
  PATH_APP.ecommerce.root,
  PATH_APP.ecommerce.list,
  PATH_APP.ecommerce.listMetrics,
  PATH_APP.ecommerce.listCustom,
];
