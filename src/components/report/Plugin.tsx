import { Typography } from "@mui/material";
import { SaasPluginType } from "../../domain/account/Business";
import { MetabasePlugin } from "./MetabasePlugin";
import { useAppSelector } from "../../redux/store";
import LoadingProgress from "../LoadingProgress";

export const Plugin: React.FC<SaasPluginType> = (plugin) => {
  const { business } = useAppSelector((state) => state.account);

  if (!plugin) return null;
  if (!business.id) return <LoadingProgress sx={{ my: 6 }} />;
  if (plugin.plugin_provider === "alima_metabase") {
    return <MetabasePlugin plugin={plugin} businessId={business?.id || ""} />;
  }
  return (
    <>
      <Typography variant="subtitle2">
        {" "}
        Proveedor de Plugin no está habilitado. Por favor contacta a Soporte.{" "}
      </Typography>
    </>
  );
};
