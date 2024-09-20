import { useState } from "react";
import { SaasPluginType } from "../../domain/account/Business";
import {
  buildInitialPluginState,
  serializePluginState,
} from "../../utils/plugins";
import { Box } from "@mui/material";
import {
  PluginDateFilter,
  PluginNumberFilter,
  PluginNumberOptsFilter,
  PluginStringFilter,
  PluginStringOptsFilter,
} from "./PluginFilters";
import MetabaseIFrame from "./MetabaseIFrame";
import { delay } from "../../utils/helpers";
import LoadingProgress from "../LoadingProgress";

// ----------------------------------------------------------------------
type MetabasePluginStateType = {
  [key: string]: {
    label: string;
    param_type: string;
    value: any;
    options?: { key: string | number; label: string }[];
  };
};

type MetabasePluginFilterProps = {
  state: MetabasePluginStateType;
  setStateFn: (v: MetabasePluginStateType) => void;
};

// ----------------------------------------------------------------------

const MetabasePluginFilters: React.FC<MetabasePluginFilterProps> = ({
  state,
  setStateFn,
}) => {
  const handleChangeInState = (key: string, value: any) => {
    setStateFn({
      ...state,
      [key]: {
        ...state[key],
        value,
      },
    });
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "left" }}>
      {Object.entries(state).map(([key, value]) => {
        return (
          <Box key={key}>
            {value.param_type === "date" ? (
              <PluginDateFilter
                label={value.label}
                filterValue={value.value}
                handleChange={(v: Date) => handleChangeInState(key, v)}
              />
            ) : null}
            {value.param_type === "string" ? (
              <PluginStringFilter
                label={value.label}
                filterValue={value.value}
                handleChange={(v: string) => handleChangeInState(key, v)}
              />
            ) : null}
            {value.param_type === "number" ? (
              <PluginNumberFilter
                label={value.label}
                filterValue={value.value}
                handleChange={(v: string) => handleChangeInState(key, v)}
              />
            ) : null}
            {value.param_type === "string[]" ? (
              <PluginStringOptsFilter
                label={value.label}
                filterValue={value.value}
                filterOptions={
                  value.options?.map((option) => ({
                    key: String(option.key),
                    label: option.label,
                  })) || []
                }
                handleChange={(v: string) => handleChangeInState(key, v)}
              />
            ) : null}
            {value.param_type === "number[]" ? (
              <PluginNumberOptsFilter
                label={value.label}
                filterValue={value.value}
                filterOptions={
                  value.options?.map((option) => ({
                    key: Number(option.key),
                    label: option.label,
                  })) || []
                }
                handleChange={(v: number) => handleChangeInState(key, v)}
              />
            ) : null}
          </Box>
        );
      })}
    </Box>
  );
};

export const MetabasePlugin: React.FC<{
  plugin: SaasPluginType;
  businessId: string;
}> = ({ plugin, businessId }) => {
  // create initial state
  const [mbState, setMbState] = useState<MetabasePluginStateType>(
    buildInitialPluginState(plugin.plugin_params || [])
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const wrapperSetStateFn = async (v: MetabasePluginStateType) => {
    setIsLoading(true);
    setMbState(v);
    await delay(500);
    setIsLoading(false);
  };

  return (
    <>
      <MetabasePluginFilters state={mbState} setStateFn={wrapperSetStateFn} />
      {isLoading ? <LoadingProgress sx={{ my: 4 }} /> : null}
      {!isLoading ? (
        <Box sx={{ mt: 2 }}>
          <MetabaseIFrame
            dashboardId={Number(plugin.plugin_provider_ref)}
            dashboardParams={{
              ...serializePluginState(mbState),
              supplier_business: businessId,
            }}
            title={plugin.plugin_name}
            height={660}
            waitPeriod={{
              var: 1000,
              min: 300,
            }}
          />
        </Box>
      ) : null}
    </>
  );
};
