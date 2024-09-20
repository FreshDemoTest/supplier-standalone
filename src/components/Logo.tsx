// material
import { Box } from "@mui/material";
import React from "react";

// ----------------------------------------------------------------------

type LogoProps = {
  width?: number;
  height?: number;
  paddingTop?: number;
  sx?: any;
  other?: any;
};

const Logo: React.FC<LogoProps> = ({
  width = 40,
  height = 40,
  paddingTop = 1.9,
  sx = {},
  ...other
}) => {
  const bWidth = width;
  const bHeight = height;
  const bPaddingTop = paddingTop;

  return (
    <Box
      sx={{ ...sx, width: bWidth, height: bHeight, paddingTop: bPaddingTop }}
      {...other}
    >
      <svg
        id="AlimaLogo"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 1032.73 301.19"
      >
        <path
          style={{ fill: "#668d50" }}
          d="M487.66,355.51a26.91,26.91,0,0,0-17.52-7.83l-14.45-.08-.2.21V541.52h39.27V373.61A25.25,25.25,0,0,0,487.66,355.51Z"
          transform="translate(-95.42 -245.18)"
        />
        <path
          style={{ fill: "#668d50" }}
          d="M291.56,486.83V348l-.4-.41H252.9l-.61.41v22.26q-24.09-25.69-57.89-25.7-36,0-64.57,23.88-34.41,32.39-34.41,76.92v.2q0,36,23.08,65,31,35.82,75.3,35.82h.2q35.63,0,58.29-24.89s.45,6.43,8.19,13.83c8.7,8.32,30.68,6.21,30.68,6.21l.11-.12h18.87V502.24C295,500.26,292,489.26,291.56,486.83Zm-39.27-41.26q0,26.31-19,45.75Q215,507.1,195.62,507.11h-4.46q-13.77,0-29.14-9.32-27.54-20.43-27.53-52.42,0-20.44,13.15-39.07,19.63-22.46,43.93-22.46h3.24q14.76,0,29.95,9.31,27.53,19.83,27.53,52.22Z"
          transform="translate(-95.42 -245.18)"
        />
        <path
          style={{ fill: "#668d50" }}
          d="M1109.57,486.13V347.31l-.4-.4h-38.26l-.6.4v22.27q-24.09-25.71-57.89-25.71-36,0-64.57,23.89-34.43,32.39-34.41,76.91v.21q0,36,23.07,65,31,35.82,75.3,35.83h.2q35.63,0,58.3-24.9s.45,6.44,8.18,13.83c8.7,8.33,30.68,6.21,30.68,6.21l.11-.12h18.87V501.54C1113,499.57,1110,488.56,1109.57,486.13Zm-39.26-41.25q0,26.31-19,45.74-18.21,15.79-37.65,15.79h-4.45q-13.77,0-29.15-9.31-27.53-20.44-27.53-52.43,0-20.44,13.16-39.06,19.64-22.47,43.92-22.47h3.24q14.77,0,30,9.31,27.53,19.85,27.53,52.22Z"
          transform="translate(-95.42 -245.18)"
        />
        <path
          style={{ fill: "#668d50" }}
          d="M392,486.34h0V245.39l-.21-.21H353.09l-.2.21v271.1a26.38,26.38,0,0,0,7.08,17,26,26,0,0,0,16.5,8l15.28.08.12-.12h18.78V502.24C393.57,500,392,486.34,392,486.34Z"
          transform="translate(-95.42 -245.18)"
        />
        <path
          style={{ fill: "#668d50" }}
          d="M865.11,486.34l-.52-.06V419.06a74,74,0,0,0-7.29-31.18Q835,347.6,781.6,347.6h-6.27q-40.5,0-63.56,23.69-24.09-23.68-63.36-23.69h-1.82a97.56,97.56,0,0,0-21.66,2q-16.8,4.86-27.12,10.52h-.2V349.22l-.61-.6H559.15l-.61.6V540.91l.61.61H597l.61-.61V424.32q0-21.85,13.36-30,10.32-7.69,35-7.69h3.24q18.42,0,29.15,7.69,14,7.89,14,29.55v117l.4.61h38l.41-.61V420.47a32.07,32.07,0,0,1,2.43-12.75q9.3-21,40.89-21.05h7.89q11.54,0,19,2.63,24.28,8.29,24.29,30.16v96.46s-1,7.5,5.94,16.36c6.78,8.66,18.4,9.24,18.4,9.24h14.11l.08-.12h19.51V502.24C866.69,500,865.11,486.34,865.11,486.34Z"
          transform="translate(-95.42 -245.18)"
        />
        <image
          width="242"
          height="190"
          transform="translate(358.66 38.5) scale(0.24)"
          style={{ fill: "#668d50" }}
          xlinkHref="data:image/png;base64,
          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"
        />
      </svg>
    </Box>
  );
};

