import { Box, useTheme } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import * as jose from "jose";
import { alimaApiConfig } from "../../config";
import LoadingProgress from "../LoadingProgress";

// ----------------------------------------------------

const METABASE_SITE_URL = "https://lytics.prd.alima.la";

// ----------------------------------------------------

type MetabaseIFrameProps = {
  dashboardId: number;
  dashboardParams: any;
  title: string;
  height: string | number;
  sx?: any;
  waitPeriod?: {var: number, min: number;}
};

const MetabaseIFrame: React.FC<MetabaseIFrameProps> = ({
  dashboardId,
  dashboardParams,
  title,
  height,
  sx,
  waitPeriod = {
    var: 3000,
    min: 4000,
  },
}) => {
  const theme = useTheme();
  const jwtLoaded = useRef(false);
  const [iframeUrl, setIframeUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // create a random value between 2 and 4 seconds
    const randomTimeout = Math.floor(Math.random() * waitPeriod.var) + waitPeriod.min;
    // create timeout to remove loading after 3 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, randomTimeout);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (jwtLoaded.current) {
      return;
    }
    const payload = {
      resource: { dashboard: dashboardId },
      params: dashboardParams,
      exp: Math.round(Date.now() / 1000) + (24 * 60 * 60), // 24 hr expiration
    };
    const secret = new TextEncoder().encode(alimaApiConfig.embedSecret);
    const alg = "HS256";

    const signJWT = async () => {
      const token = await new jose.SignJWT(payload)
        .setProtectedHeader({ alg })
        .sign(secret);
      setIframeUrl(
        `${METABASE_SITE_URL}/embed/dashboard/${token}#bordered=false&titled=false`
      );
    };
    signJWT();
    jwtLoaded.current = true;
  }, [dashboardId, dashboardParams]);

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      {loading && (
        <Box
          sx={{
            mt: typeof height === "number" ? height / 24 : 24,
            justifyContent: "center",
          }}
        >
          <LoadingProgress />
        </Box>
      )}
      <iframe
        src={iframeUrl}
        title={title}
        width="100%"
        height={height}
        style={{
          visibility: loading ? "hidden" : "visible",
          border: "0px none transparent",
          borderRadius: theme.shape.borderRadius,
          ...sx,
        }}
      ></iframe>
    </Box>
  );
};

export default MetabaseIFrame;
