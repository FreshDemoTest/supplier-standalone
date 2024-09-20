import { SaasPluginParamType } from "../domain/account/Business";
import { fISODate, inXTime } from "./helpers";

const parseDatePluginParam = (param: SaasPluginParamType) => {
  let defDays;
  try {
    if (!param.default_value) return inXTime(0);
    defDays = parseInt(param.default_value);
  } catch (error) {
    defDays = 0;
  }
  return inXTime(defDays);
};

const parseStringArrayPluginParam = (param: SaasPluginParamType) => {
  const df = param.options?.find((opt) => opt.key === param.default_value);
  if (!df) return param.options?.[0]?.key;
  return df.key;
};

const parseNumberArrayPluginParam = (param: SaasPluginParamType) => {
  try {
    const df = param.options?.find(
      (opt) => opt.key.toString() === param.default_value || "0"
    );
    if (!df) return Number(param.options?.[0]?.key);
    return Number(df.key);
  } catch (error) {
    return Number(param.options?.[0]?.key);
  }
};

/**
 * Build initial plugin state
 * @param pluginParams
 * @returns
 */
export const buildInitialPluginState = (
  pluginParams: SaasPluginParamType[]
) => {
  const _state: {
    [key: string]: {
      label: string;
      param_type: string;
      value: any;
      options?: Array<{ key: string | number; label: string }>;
    };
  } = {};
  for (const plParam of pluginParams) {
    let _param;
    let _options = undefined;
    if (plParam.param_type === "date") {
      _param = parseDatePluginParam(plParam);
    } else if (plParam.param_type === "string") {
      _param = plParam.default_value || "";
    } else if (plParam.param_type === "number") {
      _param = parseFloat(plParam.default_value || "0");
    } else if (plParam.param_type === "string[]") {
      _param = parseStringArrayPluginParam(plParam);
      _options = plParam.options;
    } else if (plParam.param_type === "number[]") {
      _param = parseNumberArrayPluginParam(plParam);
      _options = plParam.options;
    } else {
      // skip
      continue;
    }
    _state[plParam.param_key] = {
      label: plParam.param_name,
      param_type: plParam.param_type,
      value: _param,
      options: _options,
    };
  }
  return _state;
};

export const serializePluginState = (
    currState: {
        [key: string]: {
          label: string;
          param_type: string;
          value: any;
          options?: Array<{ key: string | number; label: string }>;
        };
      },
) => {
    const entries = Object.entries(currState);
    const mappedVs = entries.map(([key, v]) => {
        let _value = v.value;
        if (v.param_type === "date") {
            _value = fISODate(_value);
        }
        return [key, _value];
    });
    return Object.fromEntries(mappedVs);
}