const LogoAlter: React.FC<LogoProps> = ({
  width = 40,
  height = 40,
  paddingTop = 1.9,
  sx = {},
  ...other
}) => {
  const bWidth = width;
  const bHeight = height;
  const bPaddingTop = paddingTop;

  return (
    <Box
      sx={{ ...sx, width: bWidth, height: bHeight, paddingTop: bPaddingTop }}
      {...other}
    >
      <svg
        id="AlimaLogoWhite"
        viewBox="0 0 412 120"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
      >
        <g clipPath="url(#clip0_1118_5821)">
          <path
            d="M156.276 43.9577C154.412 42.0953 151.927 40.9847 149.296 40.838L143.539 40.8062L143.459 40.8898V118.068H159.105V51.169C159.133 49.8397 158.898 48.518 158.412 47.2802C157.927 46.0424 157.201 44.9131 156.276 43.9577Z"
            fill="white"
          />
          <path
            d="M78.146 96.2781V40.9655L77.9867 40.8021H62.7431L62.5001 40.9655V49.8343C56.1015 43.0107 48.4133 39.5976 39.4356 39.5949C29.8735 39.5949 21.2982 42.7663 13.7096 49.1092C4.56987 57.7124 0 67.9279 0 79.7556V79.8353C0 89.3974 3.06518 98.0298 9.19553 105.733C17.4295 115.247 27.4299 120.004 39.1965 120.004H39.2762C48.74 120.004 56.4813 116.698 62.5001 110.087C62.5001 110.087 62.6794 112.649 65.7631 115.597C69.2294 118.912 77.9867 118.072 77.9867 118.072L78.0305 118.024H85.5487V102.418C79.5166 101.629 78.3213 97.2462 78.146 96.2781ZM62.5001 79.8393C62.5001 86.8276 59.9768 92.9035 54.9301 98.067C50.072 102.258 45.0692 104.355 39.9216 104.358H38.1447C34.4872 104.358 30.6172 103.12 26.5347 100.645C19.2198 95.2183 15.5636 88.2565 15.5663 79.7596C15.5663 74.3305 17.3127 69.1417 20.8055 64.1933C26.0195 58.2277 31.8537 55.2448 38.308 55.2448H39.5989C43.5194 55.2448 47.4969 56.4813 51.5316 58.9541C58.8439 64.2212 62.5001 71.1564 62.5001 79.7596V79.8393Z"
            fill="white"
          />
          <path
            d="M404.057 95.9992V40.6906L403.898 40.5312H388.654L388.415 40.6906V49.5634C382.017 42.7345 374.328 39.32 365.351 39.32C355.789 39.32 347.213 42.4928 339.625 48.8383C330.48 57.4415 325.91 67.6556 325.915 79.4807V79.5644C325.915 89.1264 328.979 97.7589 335.107 105.462C343.341 114.976 353.341 119.734 365.108 119.737H365.187C374.651 119.737 382.394 116.43 388.415 109.816C388.415 109.816 388.594 112.382 391.674 115.327C395.14 118.645 403.898 117.801 403.898 117.801L403.942 117.753H411.46V102.139C405.424 101.354 404.228 96.9673 404.057 95.9992ZM388.415 79.5644C388.415 86.5527 385.892 92.6272 380.845 97.7881C376.008 101.982 371.008 104.079 365.845 104.079H364.072C360.414 104.079 356.543 102.843 352.458 100.37C345.145 94.9407 341.489 87.9777 341.489 79.4807C341.489 74.0516 343.237 68.8641 346.732 63.9184C351.949 57.9501 357.782 54.966 364.231 54.966H365.522C369.445 54.966 373.429 56.2024 377.475 58.6752C384.787 63.9477 388.443 70.8828 388.443 79.4807L388.415 79.5644Z"
            fill="white"
          />
          <path
            d="M118.163 96.0829V0.0836708L118.08 0H102.661L102.581 0.0836708V108.095C102.677 110.618 103.678 113.023 105.402 114.868C107.133 116.694 109.47 117.827 111.976 118.056L118.064 118.088L118.111 118.04H125.594V102.418C118.789 101.525 118.163 96.0829 118.163 96.0829Z"
            fill="white"
          />
          <path
            d="M306.66 96.0829L306.452 96.059V69.2772C306.403 64.9739 305.411 60.7338 303.548 56.8545C297.625 46.1556 287.571 40.8061 273.388 40.8061H270.89C260.132 40.8061 251.691 43.9523 245.566 50.2447C239.167 43.955 230.753 40.8088 220.322 40.8061H219.597C216.7 40.7492 213.805 41.0165 210.967 41.603C206.505 42.8939 202.903 44.291 200.162 45.7943H200.082V41.4516L199.839 41.2125H184.759L184.516 41.4516V117.825L184.759 118.068H199.839L200.082 117.825V71.3729C200.082 65.5692 201.857 61.585 205.405 59.4203C208.146 57.3777 212.795 56.3565 219.35 56.3565H220.641C225.533 56.3565 229.405 57.3777 232.255 59.4203C235.973 61.516 237.833 65.4404 237.833 71.1936V117.809L237.992 118.052H253.132L253.295 117.809V69.839C253.268 68.0974 253.598 66.3687 254.263 64.7591C256.734 59.1812 262.164 56.3857 270.555 56.3724H273.698C276.764 56.3724 279.287 56.7217 281.268 57.4202C287.717 59.6222 290.943 63.6276 290.946 69.4366V107.868C290.946 107.868 290.548 110.856 293.313 114.386C296.014 117.837 300.643 118.068 300.643 118.068H306.265L306.297 118.02H314.07V102.418C307.289 101.525 306.66 96.0829 306.66 96.0829Z"
            fill="white"
          />
          <rect
            x="142.897"
            y="15.3392"
            width="23.1402"
            height="18.1679"
            fill="url(#pattern0)"
          />
        </g>
        <defs>
          <pattern
            id="pattern0"
            patternContentUnits="objectBoundingBox"
            width="1"
            height="1"
          >
            <use
              xlinkHref="#image0_1118_5821"
              transform="scale(0.00413223 0.00526316)"
            />
          </pattern>
          <clipPath id="clip0_1118_5821">
            <rect width="411.46" height="120" fill="white" />
          </clipPath>
          <image
            id="image0_1118_5821"
            width="242"
            height="190"
            xlinkHref="data:image/png;base64,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"
          />
        </defs>
      </svg>
    </Box>
  );
};

export default Logo;
export { LogoAlter };
