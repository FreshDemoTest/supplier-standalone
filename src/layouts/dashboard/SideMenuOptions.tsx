import { Icon } from "@iconify/react";
import listFillIcon from "@iconify/icons-ic/baseline-list-alt";
import homeFillIcon from "@iconify/icons-eva/home-fill";
import peopleFillIcon from "@iconify/icons-ic/people-outline";
import categoryFillIcon from "@iconify/icons-ic/outline-category";
import defaultIcon from "@iconify/icons-eva/checkmark-outline";
import descriptionFillIcon from "@iconify/icons-ic/outline-description";
import quoteFillIcon from "@iconify/icons-ic/outline-request-quote";
import analyticsFillIcon from "@iconify/icons-ic/outline-analytics";
import storeIcon from "@iconify/icons-ic/store";
// routes
import { PATH_APP } from "../../routes/paths";
import { UIVerifiedMenuOptions } from "../../domain/auth/UIVerifications";

// ----------------------------------------------------------------------

const getIcon = (name: string, sz: number = 18) => {
  try {
    const iconMapped = {
      ic_list: <Icon icon={listFillIcon} width={sz} height={sz} />,
      ic_home: <Icon icon={homeFillIcon} width={sz} height={sz} />,
      ic_people: <Icon icon={peopleFillIcon} width={sz} height={sz} />,
      ic_category: <Icon icon={categoryFillIcon} width={sz} height={sz} />,
      ic_invoice: <Icon icon={descriptionFillIcon} width={sz} height={sz} />,
      ic_payment: <Icon icon={quoteFillIcon} width={sz} height={sz} />,
      ic_reports: <Icon icon={analyticsFillIcon} width={sz} height={sz} />,
      ic_ecommerce: <Icon icon={storeIcon} width={sz} height={sz} />,
    }[name];
    if (iconMapped === undefined) throw Error("No Declared Icon");
    return iconMapped;
  } catch (e) {
    return <Icon icon={defaultIcon} />;
  }
};

const sidebarMenuOptions: UIVerifiedMenuOptions = {
  default: [
    // App
    // ----------------------------------------------------------------------
    {
      subheader: "", // App Home
      items: [
        {
          title: "Home",
          path: PATH_APP.root,
          icon: getIcon("ic_home"),
          lgIcon: getIcon("ic_home", 24),
          display: true,
          children: [
            {
              title: "Cuenta: Negocio",
              path: PATH_APP.account.root,
              display: false,
            },
          ],
        },
      ],
    },
    // Clientes
    // ----------------------------------------------------------------------
    {
      subheader: "Clientes",
      items: [
        {
          title: "Clientes",
          path: PATH_APP.client.list,
          icon: getIcon("ic_people"),
          lgIcon: getIcon("ic_people", 24),
          display: true,
        },
      ],
    },
    // Pedidos
    // ----------------------------------------------------------------------
    {
      subheader: "Pedidos",
      items: [
        {
          title: "Catálogo",
          path: PATH_APP.catalog.list + "#products",
          icon: getIcon("ic_category"),
          lgIcon: getIcon("ic_category", 24),
          display: false,
        },
        {
          title: "Pedidos",
          path: PATH_APP.orden.list,
          icon: getIcon("ic_list"),
          lgIcon: getIcon("ic_list", 24),
          display: true,
        },
        {
          title: "Facturas",
          path: PATH_APP.invoice.list,
          icon: getIcon("ic_invoice"),
          lgIcon: getIcon("ic_invoice", 24),
          display: true,
        },
      ],
    },
    // Pagos
    // ----------------------------------------------------------------------
    {
      subheader: "Pagos",
      items: [
        {
          title: "Pagos",
          path: PATH_APP.payment.list,
          icon: getIcon("ic_payment"),
          lgIcon: getIcon("ic_payment", 24),
          display: true,
        },
      ],
    },
    // Reportes
    // ----------------------------------------------------------------------
    {
      subheader: "Reportes",
      items: [
        {
          title: "Reportes",
          path: PATH_APP.report.list,
          icon: getIcon("ic_reports"),
          lgIcon: getIcon("ic_reports", 24),
          display: true,
        },
      ],
    },
    // E-commerce B2B
    // ----------------------------------------------------------------------
    {
      subheader: "E-commerce B2B",
      items: [
        {
          title: "E-commerce B2B",
          path: PATH_APP.ecommerce.list,
          icon: getIcon("ic_ecommerce"),
          lgIcon: getIcon("ic_ecommerce", 24),
          display: true,
        },
      ],
    },
  ],
};

export default sidebarMenuOptions;
